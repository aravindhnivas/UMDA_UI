use error_chain::error_chain;
// use futures::stream::Stream;
use futures_util::StreamExt;
use std::io::Write;

error_chain! {
    foreign_links {
        Io(std::io::Error);
        HttpRequest(reqwest::Error);
    }
}

// #[tokio::main]
pub async fn download_url_main(url: &str, file_name: &str, window: tauri::Window) -> Result<()> {
    let response = reqwest::get(url).await?;

    if !response.status().is_success() {
        return Err(format!("Failed to download file: {}", response.status()).into());
    }

    let total_size = response
        .headers()
        .get("content-length")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.parse::<u64>().ok())
        .unwrap_or(0);
    let mut bytes_downloaded = 0;

    println!("total_size : {}", total_size);

    if total_size == 0 {
        return Err(format!("Failed to download file: {}", response.status()).into());
    }
    let mut stream = response.bytes_stream();
    let mut file = std::fs::File::create(file_name)?;
    while let Some(Ok(chunk)) = stream.next().await {
        bytes_downloaded += chunk.len() as u64;
        let progress = (bytes_downloaded * 100) / total_size;

        // window.emit("assets-download-progress", progress);
        match window.emit("assets-download-progress", progress) {
            Ok(_) => (),
            Err(e) => {
                // handle the error here
                eprintln!("Error emitting event: {:?}", e);
            }
        }
        file.write_all(&chunk)?;
    }

    println!("File downloaded and saved: {}", file_name);
    // std::fs::write(file_name, response.bytes().await?)?;
    Ok(())
}
