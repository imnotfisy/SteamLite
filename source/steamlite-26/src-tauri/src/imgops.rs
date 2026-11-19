// Picture work for the core (what Electron's nativeImage used to do).
use base64::Engine;
use image::{imageops::FilterType, DynamicImage, ImageEncoder};
use serde_json::{json, Value};

fn b64(bytes: &[u8]) -> String {
    base64::engine::general_purpose::STANDARD.encode(bytes)
}

// a picture file -> JPEG no wider than maxWidth, with the quality lowered until it fits in maxBytes
pub fn jpeg(o: &Value) -> Result<Value, String> {
    let path = o["path"].as_str().ok_or("no path")?;
    let max_w = o["maxWidth"].as_u64().unwrap_or(1280) as u32;
    let mut q = o["quality"].as_u64().unwrap_or(82) as u8;
    let max_bytes = o["maxBytes"].as_u64().unwrap_or(900_000) as usize;
    let mut img = image::open(path).map_err(|e| e.to_string())?;
    if img.width() > max_w {
        img = img.resize(max_w, u32::MAX, FilterType::Lanczos3);
    }
    let rgb = img.to_rgb8();
    loop {
        let mut buf = Vec::new();
        image::codecs::jpeg::JpegEncoder::new_with_quality(&mut buf, q).write_image(rgb.as_raw(), rgb.width(), rgb.height(), image::ExtendedColorType::Rgb8).map_err(|e| e.to_string())?;
        if buf.len() <= max_bytes || q <= 30 {
            return Ok(json!(b64(&buf)));
        }
        q = q.saturating_sub(15).max(30);
    }
}

// the app icon with its colours turned by `deg` degrees (the same maths the old tray-icon code used), as a PNG
pub fn tint(o: &Value) -> Result<Value, String> {
    let path = o["path"].as_str().ok_or("no path")?;
    let size = o["size"].as_u64().unwrap_or(32) as u32;
    let deg = o["deg"].as_f64().unwrap_or(0.0);
    let img: DynamicImage = image::open(path).map_err(|e| e.to_string())?;
    let mut rgba = img.resize_exact(size, size, FilterType::Lanczos3).to_rgba8();
    if deg != 0.0 {
        let h = deg / 360.0;
        for px in rgba.pixels_mut() {
            let [r8, g8, b8, a] = px.0;
            if a == 0 { continue; }
            let (r, g, b) = (r8 as f64 / 255.0, g8 as f64 / 255.0, b8 as f64 / 255.0);
            let mx = r.max(g).max(b);
            let mn = r.min(g).min(b);
            let l = (mx + mn) / 2.0;
            let dl = mx - mn;
            let mut s = if dl == 0.0 { 0.0 } else { dl / (1.0 - (2.0 * l - 1.0).abs()) };
            s = s.max(0.55).min(1.0); // keep the tint visible even on a pale icon
            let q = if l < 0.5 { l * (1.0 + s) } else { l + s - l * s };
            let p = 2.0 * l - q;
            let f = |t: f64| {
                let t = (t + 1.0) % 1.0;
                if t < 1.0 / 6.0 { p + (q - p) * 6.0 * t } else if t < 0.5 { q } else if t < 2.0 / 3.0 { p + (q - p) * (2.0 / 3.0 - t) * 6.0 } else { p }
            };
            px.0 = [(f(h + 1.0 / 3.0) * 255.0).round() as u8, (f(h) * 255.0).round() as u8, (f(h - 1.0 / 3.0) * 255.0).round() as u8, a];
        }
    }
    let mut buf = Vec::new();
    image::codecs::png::PngEncoder::new(&mut buf).write_image(rgba.as_raw(), rgba.width(), rgba.height(), image::ExtendedColorType::Rgba8).map_err(|e| e.to_string())?;
    Ok(json!(b64(&buf)))
}
