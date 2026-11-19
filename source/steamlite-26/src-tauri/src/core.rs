// The link to the core (the Node backend): one JSON message per line over its stdin / stdout. See core/shim/bridge.js for the other end.
use serde_json::{json, Value};
use std::collections::HashMap;
use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};
use std::process::{Child, ChildStdin, Command, Stdio};
use std::sync::atomic::{AtomicU16, AtomicU64, Ordering};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter, Manager};
use tokio::sync::oneshot;

pub struct Core {
    stdin: Mutex<Option<ChildStdin>>,
    pending: Mutex<HashMap<u64, oneshot::Sender<Result<Value, String>>>>,
    next: AtomicU64,
    pub protocol_port: AtomicU16,
    pub child: Mutex<Option<Child>>,
}

impl Core {
    pub fn new() -> Self {
        Core { stdin: Mutex::new(None), pending: Mutex::new(HashMap::new()), next: AtomicU64::new(1), protocol_port: AtomicU16::new(0), child: Mutex::new(None) }
    }

    pub fn write(&self, v: &Value) {
        if let Ok(mut g) = self.stdin.lock() {
            if let Some(s) = g.as_mut() {
                let mut line = v.to_string();
                line.push('\n');
                let _ = s.write_all(line.as_bytes());
                let _ = s.flush();
            }
        }
    }

    pub fn event(&self, name: &str, data: Value) {
        self.write(&json!({ "t": "event", "name": name, "data": data }));
    }

    pub fn native_res(&self, id: u64, res: Result<Value, String>) {
        match res {
            Ok(v) => self.write(&json!({ "t": "native-res", "id": id, "ok": true, "value": v })),
            Err(e) => self.write(&json!({ "t": "native-res", "id": id, "ok": false, "error": e })),
        }
    }

    pub async fn invoke(&self, ch: String, args: Vec<Value>) -> Result<Value, String> {
        let id = self.next.fetch_add(1, Ordering::SeqCst);
        let (tx, rx) = oneshot::channel();
        self.pending.lock().unwrap().insert(id, tx);
        self.write(&json!({ "t": "ipc", "id": id, "ch": ch, "args": args }));
        rx.await.map_err(|_| "The SteamLite core is not running.".to_string())?
    }

    pub fn send(&self, ch: String, args: Vec<Value>) {
        self.write(&json!({ "t": "send", "ch": ch, "args": args }));
    }

    fn finish(&self, id: u64, res: Result<Value, String>) {
        if let Some(tx) = self.pending.lock().unwrap().remove(&id) {
            let _ = tx.send(res);
        }
    }

    // whoever is still waiting for an answer when the core dies gets an error instead of waiting forever
    fn fail_all(&self) {
        let all: Vec<_> = self.pending.lock().unwrap().drain().collect();
        for (_, tx) in all {
            let _ = tx.send(Err("The SteamLite core stopped.".into()));
        }
    }
}

// where the core lives: next to the exe in an installed app, or in the project folder while developing
pub fn find_core_dir() -> Option<PathBuf> {
    if let Ok(p) = std::env::var("SL_CORE_DIR") {
        return Some(PathBuf::from(p));
    }
    let exe = std::env::current_exe().ok()?;
    let mut dir = exe.parent()?.to_path_buf();
    for _ in 0..6 {
        for cand in [dir.join("core"), dir.join("resources").join("core"), dir.join("lib").join("SteamLite").join("core"), dir.join("lib").join("steamlite").join("core")] {
            if cand.join("boot.js").exists() {
                return Some(cand);
            }
        }
        if !dir.pop() {
            break;
        }
    }
    None
}

fn find_node(core_dir: &Path) -> PathBuf {
    if let Ok(p) = std::env::var("SL_NODE") {
        return PathBuf::from(p);
    }
    if let Some(parent) = core_dir.parent() {
        for cand in [parent.join("node.exe"), core_dir.join("node.exe"), parent.join("node"), core_dir.join("node")] {
            if cand.exists() {
                return cand;
            }
        }
    }
    PathBuf::from("node")
}

pub fn start(app: &AppHandle, core: Arc<Core>, exe: &Path, version: &str, screen: Value, login_item: bool) -> Result<(), String> {
    let dir = find_core_dir().ok_or("Could not find the SteamLite core folder.")?;
    let mut cmd = Command::new(find_node(&dir));
    cmd.arg("boot.js").current_dir(&dir).stdin(Stdio::piped()).stdout(Stdio::piped()).stderr(Stdio::piped());
    cmd.env("SL_EXE", exe).env("SL_VERSION", version);
    if !cfg!(debug_assertions) {
        cmd.env("SL_PACKAGED", "1");
    }
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x0800_0000); // no console window
    }
    let mut child = cmd.spawn().map_err(|e| format!("Could not start the SteamLite core: {e}"))?;
    *core.stdin.lock().unwrap() = child.stdin.take();
    let stdout = child.stdout.take().ok_or("no core output")?;
    let stderr = child.stderr.take().ok_or("no core error output")?;
    *core.child.lock().unwrap() = Some(child);

    // the core's own messages (anything it prints) go to the log
    std::thread::spawn(move || {
        for line in BufReader::new(stderr).lines().map_while(Result::ok) {
            eprintln!("[core] {line}");
        }
    });

    let app2 = app.clone();
    let core2 = core.clone();
    std::thread::spawn(move || {
        for line in BufReader::new(stdout).lines().map_while(Result::ok) {
            let Ok(m) = serde_json::from_str::<Value>(&line) else { continue };
            match m["t"].as_str().unwrap_or("") {
                "ipc-res" => {
                    let id = m["id"].as_u64().unwrap_or(0);
                    if m["ok"].as_bool().unwrap_or(false) {
                        core2.finish(id, Ok(m["value"].clone()));
                    } else {
                        core2.finish(id, Err(m["error"].as_str().unwrap_or("failed").to_string()));
                    }
                }
                "emit" => {
                    let payload = json!({ "ch": m["ch"], "args": m["args"] });
                    let target = m["target"].as_str().unwrap_or("main").to_string();
                    let _ = app2.emit_to(target, "core-event", payload);
                }
                "native" => {
                    let id = m["id"].as_u64().unwrap_or(0);
                    let op = m["op"].as_str().unwrap_or("").to_string();
                    let args = m["args"].as_array().cloned().unwrap_or_default();
                    crate::native::dispatch(&app2, &core2, id, op, args);
                }
                _ => {}
            }
        }
        // the core's output ended: it stopped
        core2.fail_all();
        let _ = app2.emit("core-stopped", json!({}));
    });

    // tell the core the shell is up
    core.event("app-ready", json!({ "screen": screen, "loginItem": login_item }));
    let _ = app.state::<Arc<Core>>();
    Ok(())
}
