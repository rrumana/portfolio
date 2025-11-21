use axum::{
    body::Body,
    extract::ConnectInfo,
    http::{
        HeaderMap, Request,
        header::{COOKIE, HeaderName, HeaderValue, SET_COOKIE},
    },
    middleware::Next,
    response::IntoResponse,
};
use serde_json::json;
use std::net::SocketAddr;
use std::time::Instant;
use uuid::Uuid;

const CLIENT_COOKIE: &str = "portfolio_client_id";
const CLIENT_HEADER: &str = "x-client-id";
const REQUEST_HEADER: &str = "x-request-id";

/// Context captured for each request so downstream handlers can enrich logs.
#[derive(Clone, Debug)]
pub struct RequestContext {
    pub request_id: String,
    pub client_id: String,
    pub path: String,
    pub user_agent: String,
    pub referer: String,
    pub ip: String,
}

/// HTTP request logging middleware that captures comprehensive request/response data
pub async fn log_requests(
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    mut request: Request<Body>,
    next: Next,
) -> impl IntoResponse {
    let start = Instant::now();

    let method = request.method().to_string();
    let uri = request.uri().to_string();
    let headers = request.headers().clone();

    let user_agent = extract_header_value(&headers, "user-agent");
    let referer = extract_header_value(&headers, "referer");
    let request_id = Uuid::new_v4().to_string();
    let (client_id, set_client_cookie) = extract_or_create_client_id(&headers);

    // Make context available to handlers for richer application logs.
    request.extensions_mut().insert(RequestContext {
        request_id: request_id.clone(),
        client_id: client_id.clone(),
        path: uri.clone(),
        user_agent: user_agent.clone(),
        referer: referer.clone(),
        ip: addr.ip().to_string(),
    });

    // Process the request
    let mut response = next.run(request).await;

    let status = response.status().as_u16();
    let duration = start.elapsed();
    let access_log = json!({
        "event": "http_request",
        "request_id": request_id,
        "client_id": client_id,
        "method": method,
        "path": uri,
        "status": status,
        "duration_ms": duration.as_millis(),
        "user_agent": user_agent,
        "referer": referer,
        "ip": addr.ip().to_string()
    });

    log::info!(target: "access", "{}", access_log);

    if set_client_cookie {
        if let Ok(header) = HeaderValue::from_str(&build_client_cookie(&client_id)) {
            response.headers_mut().insert(SET_COOKIE, header);
        }
    }

    if let Ok(request_header) = HeaderValue::from_str(&request_id) {
        response
            .headers_mut()
            .insert(HeaderName::from_static(REQUEST_HEADER), request_header);
    }

    if let Ok(client_header) = HeaderValue::from_str(&client_id) {
        response
            .headers_mut()
            .insert(HeaderName::from_static(CLIENT_HEADER), client_header);
    }

    response
}

/// Helper function to safely extract header values
fn extract_header_value(headers: &HeaderMap, header_name: &str) -> String {
    headers
        .get(header_name)
        .and_then(|value| value.to_str().ok())
        .unwrap_or("-")
        .to_string()
}

fn extract_or_create_client_id(headers: &HeaderMap) -> (String, bool) {
    if let Some(cookie_header) = headers.get(COOKIE) {
        if let Ok(cookies) = cookie_header.to_str() {
            for cookie in cookies.split(';') {
                let trimmed = cookie.trim();
                if let Some(value) = trimmed.strip_prefix(&format!("{CLIENT_COOKIE}=")) {
                    return (value.to_string(), false);
                }
            }
        }
    }

    (Uuid::new_v4().to_string(), true)
}

fn build_client_cookie(client_id: &str) -> String {
    format!("{CLIENT_COOKIE}={client_id}; Path=/; Max-Age=31536000; SameSite=Lax")
}
