use axum::{
    routing::get_service,
    http::{StatusCode, Uri},
    Router,
    response::{Html, IntoResponse},
};
use std::{net::SocketAddr, path::PathBuf};
use tower_http::services::ServeDir;
use tokio::fs::read_to_string;

// Main asynchronous runtime
#[tokio::main]
async fn main() {
    // Set up the service for static file handling
    let static_service = get_service(ServeDir::new("static"));

    // Set up the router with middleware
    let app = Router::new()
        .nest_service("/", static_service) // Serve static files from the "static" directory at root
        .fallback(fallback_handler); // Fallback handler for 404 pages

    // Define the address and port
    // run our app with hyper, listening globally on port 8085
    let addr = SocketAddr::from(([0, 0, 0, 0], 8085));
    println!("Serving portfolio at http://{}", addr);
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8085").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

// Custom fallback handler for 404 errors
async fn fallback_handler(uri: Uri) -> impl IntoResponse {
    let path = PathBuf::from("static/404.html");
    let html = match read_to_string(path).await {
        Ok(content) => Html(content),
        Err(_) => Html(format!("<h1>404 Not Found</h1><p>No page found for {}</p>", uri)),
    };

    (StatusCode::NOT_FOUND, html)
}
