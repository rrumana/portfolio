// backend/tests/api.rs
use axum::{
    body::{Body, to_bytes},
    http::{Request, StatusCode},
};
use backend::game_of_life::{GameOfLife, HEIGHT, WIDTH};
use backend::routes::{game_api};
use std::{
    sync::{Arc, Mutex},
};
use tower::util::ServiceExt; // Bring oneshot into scope
use serde_json::Value;

#[tokio::test]
async fn test_get_state_endpoint() {
    // Create an initial state.
    let initial_state = vec![0; WIDTH * HEIGHT];
    let game_state = Arc::new(Mutex::new(GameOfLife::new(initial_state)));

    // Build the router with the GET endpoint.
    let app = game_api()
        .route("/dummy", axum::routing::get(|| async { "dummy" })) // dummy route if needed
        .layer(axum::extract::Extension(game_state));

    // Create a request to the /state endpoint.
    let response = app
        .oneshot(
            Request::builder()
                .uri("/state")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body_bytes = to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let json: Value = serde_json::from_slice(&body_bytes).unwrap();
    assert_eq!(json["width"], WIDTH);
    assert_eq!(json["height"], HEIGHT);
}

#[tokio::test]
async fn test_step_endpoint() {
    let initial_state = vec![0; WIDTH * HEIGHT];
    let game_state = Arc::new(Mutex::new(GameOfLife::new(initial_state)));

    let app = game_api()
        .route("/dummy", axum::routing::get(|| async { "dummy" }))
        .layer(axum::extract::Extension(game_state));

    let response = app
        .oneshot(
            Request::builder()
                .uri("/step")
                .method("POST")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn test_toggle_endpoint() {
    let initial_state = vec![0; WIDTH * HEIGHT];
    let game_state = Arc::new(Mutex::new(GameOfLife::new(initial_state)));

    let app = game_api()
        .route("/dummy", axum::routing::get(|| async { "dummy" }))
        .layer(axum::extract::Extension(game_state));

    let uri = "/toggle?row=5&col=5";
    let response = app
        .oneshot(
            Request::builder()
                .uri(uri)
                .method("POST")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
}
