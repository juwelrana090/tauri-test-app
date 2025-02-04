use std::fs;
use std::path::PathBuf;
use dirs_next::download_dir; 
use tokio::task::spawn_blocking;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app
                    .handle()
                    .plugin(
                        tauri_plugin_log::Builder::default().level(log::LevelFilter::Info).build()
                    )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![blur, gray, crop, flip, brighten])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn get_output_path(file_name: &str) -> String {
    let download_dir = download_dir()
        .unwrap_or_else(|| dirs_next::home_dir().unwrap_or_else(|| PathBuf::from("./")))
        .to_str()
        .unwrap()
        .to_string();

    format!("{}/{}", download_dir, file_name)
}

#[tauri::command]
async fn blur(path: String) -> Result<String, String> {
    let output_path = get_output_path("edited.jpg");
    spawn_blocking(move || {
        let data = fs::read(&path).map_err(|e| format!("Error reading file: {}", e))?;
        let image = image::load_from_memory(&data).map_err(|e| format!("Error loading image: {}", e))?;
        let blurred_image = image.blur(10.0);
        blurred_image.save(&output_path).map_err(|e| format!("Error saving blurred image: {}", e))?;
        Ok(output_path)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn gray(path: String) -> Result<String, String> {
    let output_path = get_output_path("edited.jpg");
    spawn_blocking(move || {
        let data = fs::read(&path).map_err(|e| format!("Error reading file: {}", e))?;
        let image = image::load_from_memory(&data).map_err(|e| format!("Error loading image: {}", e))?;
        let gray_image = image.grayscale();
        gray_image.save(&output_path).map_err(|e| format!("Error saving grayscale image: {}", e))?;
        Ok(output_path)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn crop(path: String) -> Result<String, String> {
    let output_path = get_output_path("edited.jpg");
    spawn_blocking(move || {
        let data = fs::read(&path).map_err(|e| format!("Error reading file: {}", e))?;
        let mut image = image::load_from_memory(&data).map_err(|e| format!("Error loading image: {}", e))?;
        let cropped_image = image.crop(10, 10, 40, 50);
        cropped_image.save(&output_path).map_err(|e| format!("Error saving cropped image: {}", e))?;
        Ok(output_path)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn flip(path: String) -> Result<String, String> {
    let output_path = get_output_path("edited.jpg");
    spawn_blocking(move || {
        let data = fs::read(&path).map_err(|e| format!("Error reading file: {}", e))?;
        let image = image::load_from_memory(&data).map_err(|e| format!("Error loading image: {}", e))?;
        let flipped_image = image.fliph();
        flipped_image.save(&output_path).map_err(|e| format!("Error saving flipped image: {}", e))?;
        Ok(output_path)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn brighten(value: i32, path: String) -> Result<String, String> {
    let output_path = get_output_path("edited.jpg");
    spawn_blocking(move || {
        let data = fs::read(&path).map_err(|e| format!("Error reading file: {}", e))?;
        let image = image::load_from_memory(&data).map_err(|e| format!("Error loading image: {}", e))?;
        let brightened_image = image.brighten(value);
        brightened_image.save(&output_path).map_err(|e| format!("Error saving brightened image: {}", e))?;
        Ok(output_path)
    })
    .await
    .map_err(|e| e.to_string())?
}
