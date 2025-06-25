pub mod game_of_life;
pub mod routes;
pub mod middleware;

use axum::{
    Router,
    routing::{get_service, get},
    middleware::from_fn,
};

use std::path::PathBuf;
use tower_http::services::ServeDir;
use axum::http::{StatusCode, Uri};
use axum::response::{Html, IntoResponse};
use tokio::fs::read_to_string;

/// Fallback handler for 404 errors.
async fn fallback_handler(uri: Uri) -> impl IntoResponse {
    let path = PathBuf::from("static/404.html");
    let html = match read_to_string(path).await {
        Ok(content) => Html(content),
        Err(_) => Html(format!("<h1>404 Not Found</h1><p>No page found for {}</p>", uri)),
    };
    (StatusCode::NOT_FOUND, html)
}

/// Builds the application router.
/// - `static_dir`: the directory for static assets.
/// - `game_api`: the router for your Game of Life API endpoints.
pub fn app(static_dir: &str, game_api: Router) -> Router {
    let static_service = get_service(ServeDir::new(static_dir));

    Router::new()
        .route("/sitemap.xml", get(routes::sitemap))
        .nest("/api/game-of-life", game_api)
        .nest_service("/", static_service)
        .fallback(fallback_handler)
        .layer(from_fn(middleware::log_requests))
}

