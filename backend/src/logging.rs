use crate::middleware::RequestContext;
use axum::{
    Json,
    extract::{ConnectInfo, Extension},
    http::StatusCode,
    response::IntoResponse,
};
use serde::Deserialize;
use serde_json::{Value, json};
use std::net::SocketAddr;

const MAX_MESSAGE_LEN: usize = 2_000;
const MAX_CONTEXT_LEN: usize = 10_000;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "lowercase")]
enum FrontendLevel {
    Debug,
    Info,
    Warn,
    Error,
}

impl FrontendLevel {
    fn as_level(&self) -> log::Level {
        match self {
            FrontendLevel::Debug => log::Level::Debug,
            FrontendLevel::Info => log::Level::Info,
            FrontendLevel::Warn => log::Level::Warn,
            FrontendLevel::Error => log::Level::Error,
        }
    }

    fn as_str(&self) -> &'static str {
        match self {
            FrontendLevel::Debug => "debug",
            FrontendLevel::Info => "info",
            FrontendLevel::Warn => "warn",
            FrontendLevel::Error => "error",
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct FrontendLogPayload {
    #[serde(default)]
    level: Option<FrontendLevel>,
    message: String,
    #[serde(default)]
    component: Option<String>,
    #[serde(default)]
    page: Option<String>,
    #[serde(default)]
    request_id: Option<String>,
    #[serde(default)]
    client_id: Option<String>,
    #[serde(default)]
    context: Option<Value>,
}

pub async fn ingest_frontend_log(
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Extension(ctx): Extension<RequestContext>,
    Json(payload): Json<FrontendLogPayload>,
) -> impl IntoResponse {
    if payload.message.trim().is_empty() {
        return StatusCode::BAD_REQUEST;
    }

    if payload.message.len() > MAX_MESSAGE_LEN {
        return StatusCode::PAYLOAD_TOO_LARGE;
    }

    if let Some(context) = &payload.context {
        if serde_json::to_string(context)
            .map(|body| body.len() > MAX_CONTEXT_LEN)
            .unwrap_or(false)
        {
            return StatusCode::PAYLOAD_TOO_LARGE;
        }
    }

    let level = payload.level.unwrap_or(FrontendLevel::Info);
    let log_level = level.as_level();
    let derived_request_id = payload.request_id.unwrap_or_else(|| ctx.request_id.clone());
    let derived_client_id = payload.client_id.unwrap_or_else(|| ctx.client_id.clone());

    let log_line = json!({
        "event": "frontend_log",
        "level": level.as_str(),
        "message": payload.message,
        "component": payload.component,
        "page": payload.page,
        "request_id": derived_request_id,
        "client_id": derived_client_id,
        "api_path": ctx.path,
        "user_agent": ctx.user_agent,
        "referer": ctx.referer,
        "ip": addr.ip().to_string(),
        "context": payload.context
    });

    log::log!(target: "frontend", log_level, "{}", log_line);

    StatusCode::ACCEPTED
}
