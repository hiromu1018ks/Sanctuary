from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from enum import Enum


class ModerationStatus(str, Enum):
    """審査ステータス"""
    APPROVED = "approved"
    REJECTED = "rejected"
    PENDING = "pending"


class ModerationRequest(BaseModel):
    """コンテンツ審査リクエスト"""
    content: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="審査対象のテキストコンテンツ"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "content": "今日はとても良い天気ですね！みなさんも素敵な一日をお過ごしください。"
            }
        }


class BertScores(BaseModel):
    """BERT感情分析スコア"""
    positive: float = Field(ge=0.0, le=1.0, description="ポジティブスコア")
    negative: float = Field(ge=0.0, le=1.0, description="ネガティブスコア")
    neutral: float = Field(ge=0.0, le=1.0, description="中性スコア")


class ModerationResponse(BaseModel):
    """コンテンツ審査レスポンス"""
    status: ModerationStatus = Field(description="審査結果ステータス")
    is_approved: bool = Field(description="承認可否")
    confidence_score: float = Field(
        ge=0.0, le=1.0,
        description="判定の信頼度スコア"
    )
    bert_scores: BertScores = Field(description="BERT感情分析結果")
    negative_words: List[str] = Field(
        default=[],
        description="検出されたネガティブワード"
    )
    rejection_reasons: List[str] = Field(
        default=[],
        description="拒否理由のリスト"
    )
    processing_time_ms: Optional[float] = Field(
        None,
        description="処理時間（ミリ秒）"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "status": "approved",
                "is_approved": True,
                "confidence_score": 0.85,
                "bert_scores": {
                    "positive": 0.85,
                    "negative": 0.05,
                    "neutral": 0.10
                },
                "negative_words": [],
                "rejection_reasons": [],
                "processing_time_ms": 245.7
            }
        }


class SystemStatusResponse(BaseModel):
    """システム状態レスポンス"""
    status: str = Field(description="システム状態")
    bert_model_loaded: bool = Field(description="BERTモデル読み込み状態")
    bert_threshold: float = Field(description="BERT判定閾値")
    confidence_threshold: float = Field(description="信頼度閾値")
    negative_words_count: int = Field(description="登録ネガティブワード数")
    device: str = Field(description="使用デバイス (cpu/cuda)")
    
    class Config:
        schema_extra = {
            "example": {
                "status": "healthy",
                "bert_model_loaded": True,
                "bert_threshold": 0.6,
                "confidence_threshold": 0.8,
                "negative_words_count": 45,
                "device": "cpu"
            }
        }


class ThresholdUpdateRequest(BaseModel):
    """閾値更新リクエスト"""
    bert_threshold: Optional[float] = Field(
        None,
        ge=0.0, le=1.0,
        description="BERT感情分析閾値"
    )
    confidence_threshold: Optional[float] = Field(
        None,
        ge=0.0, le=1.0,
        description="総合判定信頼度閾値"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "bert_threshold": 0.7,
                "confidence_threshold": 0.85
            }
        }


class BatchModerationRequest(BaseModel):
    """バッチ審査リクエスト"""
    contents: List[str] = Field(
        ...,
        min_items=1,
        max_items=100,
        description="審査対象のテキストリスト"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "contents": [
                    "素晴らしい一日でした！",
                    "今日も頑張りましょう。",
                    "ありがとうございます。"
                ]
            }
        }


class BatchModerationResponse(BaseModel):
    """バッチ審査レスポンス"""
    results: List[ModerationResponse] = Field(description="各コンテンツの審査結果")
    total_count: int = Field(description="総審査数")
    approved_count: int = Field(description="承認数")
    rejected_count: int = Field(description="拒否数")
    total_processing_time_ms: float = Field(description="総処理時間（ミリ秒）")
    
    class Config:
        schema_extra = {
            "example": {
                "results": [
                    {
                        "status": "approved",
                        "is_approved": True,
                        "confidence_score": 0.85,
                        "bert_scores": {"positive": 0.85, "negative": 0.05, "neutral": 0.10},
                        "negative_words": [],
                        "rejection_reasons": []
                    }
                ],
                "total_count": 3,
                "approved_count": 3,
                "rejected_count": 0,
                "total_processing_time_ms": 567.3
            }
        }


class ErrorResponse(BaseModel):
    """エラーレスポンス"""
    error: str = Field(description="エラータイプ")
    message: str = Field(description="エラーメッセージ")
    detail: Optional[str] = Field(None, description="詳細情報")
    
    class Config:
        schema_extra = {
            "example": {
                "error": "ValidationError",
                "message": "入力内容が不正です",
                "detail": "content field is required"
            }
        }