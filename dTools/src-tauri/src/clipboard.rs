use std::{path::Path, fs, rc::Rc};


#[derive(serde::Serialize, Default)]
pub struct ClipboardData {
    clip_type: i8,
    text_content: String,
    file_path: String,
    content_md5: String,
}

impl ClipboardData {
    fn new(clip_type: i8, text_content: String, file_path: String, content_md5: String) -> Self {
        Self {
            clip_type,
            text_content,
            file_path,
            content_md5,
        }
    }
}
/**
 * 读取剪切板
 */
#[tauri::command]
pub fn read_clipboard(
    app_handle: tauri::AppHandle,
    current_md5: String,
) -> Result<ClipboardData, String> {
    let mut clipboard = clippers::Clipboard::get();
    match clipboard.read() {
        // 普通文本
        Some(clippers::ClipperData::Text(text)) => {
            let text = Rc::new(text);
            return Ok(ClipboardData::new(
                1,
                text.clone().to_string(),
                "".to_string(),
                format!("{:x}", md5::compute(text.clone().to_string().as_bytes())),
            ));
        }
        // 图片
        Some(clippers::ClipperData::Image(image)) => {
            let row_data = image.as_raw().rgba();
            let file_md5 = md5::compute(row_data);
            if format!("{:x}", file_md5).to_string().eq(&current_md5) {
                return Ok(ClipboardData::default());
            }
            let mut cache_dir = app_handle.path_resolver().app_cache_dir().unwrap();
            if !cache_dir.exists() {
                fs::create_dir(cache_dir.clone()).unwrap();
            }
            cache_dir = cache_dir.join("imgs");
            if !cache_dir.exists() {
                fs::create_dir(cache_dir.clone()).unwrap();
            }
            let path_str = format!("{}/{:x}.png", cache_dir.to_str().unwrap(), file_md5);
            let img_temp_path = Path::new(path_str.as_str());
            if !img_temp_path.exists() {
                image.save(img_temp_path).unwrap();
            }
            return Ok(ClipboardData::new(
                2,
                "".to_string(),
                path_str,
                format!("{:x}", file_md5),
            ));
        }
        _ => {
            return Err("unsupported".to_string());
        }
    }
}
/**
 * 写入剪切板
 */
#[tauri::command]
pub fn write_clipboard(content: String, clip_type: i8) -> Result<(), String> {
    let mut clipboard = clippers::Clipboard::get();
    match clip_type {
        // 写入文字
        1 => {
            clipboard.write_text(content.clone()).unwrap();
        }
        // 写入图片
        2 => {
            use image::io::Reader as ImageReader;
            let image = ImageReader::open(Path::new(content.as_str()))
                .unwrap()
                .decode()
                .unwrap();
            clipboard
                .write_image(image.width(), image.height(), image.as_bytes())
                .unwrap();
        }
        _ => {}
    }

    Ok(())
}