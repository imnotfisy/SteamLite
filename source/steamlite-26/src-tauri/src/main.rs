#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod core;
mod imgops;
mod native;

use core::Core;
use native::NativeState;
use serde_json::{json, Value};
use std::io::{Read, Write};
use std::net::TcpStream;
use std::sync::Arc;
use std::time::Duration;
use tauri::{Manager, RunEvent, WebviewUrl, WebviewWindowBuilder, WindowEvent};

// the saved settings (the same file the old app used), read early for things that must be decided before the window exists
pub fn read_config() -> Value {
    let base = std::env::var("SL_USERDATA").map(std::path::PathBuf::from).unwrap_or_else(|_| {
        std::path::PathBuf::from(std::env::var("APPDATA").unwrap_or_default()).join("SteamLite-DEV")
    });
    std::fs::read_to_string(base.join("config.json")).ok().and_then(|t| serde_json::from_str(t.trim_start_matches('\u{feff}')).ok()).unwrap_or(Value::Null)
}

#[tauri::command]
async fn core_invoke(core: tauri::State<'_, Arc<Core>>, ch: String, args: Vec<Value>) -> Result<Value, String> {
    core.invoke(ch, args).await
}

#[tauri::command]
fn core_send(core: tauri::State<'_, Arc<Core>>, ch: String, args: Vec<Value>) {
    core.send(ch, args);
}

// the steamlite:// pictures (game covers, screenshots) are served by the core on a loopback port; the window asks the shell, the shell asks the core
fn proxy(port: u16, original: &str) -> tauri::http::Response<Vec<u8>> {
    let fail = |code: u16| tauri::http::Response::builder().status(code).body(Vec::new()).unwrap();
    if port == 0 { return fail(503); }
    let Ok(mut s) = TcpStream::connect(("127.0.0.1", port)) else { return fail(502) };
    let _ = s.set_read_timeout(Some(Duration::from_secs(30)));
    let enc = percent_encoding::utf8_percent_encode(original, percent_encoding::NON_ALPHANUMERIC).to_string();
    if s.write_all(format!("GET /?u={enc} HTTP/1.0\r\nHost: localhost\r\n\r\n").as_bytes()).is_err() { return fail(502); }
    let mut raw = Vec::new();
    let _ = s.read_to_end(&mut raw);
    let Some(split) = raw.windows(4).position(|w| w == b"\r\n\r\n") else { return fail(502) };
    let head = String::from_utf8_lossy(&raw[..split]).to_string();
    let body = raw[split + 4..].to_vec();
    let mut lines = head.lines();
    let status: u16 = lines.next().and_then(|l| l.split_whitespace().nth(1)).and_then(|c| c.parse().ok()).unwrap_or(502);
    let mut b = tauri::http::Response::builder().status(status);
    for l in lines {
        if let Some((k, v)) = l.split_once(':') {
            let k = k.trim().to_lowercase();
            if k == "content-type" || k == "access-control-allow-origin" || k == "cache-control" { b = b.header(k, v.trim()); }
        }
    }
    b.body(body).unwrap_or_else(|_| fail(502))
}

#[cfg(windows)]
fn work_area() -> Value {
    use windows_sys::Win32::Foundation::RECT;
    use windows_sys::Win32::UI::WindowsAndMessaging::{GetSystemMetrics, SystemParametersInfoW, SM_CXSCREEN, SM_CYSCREEN, SPI_GETWORKAREA};
    let mut r = RECT { left: 0, top: 0, right: 1920, bottom: 1040 };
    unsafe { SystemParametersInfoW(SPI_GETWORKAREA, 0, &mut r as *mut _ as *mut _, 0); }
    let (w, h) = unsafe { (GetSystemMetrics(SM_CXSCREEN), GetSystemMetrics(SM_CYSCREEN)) };
    json!({ "workArea": { "x": r.left, "y": r.top, "width": r.right - r.left, "height": r.bottom - r.top }, "bounds": { "x": 0, "y": 0, "width": w, "height": h }, "scaleFactor": 1 })
}
#[cfg(not(windows))]
fn work_area() -> Value { json!({ "workArea": { "x": 0, "y": 0, "width": 1920, "height": 1040 }, "bounds": { "x": 0, "y": 0, "width": 1920, "height": 1080 }, "scaleFactor": 1 }) }

#[cfg(windows)]
fn idle_seconds() -> u64 {
    use windows_sys::Win32::System::SystemInformation::GetTickCount;
    use windows_sys::Win32::UI::Input::KeyboardAndMouse::{GetLastInputInfo, LASTINPUTINFO};
    let mut li = LASTINPUTINFO { cbSize: std::mem::size_of::<LASTINPUTINFO>() as u32, dwTime: 0 };
    unsafe {
        if GetLastInputInfo(&mut li) != 0 { (GetTickCount().wrapping_sub(li.dwTime) / 1000) as u64 } else { 0 }
    }
}
#[cfg(not(windows))]
fn idle_seconds() -> u64 { 0 }

// the web view switches (the same ones the old app used, plus window dragging): every window must be given the same set
pub fn browser_args() -> String {
    let cfg = read_config();
    let low_memory = cfg["featSettings"]["lowMemory"].as_bool().unwrap_or(false) && std::env::var("SL_NO_MEMSAVER").is_err();
    let mut args = vec!["--enable-features=msWebView2EnableDraggableRegions".to_string(), "--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection,Translate,MediaRouter,OptimizationHints".to_string(), "--disable-background-networking".to_string(), "--no-pings".to_string()];
    if low_memory { args.push("--disable-gpu".into()); args.push("--in-process-gpu".into()); }
    if std::env::var("SL_CDP").is_ok() { args.push("--remote-debugging-port=9222".into()); args.push("--remote-allow-origins=*".into()); }
    args.join(" ")
}

fn main() {

    let core = Arc::new(Core::new());
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(w) = app.get_webview_window("main") { let _ = w.show(); let _ = w.unminimize(); let _ = w.set_focus(); }
            if let Some(c) = app.try_state::<Arc<Core>>() { c.event("second-instance", json!({})); }
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(tauri_plugin_autostart::MacosLauncher::LaunchAgent, None))
        .manage(core.clone())
        .manage(NativeState::default())
        .invoke_handler(tauri::generate_handler![core_invoke, core_send])
        .register_asynchronous_uri_scheme_protocol("steamlite", |ctx, req, responder| {
            let port = ctx.app_handle().state::<Arc<Core>>().protocol_port.load(std::sync::atomic::Ordering::SeqCst);
            let original = format!("steamlite:/{}", req.uri().path());
            std::thread::spawn(move || responder.respond(proxy(port, &original)));
        })
        .on_page_load(|webview, payload| {
            if let tauri::webview::PageLoadEvent::Finished = payload.event() {
                if let Some(c) = webview.app_handle().try_state::<Arc<Core>>() { c.event("ui-ready", json!({ "label": webview.label() })); }
            }
        })
        .on_window_event(|window, event| {
            let label = window.label().to_string();
            let Some(core) = window.app_handle().try_state::<Arc<Core>>() else { return };
            match event {
                WindowEvent::CloseRequested { api, .. } => {
                    let allow = *window.state::<NativeState>().allow_close.lock().unwrap();
                    if !allow {
                        // the core decides: hide to the tray, or really quit
                        api.prevent_close();
                        core.event("close-requested", json!({ "label": label }));
                    }
                }
                WindowEvent::Focused(f) => core.event("window-state", json!({ "label": label, "state": { "focused": f } })),
                WindowEvent::Resized(_) | WindowEvent::Moved(_) => {
                    core.event("window-state", json!({ "label": label, "state": { "minimized": window.is_minimized().unwrap_or(false), "fullscreen": window.is_fullscreen().unwrap_or(false), "visible": window.is_visible().unwrap_or(true), "pos": window.outer_position().map(|p| json!({ "x": p.x, "y": p.y })).unwrap_or(Value::Null) } }));
                }
                WindowEvent::Destroyed => { if label != "main" { core.event("window-closed", json!({ "label": label })); } }
                _ => {}
            }
        })
        .setup(move |app| {
            let handle = app.handle().clone();
            let entry = "index.html";
            let script = native::init_script(&handle);
            WebviewWindowBuilder::new(app, "main", WebviewUrl::App(entry.into()))
                .title("SteamLite")
                .inner_size(1180.0, 720.0)
                .resizable(false).maximizable(false)
                .decorations(false)
                .devtools(false)
                .visible(false)
                .center()
                .background_color(tauri::window::Color(11, 12, 16, 255))
                .initialization_script(&script)
                .additional_browser_args(&browser_args())
                .build()?;

            let exe = std::env::current_exe().unwrap_or_default();
            let version = handle.package_info().version.to_string();
            let login_item = { use tauri_plugin_autostart::ManagerExt; handle.autolaunch().is_enabled().unwrap_or(false) };
            let c = handle.state::<Arc<Core>>().inner().clone();
            core::start(&handle, c.clone(), &exe, &version, work_area(), login_item).map_err(|e| Box::<dyn std::error::Error>::from(e))?;

            // how long the PC has been idle (the core's play-time tracking asks for it)
            std::thread::spawn(move || loop {
                c.event("idle", json!({ "seconds": idle_seconds() }));
                std::thread::sleep(Duration::from_secs(5));
            });
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building SteamLite");

    app.run(|handle, event| {
        if let RunEvent::Exit = event {
            if let Some(c) = handle.try_state::<Arc<Core>>() {
                if let Some(mut ch) = c.child.lock().unwrap().take() { let _ = ch.kill(); }
            }
        }
    });
}
