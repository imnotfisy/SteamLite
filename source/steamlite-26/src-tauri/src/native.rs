// Everything native that the core can ask for: windows, tray, dialogs, shortcuts, notifications, pictures.
use crate::core::Core;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

#[derive(Default)]
pub struct NativeState {
    pub tray: Mutex<Option<TrayIcon>>,
    pub window_opts: Mutex<HashMap<String, Value>>,
    pub relaunch: Mutex<bool>,
    pub allow_close: Mutex<bool>,
}

fn s(v: &Value, i: usize) -> String {
    v.get(i).and_then(|x| x.as_str()).unwrap_or("").to_string()
}

fn win(app: &AppHandle, label: &str) -> Option<tauri::WebviewWindow> {
    app.get_webview_window(label)
}

pub fn init_script(app: &AppHandle) -> String {
    let cfg = crate::read_config();
    let edition = std::env::var("SL_EDITION").ok().filter(|e| e == "lite" || e == "full").or_else(|| cfg["edition"].as_str().map(|e| e.to_string())).unwrap_or_else(|| "full".into());
    let version = app.package_info().version.to_string();
    let beta = version.to_lowercase().contains("beta") && std::env::var("SL_PROGRESS").is_err();
    let debug = std::env::var("SL_DEBUG").is_ok() && beta;
    format!(
        "window.__SL={{edition:{},betaBuild:{},debug:{},version:{},mock:{}}};{}",
        json!(if edition == "lite" { "lite" } else { "full" }),
        beta,
        debug,
        json!(version),
        std::env::var("SL_MOCK").is_ok(),
        include_str!("../../ui/sl-bridge.js")
    )
}

// the page for a file the old code asked a window to load
fn page_for(file: &str) -> String {
    match file {
        "index.dev.html" => "index.html".into(),
        other => other.to_string(),
    }
}

fn build_menu_items(app: &AppHandle, items: &[Value], menu: &Menu<tauri::Wry>) -> Result<(), String> {
    for it in items {
        if it["type"].as_str() == Some("separator") {
            let sep = PredefinedMenuItem::separator(app).map_err(|e| e.to_string())?;
            menu.append(&sep).map_err(|e| e.to_string())?;
        } else if let Some(sub) = it["submenu"].as_array() {
            let sm = Submenu::new(app, it["label"].as_str().unwrap_or(""), it["enabled"].as_bool().unwrap_or(true)).map_err(|e| e.to_string())?;
            for x in sub {
                if x["type"].as_str() == Some("separator") {
                    sm.append(&PredefinedMenuItem::separator(app).map_err(|e| e.to_string())?).map_err(|e| e.to_string())?;
                } else {
                    let mi = MenuItem::with_id(app, x["id"].as_str().unwrap_or("x"), x["label"].as_str().unwrap_or(""), x["enabled"].as_bool().unwrap_or(true), None::<&str>).map_err(|e| e.to_string())?;
                    sm.append(&mi).map_err(|e| e.to_string())?;
                }
            }
            menu.append(&sm).map_err(|e| e.to_string())?;
        } else {
            let mi = MenuItem::with_id(app, it["id"].as_str().unwrap_or("x"), it["label"].as_str().unwrap_or(""), it["enabled"].as_bool().unwrap_or(true), None::<&str>).map_err(|e| e.to_string())?;
            menu.append(&mi).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

fn tray_image(spec: &Value) -> Option<tauri::image::Image<'static>> {
    if let Some(p) = spec["path"].as_str() {
        return tauri::image::Image::from_path(p).ok();
    }
    if let Some(b64) = spec["png"].as_str() {
        use base64::Engine;
        let bytes = base64::engine::general_purpose::STANDARD.decode(b64).ok()?;
        return tauri::image::Image::from_bytes(&bytes).ok().map(|i| i.to_owned());
    }
    None
}

fn accelerator(a: &str) -> String {
    a.split('+')
        .map(|p| match p {
            "Plus" => "Equal",
            other => other,
        })
        .collect::<Vec<_>>()
        .join("+")
}

pub fn dispatch(app: &AppHandle, core: &Arc<Core>, id: u64, op: String, args: Vec<Value>) {
    let app = app.clone();
    let core = core.clone();
    let a = Value::Array(args);
    // the slow ones (dialogs, picture work) get their own thread so messages keep flowing
    std::thread::spawn(move || {
        let r = run(&app, &core, &op, &a);
        core.native_res(id, r);
    });
}

fn run(app: &AppHandle, core: &Arc<Core>, op: &str, a: &Value) -> Result<Value, String> {
    let st = app.state::<NativeState>();
    match op {
        "exit" => {
            if *st.relaunch.lock().unwrap() {
                if let Ok(exe) = std::env::current_exe() {
                    // start the new copy a moment after this one has gone, so the single-instance check does not turn it away
                    let cmd = format!("ping 127.0.0.1 -n 3 >nul & start \"\" \"{}\"", exe.display());
                    let mut c = std::process::Command::new("cmd");
                    c.args(["/C", &cmd]);
                    #[cfg(windows)]
                    {
                        use std::os::windows::process::CommandExt;
                        c.creation_flags(0x0800_0000);
                    }
                    let _ = c.spawn();
                }
            }
            *st.allow_close.lock().unwrap() = true;
            app.exit(0);
            Ok(Value::Null)
        }
        "relaunchOnExit" => { *st.relaunch.lock().unwrap() = true; Ok(Value::Null) }
        "autostart" => {
            use tauri_plugin_autostart::ManagerExt;
            let on = a[0].as_bool().unwrap_or(false);
            let m = app.autolaunch();
            let _ = if on { m.enable() } else { m.disable() };
            Ok(Value::Null)
        }
        "protocolPort" => { core.protocol_port.store(a[1].as_u64().unwrap_or(0) as u16, std::sync::atomic::Ordering::SeqCst); Ok(Value::Null) }
        "clearCache" => { if let Some(w) = win(app, "main") { let _ = w.clear_all_browsing_data(); } Ok(Value::Null) }

        // ---- windows ----
        "createWindow" => { st.window_opts.lock().unwrap().insert(s(a, 0), a[1].clone()); Ok(Value::Null) }
        "load" => {
            let label = s(a, 0);
            let page = page_for(&s(a, 1));
            let page = format!("{}{}", page, s(a, 2));
            if label == "main" {
                if let Some(w) = win(app, "main") {
                    let cur = w.url().map(|u| format!("{}{}", u.path().trim_start_matches('/'), u.query().map(|q| format!("?{q}")).unwrap_or_default())).unwrap_or_default();
                    if cur != page {
                        let _ = w.eval(&format!("location.replace({})", json!(format!("/{page}"))));
                    }
                }
            } else {
                let o = st.window_opts.lock().unwrap().get(&label).cloned().unwrap_or(Value::Null);
                if win(app, &label).is_none() {
                    let mut b = WebviewWindowBuilder::new(app, &label, WebviewUrl::App(page.into()))
                        .title("SteamLite")
                        .decorations(false)
                        .visible(false)
                        .initialization_script(&init_script(app))
                        .additional_browser_args(&crate::browser_args())
                        .inner_size(o["width"].as_f64().unwrap_or(300.0), o["height"].as_f64().unwrap_or(200.0))
                        .transparent(o["transparent"].as_bool().unwrap_or(false))
                        .always_on_top(o["alwaysOnTop"].as_bool().unwrap_or(false))
                        .skip_taskbar(o["skipTaskbar"].as_bool().unwrap_or(false))
                        .focusable(o["focusable"].as_bool().unwrap_or(true))
                        .resizable(o["resizable"].as_bool().unwrap_or(true))
                        .shadow(o["shadow"].as_bool().unwrap_or(true));
                    if let (Some(x), Some(y)) = (o["x"].as_f64(), o["y"].as_f64()) { b = b.position(x, y); }
                    b.build().map_err(|e| e.to_string())?;
                }
            }
            Ok(Value::Null)
        }
        // put the main window back where it was, but only if that spot is still on a screen (a monitor may have been unplugged)
        "setPosition" => {
            let (x, y) = (a[0]["x"].as_i64().unwrap_or(0) as i32, a[0]["y"].as_i64().unwrap_or(0) as i32);
            if let Some(w) = win(app, "main") {
                let on_screen = w.available_monitors().map(|ms| ms.iter().any(|m| { let (p, s) = (m.position(), m.size()); x + 100 > p.x && x < p.x + s.width as i32 - 100 && y >= p.y - 10 && y < p.y + s.height as i32 - 60 })).unwrap_or(false);
                if on_screen { let _ = w.set_position(tauri::PhysicalPosition::new(x, y)); }
            }
            Ok(Value::Null)
        }
        // Pauses the page completely (no scripts, no drawing, almost no CPU or GPU, and the browser gives memory back) while a game is running in front of it; Resume wakes it
        "webviewSuspend" => {
            let on = a[0].as_bool().unwrap_or(false);
            #[cfg(windows)]
            if let Some(w) = win(app, "main") {
                let _ = w.with_webview(move |wv| unsafe {
                    use webview2_com::Microsoft::Web::WebView2::Win32::{ICoreWebView2TrySuspendCompletedHandler, ICoreWebView2_3};
                    use windows::core::Interface;
                    let ctl = wv.controller();
                    if let Ok(core) = ctl.CoreWebView2() {
                        if let Ok(c3) = core.cast::<ICoreWebView2_3>() {
                            if on { let _ = ctl.SetIsVisible(false); let _ = c3.TrySuspend(None::<&ICoreWebView2TrySuspendCompletedHandler>); }
                            else { let _ = c3.Resume(); let _ = ctl.SetIsVisible(true); }
                        }
                    }
                });
            }
            let _ = on;
            Ok(Value::Null)
        }
        "loadUrl" => Ok(Value::Null),
        "show" | "showInactive" | "hide" | "focus" | "minimize" | "restore" | "maximize" | "fullscreen" | "ignoreMouse" | "alwaysOnTop" | "zoom" | "reload" | "devtools" | "closeWindow" => {
            let label = s(a, 0);
            // a window that has not been created yet (the widget is built when it loads a page) simply has nothing to do
            let Some(w) = win(app, &label) else { return Ok(Value::Null) };
            match op {
                "show" => { let _ = w.show(); let _ = w.unminimize(); let _ = w.set_focus(); }
                "showInactive" => { let _ = w.show(); }
                "hide" => { let _ = w.hide(); }
                "focus" => { let _ = w.set_focus(); }
                "minimize" => { let _ = w.minimize(); }
                "restore" => { let _ = w.unminimize(); let _ = w.show(); let _ = w.set_focus(); }
                "maximize" => { let _ = w.maximize(); }
                "fullscreen" => { let _ = w.set_fullscreen(a[1].as_bool().unwrap_or(false)); }
                "ignoreMouse" => { let _ = w.set_ignore_cursor_events(a[1].as_bool().unwrap_or(false)); }
                "alwaysOnTop" => { let _ = w.set_always_on_top(a[1].as_bool().unwrap_or(false)); }
                "zoom" => { let _ = w.set_zoom(a[1].as_f64().unwrap_or(1.0)); }
                "reload" => { let _ = w.eval("location.reload()"); }
                "devtools" => { #[cfg(debug_assertions)] w.open_devtools(); }
                _ => { if label == "main" { *st.allow_close.lock().unwrap() = true; } let _ = w.destroy(); }
            }
            Ok(Value::Null)
        }

        // ---- tray ----
        "trayCreate" => {
            let mut b = TrayIconBuilder::with_id("main").show_menu_on_left_click(false);
            if let Some(img) = tray_image(&a[0]) { b = b.icon(img); }
            let c1 = core.clone();
            let c2 = core.clone();
            let t = b
                .on_tray_icon_event(move |_t, ev| {
                    if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = ev { c1.event("tray-click", json!({})); }
                })
                .on_menu_event(move |_app, ev| { c2.event("tray-menu", json!({ "id": ev.id().0 })); })
                .build(app)
                .map_err(|e| e.to_string())?;
            *st.tray.lock().unwrap() = Some(t);
            Ok(Value::Null)
        }
        "trayTooltip" => { if let Some(t) = st.tray.lock().unwrap().as_ref() { let _ = t.set_tooltip(Some(s(a, 0))); } Ok(Value::Null) }
        "trayIcon" => { if let (Some(t), Some(img)) = (st.tray.lock().unwrap().as_ref(), tray_image(&a[0])) { let _ = t.set_icon(Some(img)); } Ok(Value::Null) }
        "trayMenu" => {
            if let Some(items) = a[0].as_array() {
                let menu = Menu::new(app).map_err(|e| e.to_string())?;
                build_menu_items(app, items, &menu)?;
                if let Some(t) = st.tray.lock().unwrap().as_ref() { let _ = t.set_menu(Some(menu)); }
            }
            Ok(Value::Null)
        }
        "trayDestroy" => { *st.tray.lock().unwrap() = None; Ok(Value::Null) }

        // ---- dialogs ----
        "dialogOpen" => {
            use tauri_plugin_dialog::DialogExt;
            let o = &a[0];
            let mut d = app.dialog().file();
            if let Some(t) = o["title"].as_str() { d = d.set_title(t); }
            if let Some(p) = o["defaultPath"].as_str() { let pb = std::path::Path::new(p); d = d.set_directory(if pb.is_dir() { pb } else { pb.parent().unwrap_or(pb) }); }
            if let Some(fs) = o["filters"].as_array() {
                for f in fs {
                    let exts: Vec<String> = f["extensions"].as_array().map(|x| x.iter().filter_map(|e| e.as_str().map(|s| s.to_string())).collect()).unwrap_or_default();
                    let refs: Vec<&str> = exts.iter().map(|e| e.as_str()).collect();
                    if !refs.is_empty() && !refs.contains(&"*") { d = d.add_filter(f["name"].as_str().unwrap_or("Files"), &refs); }
                }
            }
            let props: Vec<&str> = o["properties"].as_array().map(|x| x.iter().filter_map(|p| p.as_str()).collect()).unwrap_or_default();
            let paths: Vec<String> = if props.contains(&"openDirectory") {
                if props.contains(&"multiSelections") { d.blocking_pick_folders().unwrap_or_default().into_iter().filter_map(|p| p.into_path().ok()).map(|p| p.display().to_string()).collect() }
                else { d.blocking_pick_folder().and_then(|p| p.into_path().ok()).map(|p| vec![p.display().to_string()]).unwrap_or_default() }
            } else if props.contains(&"multiSelections") {
                d.blocking_pick_files().unwrap_or_default().into_iter().filter_map(|p| p.into_path().ok()).map(|p| p.display().to_string()).collect()
            } else {
                d.blocking_pick_file().and_then(|p| p.into_path().ok()).map(|p| vec![p.display().to_string()]).unwrap_or_default()
            };
            Ok(json!(paths))
        }
        "dialogSave" => {
            use tauri_plugin_dialog::DialogExt;
            let o = &a[0];
            let mut d = app.dialog().file();
            if let Some(t) = o["title"].as_str() { d = d.set_title(t); }
            if let Some(p) = o["defaultPath"].as_str() {
                let pb = std::path::Path::new(p);
                if let Some(dir) = pb.parent() { d = d.set_directory(dir); }
                if let Some(n) = pb.file_name().and_then(|n| n.to_str()) { d = d.set_file_name(n); }
            }
            if let Some(fs) = o["filters"].as_array() {
                for f in fs {
                    let exts: Vec<String> = f["extensions"].as_array().map(|x| x.iter().filter_map(|e| e.as_str().map(|s| s.to_string())).collect()).unwrap_or_default();
                    let refs: Vec<&str> = exts.iter().map(|e| e.as_str()).collect();
                    if !refs.is_empty() && !refs.contains(&"*") { d = d.add_filter(f["name"].as_str().unwrap_or("Files"), &refs); }
                }
            }
            Ok(d.blocking_save_file().and_then(|p| p.into_path().ok()).map(|p| json!(p.display().to_string())).unwrap_or(Value::Null))
        }
        "dialogMessage" => {
            use tauri_plugin_dialog::DialogExt;
            let o = &a[0];
            let ok = app.dialog().message(o["message"].as_str().unwrap_or("")).title(o["title"].as_str().unwrap_or("SteamLite")).blocking_show();
            Ok(json!(if ok { 0 } else { 1 }))
        }

        // ---- opening things ----
        "openExternal" => { use tauri_plugin_opener::OpenerExt; app.opener().open_url(s(a, 0), None::<&str>).map_err(|e| e.to_string())?; Ok(Value::Null) }
        "openPath" => { use tauri_plugin_opener::OpenerExt; app.opener().open_path(s(a, 0), None::<&str>).map_err(|e| e.to_string())?; Ok(Value::Null) }
        "showInFolder" => { use tauri_plugin_opener::OpenerExt; app.opener().reveal_item_in_dir(s(a, 0)).map_err(|e| e.to_string())?; Ok(Value::Null) }
        "notify" => {
            use tauri_plugin_notification::NotificationExt;
            let o = &a[0];
            app.notification().builder().title(o["title"].as_str().unwrap_or("SteamLite")).body(o["body"].as_str().unwrap_or("")).show().map_err(|e| e.to_string())?;
            Ok(Value::Null)
        }

        // ---- shortcuts ----
        "shortcutRegister" => {
            use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};
            let acc = s(a, 0);
            let c = core.clone();
            let acc2 = acc.clone();
            let r = app.global_shortcut().on_shortcut(accelerator(&acc).as_str(), move |_app, _sc, ev| {
                if ev.state() == ShortcutState::Pressed { c.event("shortcut", json!({ "accelerator": acc2 })); }
            });
            Ok(json!(r.is_ok()))
        }
        "shortcutClear" => { use tauri_plugin_global_shortcut::GlobalShortcutExt; let _ = app.global_shortcut().unregister_all(); Ok(Value::Null) }

        // ---- pictures ----
        "imageJpeg" => crate::imgops::jpeg(&a[0]),
        "imageTint" => crate::imgops::tint(&a[0]),
        _ => Err(format!("Unknown native request: {op}")),
    }
}
