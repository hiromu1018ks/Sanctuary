from fastapi import APIRouter, HTTPException, Depends
from typing import List
import time
import logging
from ..models.moderation_models import (
    ModerationRequest,
    ModerationResponse,
    BertScores,
    ModerationStatus,
    SystemStatusResponse,
    ThresholdUpdateRequest,
    BatchModerationRequest,
    BatchModerationResponse,
    ErrorResponse
)
from ..services.content_moderator import ContentModerator

# ルーター作成
router = APIRouter(prefix="/api/v1", tags=["moderation"])

# ログ設定
logger = logging.getLogger(__name__)

# グローバルなContentModeratorインスタンス
moderator: ContentModerator = None


async def get_moderator() -> ContentModerator:
    """ContentModeratorのDI（依存性注入）"""
    global moderator
    if moderator is None:
        moderator = ContentModerator()
    return moderator


@router.post(
    "/moderate",
    response_model=ModerationResponse,
    summary="コンテンツ審査",
    description="テキストコンテンツをBERT感情分析とネガティブワード検出で審査します"
)
async def moderate_content(
    request: ModerationRequest,
    moderator: ContentModerator = Depends(get_moderator)
) -> ModerationResponse:
    """
    単一コンテンツの審査を実行
    """
    start_time = time.time()
    
    try:
        # コンテンツ審査実行
        result = moderator.moderate_content(request.content)
        
        # 処理時間計算
        processing_time = (time.time() - start_time) * 1000
        
        # ステータス決定
        status = ModerationStatus.APPROVED if result.is_approved else ModerationStatus.REJECTED
        
        return ModerationResponse(
            status=status,
            is_approved=result.is_approved,
            confidence_score=result.confidence_score,
            bert_scores=BertScores(**result.bert_scores),
            negative_words=result.negative_words,
            rejection_reasons=result.rejection_reasons,
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        logger.error(f"審査処理エラー: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"審査処理中にエラーが発生しました: {str(e)}"
        )


@router.post(
    "/moderate/batch",
    response_model=BatchModerationResponse,
    summary="バッチコンテンツ審査",
    description="複数のテキストコンテンツを一括で審査します"
)
async def moderate_content_batch(
    request: BatchModerationRequest,
    moderator: ContentModerator = Depends(get_moderator)
) -> BatchModerationResponse:
    """
    複数コンテンツのバッチ審査を実行
    """
    start_time = time.time()
    
    try:
        results = []
        approved_count = 0
        
        for content in request.contents:
            # 各コンテンツを審査
            result = moderator.moderate_content(content)
            
            # レスポンス形式に変換
            status = ModerationStatus.APPROVED if result.is_approved else ModerationStatus.REJECTED
            
            moderation_response = ModerationResponse(
                status=status,
                is_approved=result.is_approved,
                confidence_score=result.confidence_score,
                bert_scores=BertScores(**result.bert_scores),
                negative_words=result.negative_words,
                rejection_reasons=result.rejection_reasons
            )
            
            results.append(moderation_response)
            
            if result.is_approved:
                approved_count += 1
        
        # 総処理時間計算
        total_processing_time = (time.time() - start_time) * 1000
        
        return BatchModerationResponse(
            results=results,
            total_count=len(request.contents),
            approved_count=approved_count,
            rejected_count=len(request.contents) - approved_count,
            total_processing_time_ms=total_processing_time
        )
        
    except Exception as e:
        logger.error(f"バッチ審査処理エラー: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"バッチ審査処理中にエラーが発生しました: {str(e)}"
        )


@router.get(
    "/status",
    response_model=SystemStatusResponse,
    summary="システム状態確認",
    description="AI審査システムの動作状態を確認します"
)
async def get_system_status(
    moderator: ContentModerator = Depends(get_moderator)
) -> SystemStatusResponse:
    """
    システム状態を取得
    """
    try:
        status_info = moderator.get_system_status()
        
        return SystemStatusResponse(
            status="healthy" if status_info["bert_model_loaded"] else "unhealthy",
            **status_info
        )
        
    except Exception as e:
        logger.error(f"システム状態取得エラー: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"システム状態取得中にエラーが発生しました: {str(e)}"
        )


@router.put(
    "/settings/thresholds",
    summary="閾値設定更新",
    description="BERT感情分析と信頼度の判定閾値を更新します"
)
async def update_thresholds(
    request: ThresholdUpdateRequest,
    moderator: ContentModerator = Depends(get_moderator)
):
    """
    審査閾値を動的に更新
    """
    try:
        moderator.update_thresholds(
            bert_threshold=request.bert_threshold,
            confidence_threshold=request.confidence_threshold
        )
        
        return {
            "message": "閾値が正常に更新されました",
            "current_settings": {
                "bert_threshold": moderator.bert_threshold,
                "confidence_threshold": moderator.confidence_threshold
            }
        }
        
    except Exception as e:
        logger.error(f"閾値更新エラー: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"閾値更新中にエラーが発生しました: {str(e)}"
        )


@router.get(
    "/health",
    summary="ヘルスチェック",
    description="APIサーバーの基本的な動作確認"
)
async def health_check():
    """
    基本的なヘルスチェック
    """
    return {
        "status": "healthy",
        "message": "Sanctuary AI Review API is running",
        "timestamp": time.time()
    }