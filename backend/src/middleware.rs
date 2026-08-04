use axum::{
    body::Body,
    http::{
        Request,
        header::{
            CACHE_CONTROL, CONTENT_SECURITY_POLICY, HeaderName, HeaderValue, REFERRER_POLICY,
            X_CONTENT_TYPE_OPTIONS, X_FRAME_OPTIONS,
        },
    },
    middleware::Next,
    response::IntoResponse,
};
use serde_json::json;
use std::time::Instant;
use uuid::Uuid;

const REQUEST_HEADER: &str = "x-request-id";
const IMMUTABLE_CACHE: &str = "public, max-age=31536000, immutable";
const REVALIDATE_CACHE: &str = "no-cache";
const NO_STORE_CACHE: &str = "no-store";
const ROBOTS_HEADER: &str = "x-robots-tag";
const PERMISSIONS_POLICY_HEADER: &str = "permissions-policy";
const COOP_HEADER: &str = "cross-origin-opener-policy";
const CONTENT_SECURITY_POLICY_VALUE: &str = "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'self'; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-src 'none'; frame-ancestors 'none'";
const PERMISSIONS_POLICY_VALUE: &str = "accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), usb=()";

/// Applies security and cache policy to every response.
///
/// Astro's `_astro` output uses content-hashed filenames and can be cached
/// indefinitely. HTML and stable WASM filenames must be revalidated so a new
/// deployment cannot leave clients pinned to an older build. Dynamic endpoints
/// are never stored.
pub async fn set_response_headers(request: Request<Body>, next: Next) -> impl IntoResponse {
    let path = request.uri().path().to_owned();
    let mut response = next.run(request).await;

    let policy = if path == "/healthz" || path == "/readyz" || path.starts_with("/api/") {
        NO_STORE_CACHE
    } else if path.starts_with("/_astro/") && response.status().is_success() {
        IMMUTABLE_CACHE
    } else {
        REVALIDATE_CACHE
    };

    response
        .headers_mut()
        .insert(CACHE_CONTROL, HeaderValue::from_static(policy));
    response.headers_mut().insert(
        CONTENT_SECURITY_POLICY,
        HeaderValue::from_static(CONTENT_SECURITY_POLICY_VALUE),
    );
    response
        .headers_mut()
        .insert(X_CONTENT_TYPE_OPTIONS, HeaderValue::from_static("nosniff"));
    response
        .headers_mut()
        .insert(REFERRER_POLICY, HeaderValue::from_static("no-referrer"));
    response.headers_mut().insert(
        HeaderName::from_static(PERMISSIONS_POLICY_HEADER),
        HeaderValue::from_static(PERMISSIONS_POLICY_VALUE),
    );
    response.headers_mut().insert(
        HeaderName::from_static(COOP_HEADER),
        HeaderValue::from_static("same-origin"),
    );
    response
        .headers_mut()
        .insert(X_FRAME_OPTIONS, HeaderValue::from_static("DENY"));

    if path.starts_with("/legacy/") {
        response.headers_mut().insert(
            HeaderName::from_static(ROBOTS_HEADER),
            HeaderValue::from_static("noindex, nofollow"),
        );
    }
    response
}

/// Emits a privacy-preserving access log and exposes a server-generated request ID.
pub async fn log_requests(request: Request<Body>, next: Next) -> impl IntoResponse {
    let start = Instant::now();

    let method = request.method().to_string();
    let path = request.uri().path().to_owned();
    let request_id = Uuid::new_v4().to_string();
    let mut response = next.run(request).await;

    let status = response.status().as_u16();
    let access_log = json!({
        "event": "http_request",
        "request_id": request_id,
        "method": method,
        "path": path,
        "status": status,
        "duration_ms": start.elapsed().as_millis(),
    });

    log::info!(target: "access", "{}", access_log);

    if let Ok(request_header) = HeaderValue::from_str(&request_id) {
        response
            .headers_mut()
            .insert(HeaderName::from_static(REQUEST_HEADER), request_header);
    }

    response
}
