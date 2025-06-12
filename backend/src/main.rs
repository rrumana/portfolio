use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
use axum::Server;
use backend::game_of_life::{GameOfLife, parse_initial_state};
use backend::routes::game_api;
use backend::app;
use log::info;
use log4rs;

#[tokio::main]
async fn main() {

    log4rs::init_file("log4rs.yaml", Default::default())
        .expect("Failed to initialize log4rs");

    info!("Starting the portfolio server...");

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
    let app = app("static", api);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8085));
    println!("Serving portfolio at http://{}", addr);
    Server::bind(&addr)
        .serve(app.into_make_service_with_connect_info::<SocketAddr>())
        .await
        .unwrap();
}
