// backend/src/routes.rs
use crate::game_of_life::{GameOfLife, HEIGHT, WIDTH};
use axum::{
    extract::{Extension, Query},
    response::{Json, IntoResponse, Response},
    routing::{get, post},
    Router,
    http::{header, StatusCode, HeaderMap},
};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use log::info;

#[derive(Debug, Serialize)]
pub struct GameState {
    pub grid: Vec<u8>,
    pub width: usize,
    pub height: usize,
}

#[derive(Debug, Deserialize)]
pub struct ToggleQuery {
    pub row: usize,
    pub col: usize,
}

pub async fn get_state(Extension(state): Extension<Arc<Mutex<GameOfLife>>>) -> Json<GameState> {
    info!("Received GET state request");
    let gol = state.lock().unwrap();
    let response = GameState {
        grid: gol.current.clone(),
        width: WIDTH,
        height: HEIGHT,
    };
    info!("Responding with updated state");
    Json(response)
}

pub async fn step(Extension(state): Extension<Arc<Mutex<GameOfLife>>>) -> Json<GameState> {
    info!("Received POST step request");
    let mut gol = state.lock().unwrap();
    gol.step();
    let response = GameState {
        grid: gol.current.clone(),
        width: WIDTH,
        height: HEIGHT,
    };
    info!("Responding with updated state");
    Json(response)
}

pub async fn step_back(Extension(state): Extension<Arc<Mutex<GameOfLife>>>) -> Json<GameState> {
    info!("Received POST step_back request");
    let mut gol = state.lock().unwrap();
    gol.step_back();
    let response = GameState {
        grid: gol.current.clone(),
        width: WIDTH,
        height: HEIGHT,
    };
    info!("Responding with updated state");
    Json(response)
}

pub async fn toggle_cell(
    Query(query): Query<ToggleQuery>,
    Extension(state): Extension<Arc<Mutex<GameOfLife>>>,
) -> Json<GameState> {
    info!("Received POST toggle request for row: {}, col: {}", query.row, query.col);
    let mut gol = state.lock().unwrap();
    gol.toggle_cell(query.row, query.col);
    let response = GameState {
        grid: gol.current.clone(),
        width: WIDTH,
        height: HEIGHT,
    };
    info!("Responding with updated state");
    Json(response)
}

pub async fn reset(Extension(state): Extension<Arc<Mutex<GameOfLife>>>) -> Json<GameState> {
    info!("Received POST reset request");
    let mut gol = state.lock().unwrap();
    gol.reset();
    let response = GameState {
        grid: gol.current.clone(),
        width: WIDTH,
        height: HEIGHT,
    };
    info!("Responding with updated state");
    Json(response)
}

/// Generates XML sitemap for the portfolio website
pub async fn sitemap() -> Response {
    info!("Received sitemap request");
    
    let sitemap_xml = r#"<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://ryanrumana.com/</loc>
        <lastmod>2025-01-01</lastmod>
        <changefreq>monthly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://ryanrumana.com/about.html</loc>
        <lastmod>2025-01-01</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://ryanrumana.com/game_of_life.html</loc>
        <lastmod>2025-01-01</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://ryanrumana.com/ReID.html</loc>
        <lastmod>2025-01-01</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
</urlset>"#;

    let mut headers = HeaderMap::new();
    headers.insert(header::CONTENT_TYPE, "application/xml".parse().unwrap());
    
    (StatusCode::OK, headers, sitemap_xml).into_response()
}

/// Assembles the Game of Life API router.
pub fn game_api() -> Router {
    Router::new()
        .route("/state", get(get_state))
        .route("/step", post(step))
        .route("/back", post(step_back))
        .route("/toggle", post(toggle_cell))
        .route("/reset", post(reset))
}
