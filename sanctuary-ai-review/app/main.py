from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import uvicorn
from .api.moderation import router as moderation_router

# ログ設定
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

# FastAPIアプリケーション作成
app = FastAPI(
    title="Sanctuary AI Review API",
    description="日本語BERT感情分析とネガティブワード検出によるコンテンツ審査API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS設定（Honoバックエンドからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js開発サーバー
        "http://localhost:8787",  # Hono開発サーバー
        "https://sanctuary-app.vercel.app",  # 本番フロントエンド（例）
        "https://your-hono-api.com"  # 本番Honoバックエンド（例）
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(moderation_router)

# グローバル例外ハンドラー
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    予期しないエラーのグローバルハンドラー
    """
    logging.error(f"予期しないエラー: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "message": "内部サーバーエラーが発生しました",
            "detail": str(exc) if app.debug else "詳細情報は利用できません"
        }
    )

# 起動時イベント
@app.on_event("startup")
async def startup_event():
    """
    アプリケーション起動時の初期化処理
    """
    logging.info("Sanctuary AI Review API が起動しました")
    logging.info("BERTモデルの読み込みを開始します...")

# 終了時イベント
@app.on_event("shutdown")
async def shutdown_event():
    """
    アプリケーション終了時のクリーンアップ処理
    """
    logging.info("Sanctuary AI Review API を終了します")

# ルートエンドポイント
@app.get("/")
async def root():
    """
    ルートエンドポイント
    """
    return {
        "message": "Welcome to Sanctuary AI Review API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health"
    }

# 開発用サーバー起動
if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )