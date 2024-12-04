// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use portpicker::pick_unused_port;
use tauri_plugin_window_state;
use tauri_plugin_log::{Target, TargetKind};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_tcp_port() -> u16 {
    let port: u16 = pick_unused_port().expect("No ports free");
    return port;
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


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![get_tcp_port, get_sysinfo])
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_websocket::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                // .target(tauri_plugin_log::Target::new(
                //     tauri_plugin_log::TargetKind::LogDir {
                //     file_name: Some("logs".to_string()),
                //     },
                // ))
                .build()
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
