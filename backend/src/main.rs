use axum::{
    routing::{get, post},
    Router,
    Json,
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::{CorsLayer, Any};
use tracing_subscriber;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
    version: String,
}

#[derive(Serialize)]
struct ApiResponse<T: Serialize> {
    success: bool,
    data: Option<T>,
    error: Option<String>,
}

#[derive(Serialize)]
struct ArchivePage {
    url: String;
    title: String;
    captured_at: String;
    archive_url: String;
    page_size: u64;
    status_code: u32;
    content_type: String;
}

#[derive(Deserialize)]
struct SaveRequest {
    url: String,
}

async fn health_check() -> impl IntoResponse {
    Json(HealthResponse {
        status: "healthy".to_string(),
        service: "Permanently save any webpage".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

async fn root() -> impl IntoResponse {
    Json(ApiResponse::<()> {
        success: true,
        data: None,
        error: None,
    })
}

async fn save_page(Json(req): Json<SaveRequest>) -> impl IntoResponse {
    let archive = ArchivePage {
        url: req.url.clone(),
        title: "Archived Page".to_string(),
        captured_at: chrono::Utc::now().to_rfc3339(),
        archive_url: format!("https://web.archive.org/web/{}", chrono::Utc::now().format("%Y%m%d%H%M%S")),
        page_size: 245000,
        status_code: 200,
        content_type: "text/html".to_string(),
    };

    Json(ApiResponse {
        success: true,
        data: Some(archive),
        error: None,
    })
}

async fn check_availability(Json(req): Json<SaveRequest>) -> impl IntoResponse {
    Json(ApiResponse {
        success: true,
        data: Some(serde_json::json!({
            "url": req.url,
            "available": true,
            "snapshots_count": 45,
            "first_snapshot": "2010-01-15",
            "last_snapshot": "2024-03-20"
        })),
        error: None,
    })
}

async fn get_recent() -> impl IntoResponse {
    let archives = vec![
        ArchivePage {
            url: "https://example.com".to_string(),
            title: "Example Domain".to_string(),
            captured_at: chrono::Utc::now().to_rfc3339(),
            archive_url: "https://web.archive.org/web/20240320".to_string(),
            page_size: 12500,
            status_code: 200,
            content_type: "text/html".to_string(),
        },
    ];

    Json(ApiResponse {
        success: true,
        data: Some(archives),
        error: None,
    })
}

async fn get_stats() -> impl IntoResponse {
    Json(ApiResponse {
        success: true,
        data: Some(serde_json::json!({
            "total_pages_saved": 892345678,
            "pages_today": 234567,
            "total_size_gb": 456789,
            "domains_archived": 1234567
        })),
        error: None,
    })
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health_check))
        .route("/api/save", post(save_page))
        .route("/api/check", post(check_availability))
        .route("/api/recent", get(get_recent))
        .route("/api/stats", get(get_stats))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001")
        .await
        .unwrap();

    tracing::info!("Permanently save any webpage backend running on port 3001");
    axum::serve(listener, app).await.unwrap();
}
