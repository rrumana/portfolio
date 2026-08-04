use backend::app;
use log::info;
use serde_json::json;
use std::env;
use std::net::SocketAddr;
use std::path::{Path, PathBuf};
use tokio::net::TcpListener;

fn resolve_wasm_dir(static_root: &str) -> String {
    if let Ok(dir) = env::var("WASM_ROOT") {
        return dir;
    }

    let candidates = [
        PathBuf::from(static_root).join("wasm"),
        PathBuf::from("static/wasm"),
        PathBuf::from("frontend/public/wasm"),
    ];

    for candidate in candidates {
        if Path::new(&candidate).exists() {
            return candidate.to_string_lossy().into_owned();
        }
    }

    PathBuf::from(static_root)
        .join("wasm")
        .to_string_lossy()
        .into_owned()
}

#[tokio::main]
async fn main() {
    log4rs::init_file("log4rs.yaml", Default::default()).expect("Failed to initialize log4rs");

    info!(
        target: "app",
        "{}",
        json!({
            "event": "server_start",
            "message": "Starting the portfolio server",
        })
    );

    let static_root = env::var("STATIC_ROOT").unwrap_or_else(|_| "static/dist".to_string());
    let wasm_dir = resolve_wasm_dir(&static_root);
    let app = app(&static_root, &wasm_dir);

    let port = env::var("PORT")
        .or_else(|_| env::var("APP_PORT"))
        .ok()
        .and_then(|value| value.parse::<u16>().ok())
        .unwrap_or(8085);
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    println!("Serving portfolio at http://{}", addr);
    info!(
        target: "app",
        "{}",
        json!({
            "event": "listening",
            "addr": addr.to_string()
        })
    );

    let listener = TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app.into_make_service())
        .await
        .unwrap();
}
