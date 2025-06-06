use axum::{
    extract::ConnectInfo,
    http::{Request, HeaderMap},
    middleware::Next,
    response::IntoResponse,
};
use std::net::SocketAddr;
use std::time::Instant;

/// HTTP request logging middleware that captures comprehensive request/response data
pub async fn log_requests<B>(
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    request: Request<B>,
    next: Next<B>,
) -> impl IntoResponse {
    let start = Instant::now();
    
    // Extract request information
    let method = request.method().to_string();
    let uri = request.uri().to_string();
    let headers = request.headers().clone();
    
    // Extract user agent and referer from headers
    let user_agent = extract_header_value(&headers, "user-agent");
    let referer = extract_header_value(&headers, "referer");
    
    // Process the request
    let response = next.run(request).await;
    
    // Extract response information
    let status = response.status().as_u16();
    let duration = start.elapsed();
    
    // Log the request with all captured information
    // Using a dedicated logger target for access logs
    log::info!(
        target: "access",
        "{} {} {} {} \"{}\" \"{}\" {}ms",
        addr.ip(),
        method,
        uri,
        status,
        user_agent,
        referer,
        duration.as_millis()
    );
    
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