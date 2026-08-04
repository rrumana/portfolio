use axum::{
    body::{Body, to_bytes},
    http::{
        Method, Request, StatusCode,
        header::{
            CACHE_CONTROL, CONTENT_SECURITY_POLICY, CONTENT_TYPE, LOCATION, REFERRER_POLICY,
            SET_COOKIE, X_CONTENT_TYPE_OPTIONS, X_FRAME_OPTIONS,
        },
    },
};
use backend::app;
use std::{fs, path::PathBuf};
use tower::ServiceExt;
use uuid::Uuid;

struct TestSite {
    root: PathBuf,
    static_dir: PathBuf,
    wasm_dir: PathBuf,
}

impl TestSite {
    fn new() -> Self {
        let root = std::env::temp_dir().join(format!("portfolio-backend-{}", Uuid::new_v4()));
        let static_dir = root.join("dist");
        let wasm_dir = root.join("wasm");

        fs::create_dir_all(static_dir.join("projects/example")).unwrap();
        fs::create_dir_all(static_dir.join("_astro")).unwrap();
        fs::create_dir_all(&wasm_dir).unwrap();
        fs::write(static_dir.join("index.html"), b"<h1>Home</h1>").unwrap();
        fs::write(
            static_dir.join("404.html"),
            b"<h1>Custom page not found</h1>",
        )
        .unwrap();
        fs::write(
            static_dir.join("projects/example/index.html"),
            b"<h1>Example project</h1>",
        )
        .unwrap();
        fs::write(
            static_dir.join("_astro/app.A1B2C3D4.js"),
            b"console.log('hashed');",
        )
        .unwrap();
        fs::create_dir_all(static_dir.join("legacy")).unwrap();
        fs::write(static_dir.join("legacy/index.html"), b"<h1>Legacy</h1>").unwrap();
        fs::write(
            wasm_dir.join("wasm_game_of_life_bg.wasm"),
            b"\0asm\x01\0\0\0",
        )
        .unwrap();

        Self {
            root,
            static_dir,
            wasm_dir,
        }
    }

    fn router(&self) -> axum::Router {
        app(
            self.static_dir.to_str().unwrap(),
            self.wasm_dir.to_str().unwrap(),
        )
    }
}

impl Drop for TestSite {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.root);
    }
}

fn request(uri: &str) -> Request<Body> {
    Request::builder().uri(uri).body(Body::empty()).unwrap()
}

fn assert_security_headers(response: &axum::response::Response) {
    assert_eq!(
        response.headers()[CONTENT_SECURITY_POLICY],
        "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'self'; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-src 'none'; frame-ancestors 'none'"
    );
    assert_eq!(response.headers()[X_CONTENT_TYPE_OPTIONS], "nosniff");
    assert_eq!(response.headers()[REFERRER_POLICY], "no-referrer");
    assert_eq!(
        response.headers()["permissions-policy"],
        "accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), usb=()"
    );
    assert_eq!(
        response.headers()["cross-origin-opener-policy"],
        "same-origin"
    );
    assert_eq!(response.headers()[X_FRAME_OPTIONS], "DENY");
}

async fn body_text(response: axum::response::Response) -> String {
    let bytes = to_bytes(response.into_body(), usize::MAX).await.unwrap();
    String::from_utf8(bytes.to_vec()).unwrap()
}

#[tokio::test]
async fn health_and_readiness_report_the_server_state() {
    let site = TestSite::new();

    let health = site.router().oneshot(request("/healthz")).await.unwrap();
    assert_eq!(health.status(), StatusCode::OK);
    assert_eq!(health.headers()[CACHE_CONTROL], "no-store");
    assert_eq!(body_text(health).await, "ok");

    let ready = site.router().oneshot(request("/readyz")).await.unwrap();
    assert_eq!(ready.status(), StatusCode::OK);
    assert_eq!(ready.headers()[CACHE_CONTROL], "no-store");
    assert_eq!(body_text(ready).await, "ready");
}

#[tokio::test]
async fn readiness_fails_when_the_static_site_is_missing() {
    let site = TestSite::new();
    let missing_static_dir = site.root.join("missing-dist");
    let app = app(
        missing_static_dir.to_str().unwrap(),
        site.wasm_dir.to_str().unwrap(),
    );

    let response = app.oneshot(request("/readyz")).await.unwrap();
    assert_eq!(response.status(), StatusCode::SERVICE_UNAVAILABLE);
    assert_eq!(body_text(response).await, "static site unavailable");
}

#[tokio::test]
async fn serves_astro_directory_routes_and_redirects_clean_paths() {
    let site = TestSite::new();

    let redirect = site
        .router()
        .oneshot(request("/projects/example"))
        .await
        .unwrap();
    assert_eq!(redirect.status(), StatusCode::TEMPORARY_REDIRECT);
    assert_eq!(redirect.headers()[LOCATION], "/projects/example/");

    let response = site
        .router()
        .oneshot(request("/projects/example/"))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    assert!(body_text(response).await.contains("Example project"));
}

#[tokio::test]
async fn unknown_routes_return_the_404_page_with_a_real_404_status() {
    let site = TestSite::new();

    let response = site
        .router()
        .oneshot(request("/not-a-real-page"))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::NOT_FOUND);
    assert_eq!(response.headers()[CONTENT_TYPE], "text/html; charset=utf-8");
    assert_eq!(response.headers()[CACHE_CONTROL], "no-cache");
    let body = body_text(response).await;
    assert!(body.contains("Custom page not found"));
    assert!(!body.contains("Home"));
}

#[tokio::test]
async fn falls_back_to_a_plain_404_page_when_no_generated_page_exists() {
    let site = TestSite::new();
    let static_dir = site.root.join("dist-without-404");
    fs::create_dir_all(&static_dir).unwrap();
    fs::write(static_dir.join("index.html"), b"<h1>Home</h1>").unwrap();
    let app = app(
        static_dir.to_str().unwrap(),
        site.wasm_dir.to_str().unwrap(),
    );

    let response = app.oneshot(request("/missing")).await.unwrap();
    assert_eq!(response.status(), StatusCode::NOT_FOUND);
    assert!(body_text(response).await.contains("Page not found"));
}

#[tokio::test]
async fn cache_headers_match_asset_versioning() {
    let site = TestSite::new();

    let html = site.router().oneshot(request("/")).await.unwrap();
    assert_eq!(html.status(), StatusCode::OK);
    assert_eq!(html.headers()[CACHE_CONTROL], "no-cache");

    let wasm = site
        .router()
        .oneshot(request("/wasm/wasm_game_of_life_bg.wasm"))
        .await
        .unwrap();
    assert_eq!(wasm.status(), StatusCode::OK);
    assert_eq!(wasm.headers()[CACHE_CONTROL], "no-cache");

    let hashed_asset = site
        .router()
        .oneshot(request("/_astro/app.A1B2C3D4.js"))
        .await
        .unwrap();
    assert_eq!(hashed_asset.status(), StatusCode::OK);
    assert_eq!(
        hashed_asset.headers()[CACHE_CONTROL],
        "public, max-age=31536000, immutable"
    );

    let missing_hashed_asset = site
        .router()
        .oneshot(request("/_astro/missing.js"))
        .await
        .unwrap();
    assert_eq!(missing_hashed_asset.status(), StatusCode::NOT_FOUND);
    assert_eq!(missing_hashed_asset.headers()[CACHE_CONTROL], "no-cache");

    let legacy = site.router().oneshot(request("/legacy/")).await.unwrap();
    assert_eq!(legacy.status(), StatusCode::OK);
    assert_eq!(legacy.headers()["x-robots-tag"], "noindex, nofollow");
}

#[tokio::test]
async fn security_headers_cover_static_health_redirect_wasm_and_404_responses() {
    let site = TestSite::new();

    for uri in [
        "/",
        "/healthz",
        "/projects/example",
        "/wasm/wasm_game_of_life_bg.wasm",
        "/not-a-real-page",
    ] {
        let response = site.router().oneshot(request(uri)).await.unwrap();
        assert_security_headers(&response);
    }
}

#[tokio::test]
async fn request_ids_are_ephemeral_and_client_identifiers_are_not_returned() {
    let site = TestSite::new();
    let response = site
        .router()
        .oneshot(
            Request::builder()
                .uri("/?email=private@example.com")
                .header("cookie", "portfolio_client_id=persistent-client")
                .header("x-client-id", "persistent-client")
                .header("x-request-id", "caller-controlled")
                .header("user-agent", "private-agent")
                .header("referer", "https://private.example/")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert!(response.headers().get(SET_COOKIE).is_none());
    assert!(response.headers().get("x-client-id").is_none());
    let request_id = response.headers()["x-request-id"].to_str().unwrap();
    assert_ne!(request_id, "caller-controlled");
    assert!(Uuid::parse_str(request_id).is_ok());
}

#[tokio::test]
async fn removed_public_apis_are_unavailable_and_never_cached() {
    let site = TestSite::new();

    for (method, uri, expected_status) in [
        (Method::GET, "/api/logs", StatusCode::NOT_FOUND),
        (Method::POST, "/api/logs", StatusCode::METHOD_NOT_ALLOWED),
        (
            Method::GET,
            "/api/game-of-life/state",
            StatusCode::NOT_FOUND,
        ),
        (
            Method::POST,
            "/api/game-of-life/step",
            StatusCode::METHOD_NOT_ALLOWED,
        ),
    ] {
        let api_request = Request::builder()
            .method(method)
            .uri(uri)
            .body(Body::empty())
            .unwrap();
        let response = site.router().oneshot(api_request).await.unwrap();
        assert_eq!(response.status(), expected_status);
        assert_eq!(response.headers()[CACHE_CONTROL], "no-store");
        assert_security_headers(&response);
    }
}
