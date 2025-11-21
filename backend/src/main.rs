use backend::app;
use backend::game_of_life::{GameOfLife, parse_initial_state};
use backend::routes::game_api;
use log::info;
use log4rs;
use serde_json::json;
use std::env;
use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
use tokio::net::TcpListener;

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

    let initial_state = [
        "00100000000000000000",
        "10100000000000000111",
        "01100000000000000000",
        "00000000001100000000",
        "00000000001100000010",
        "00100000000000000010",
        "10100000000000000010",
        "01100000000000000000",
        "00000000000000000000",
        "00000000000000000111",
        "00100000000000000000",
        "10100000000000000000",
        "01100000000000000000",
        "00000000000000000000",
        "00000000000000000000",
        "00000000000000000000",
        "00000000000000000000",
        "00000000000000000010",
        "00000000000000000010",
        "00000000000000000010",
    ];
    let initial_grid = parse_initial_state(&initial_state);
    let game_state = Arc::new(Mutex::new(GameOfLife::new(initial_grid)));

    let api = game_api().layer(axum::extract::Extension(game_state));

    let static_root = "static/dist";
    let wasm_dir = "static/wasm";
    let app = app(static_root, wasm_dir, api);

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
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .unwrap();
}
