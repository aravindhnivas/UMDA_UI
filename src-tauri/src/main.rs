// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use portpicker::pick_unused_port;
use tauri_plugin_window_state;


// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_tcp_port() -> u16 {
    let port: u16 = pick_unused_port().expect("No ports free");
    return port;
}

mod download;

#[tauri::command]
async fn download_url(window: tauri::Window, url: &str, file_name: &str) -> Result<String, String> {
    match download::download_url_main(url, file_name, window).await {
        Ok(_) => Ok("Download completed successfully".into()),
        Err(e) => Err(format!("{:?}", e).into()),
    }
}

use sysinfo::System;

#[tauri::command]
fn get_sysinfo() -> (u64, usize) {
    let mut sys = System::new_all();
    sys.refresh_all();
    let total_memory = sys.total_memory();
    let cpu_count = sys.cpus().len();
    (total_memory, cpu_count)
}

use tauri::Manager;
#[derive(Clone, serde::Serialize)]
struct Payload {
    args: Vec<String>,
    cwd: String,
}

fn main() {
    
    // let devtools = devtools::init();

    tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![get_tcp_port, download_url, get_sysinfo])
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);
            app.emit_all("single-instance", Payload { args: argv, cwd })
                .unwrap();
        }))
        .plugin(tauri_plugin_websocket::init())
        // .plugin(devtools)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
