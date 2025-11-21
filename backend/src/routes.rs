// backend/src/routes.rs
use crate::game_of_life::{GameOfLife, HEIGHT, WIDTH};
use crate::middleware::RequestContext;
use axum::{
    Router,
    extract::{Extension, Query},
    http::{HeaderMap, StatusCode, header},
    response::{IntoResponse, Json, Response},
    routing::{get, post},
};
use log::info;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::{Arc, Mutex};

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

pub async fn get_state(
    Extension(state): Extension<Arc<Mutex<GameOfLife>>>,
    Extension(ctx): Extension<RequestContext>,
) -> Json<GameState> {
    info!(
        target: "app",
        "{}",
        json!({
            "event": "gol.get_state",
            "request_id": ctx.request_id,
            "client_id": ctx.client_id,
        })
    );
    let gol = state.lock().unwrap();
    let response = GameState {
        grid: gol.current.clone(),
        width: WIDTH,
        height: HEIGHT,
    };
    info!(
        target: "app",
        "{}",
        json!({
            "event": "gol.get_state.response",
            "request_id": ctx.request_id,
            "grid_cells": response.grid.len(),
        })
    );
    Json(response)
}

pub async fn step(
    Extension(state): Extension<Arc<Mutex<GameOfLife>>>,
    Extension(ctx): Extension<RequestContext>,
) -> Json<GameState> {
    info!(
        target: "app",
        "{}",
        json!({
            "event": "gol.step",
            "request_id": ctx.request_id,
            "client_id": ctx.client_id,
        })
    );
    let mut gol = state.lock().unwrap();
    gol.step();
    let response = GameState {
        grid: gol.current.clone(),
        width: WIDTH,
        height: HEIGHT,
    };
    info!(
        target: "app",
        "{}",
        json!({
            "event": "gol.step.response",
            "request_id": ctx.request_id,
            "grid_cells": response.grid.len(),
        })
    );
    Json(response)
}

pub async fn step_back(
    Extension(state): Extension<Arc<Mutex<GameOfLife>>>,
    Extension(ctx): Extension<RequestContext>,
) -> Json<GameState> {
    info!(
        target: "app",
        "{}",
        json!({
            "event": "gol.step_back",
            "request_id": ctx.request_id,
            "client_id": ctx.client_id,
        })
    );
    let mut gol = state.lock().unwrap();
    gol.step_back();
    let response = GameState {
        grid: gol.current.clone(),
        width: WIDTH,
        height: HEIGHT,
    };
    info!(
        target: "app",
        "{}",
        json!({
            "event": "gol.step_back.response",
            "request_id": ctx.request_id,
            "grid_cells": response.grid.len(),
        })
    );
    Json(response)
}

pub async fn toggle_cell(
    Query(query): Query<ToggleQuery>,
    Extension(state): Extension<Arc<Mutex<GameOfLife>>>,
    Extension(ctx): Extension<RequestContext>,
) -> Json<GameState> {
    info!(
        target: "app",
        "{}",
        json!({
            "event": "gol.toggle_cell",
            "request_id": ctx.request_id,
            "client_id": ctx.client_id,
            "row": query.row,
            "col": query.col,
        })
    );
    let mut gol = state.lock().unwrap();
    gol.toggle_cell(query.row, query.col);
    let response = GameState {
        grid: gol.current.clone(),
        width: WIDTH,
        height: HEIGHT,
    };
    info!(
        target: "app",
        "{}",
        json!({
            "event": "gol.toggle_cell.response",
            "request_id": ctx.request_id,
            "grid_cells": response.grid.len(),
        })
    );
    Json(response)
}

pub async fn reset(
    Extension(state): Extension<Arc<Mutex<GameOfLife>>>,
    Extension(ctx): Extension<RequestContext>,
) -> Json<GameState> {
    info!(
        target: "app",
        "{}",
        json!({
            "event": "gol.reset",
            "request_id": ctx.request_id,
            "client_id": ctx.client_id,
        })
    );
    let mut gol = state.lock().unwrap();
    gol.reset();
    let response = GameState {
        grid: gol.current.clone(),
        width: WIDTH,
        height: HEIGHT,
    };
    info!(
        target: "app",
        "{}",
        json!({
            "event": "gol.reset.response",
            "request_id": ctx.request_id,
            "grid_cells": response.grid.len(),
        })
    );
    Json(response)
}

/// Generates XML sitemap for the portfolio website
pub async fn sitemap() -> Response {
    info!(
        target: "app",
        "{}",
        json!({
            "event": "sitemap",
            "message": "Received sitemap request"
        })
    );

    let sitemap_xml = r#"<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://ryanrumana.com/</loc>
        <lastmod>2025-01-01</lastmod>
        <changefreq>monthly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://ryanrumana.com/about/</loc>
        <lastmod>2025-01-01</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://ryanrumana.com/projects/</loc>
        <lastmod>2025-01-01</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://ryanrumana.com/projects/game-of-life/</loc>
        <lastmod>2025-01-01</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://ryanrumana.com/projects/kubernetes-homelab/</loc>
        <lastmod>2025-01-01</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://ryanrumana.com/projects/rust-portfolio-website/</loc>
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
