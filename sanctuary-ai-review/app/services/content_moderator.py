from typing import Dict, List, Tuple, Optional
import logging
from .bert_analyzer import JapaneseBertAnalyzer
from .negative_word_detector import NegativeWordDetector


class ContentModerationResult:
    """審査結果を格納するクラス"""
    
    def __init__(
        self,
        is_approved: bool,
        confidence_score: float,
        bert_scores: Dict[str, float],
        negative_words: List[str],
        rejection_reasons: List[str]
    ):
        self.is_approved = is_approved
        self.confidence_score = confidence_score
        self.bert_scores = bert_scores
        self.negative_words = negative_words
        self.rejection_reasons = rejection_reasons
    
    def to_dict(self) -> Dict:
        """辞書形式で結果を返す"""
        return {
            "is_approved": self.is_approved,
            "confidence_score": self.confidence_score,
            "bert_scores": self.bert_scores,
            "negative_words": self.negative_words,
            "rejection_reasons": self.rejection_reasons
        }


class ContentModerator:
    """統合コンテンツ審査サービス"""
    
    def __init__(
        self,
        bert_threshold: float = 0.6,
        confidence_threshold: float = 0.8,
        custom_words_path: Optional[str] = None
    ):
        """
        コンテンツ審査システムを初期化
        
        Args:
            bert_threshold: BERT感情分析のポジティブ判定閾値
            confidence_threshold: 総合判定の信頼度閾値
            custom_words_path: カスタムネガティブワード辞書のパス
        """
        self.logger = logging.getLogger(__name__)
        
        # 閾値設定
        self.bert_threshold = bert_threshold
        self.confidence_threshold = confidence_threshold
        
        # 各種分析器を初期化
        self.bert_analyzer = JapaneseBertAnalyzer()
        self.word_detector = NegativeWordDetector(custom_words_path)
        
        # BERTモデルを読み込み
        self.logger.info("BERTモデルを読み込み中...")
        self.bert_analyzer.load_model()
        self.logger.info("コンテンツ審査システム初期化完了")
    
    def moderate_content(self, text: str) -> ContentModerationResult:
        """
        コンテンツの総合審査を実行
        
        Args:
            text: 審査対象のテキスト
            
        Returns:
            ContentModerationResult: 審査結果
        """
        if not text or not text.strip():
            return ContentModerationResult(
                is_approved=False,
                confidence_score=1.0,
                bert_scores={},
                negative_words=[],
                rejection_reasons=["空の投稿"]
            )
        
        try:
            # BERT感情分析実行
            bert_scores = self.bert_analyzer.analyze_sentiment(text)
            
            # ネガティブワード検出実行
            has_negative_words, detected_words = self.word_detector.detect_negative_words(text)
            
            # 総合判定
            is_approved, confidence_score, rejection_reasons = self._make_final_decision(
                bert_scores, has_negative_words, detected_words
            )
            
            result = ContentModerationResult(
                is_approved=is_approved,
                confidence_score=confidence_score,
                bert_scores=bert_scores,
                negative_words=detected_words,
                rejection_reasons=rejection_reasons
            )
            
            # ログ出力
            self.logger.info(
                f"審査完了: 承認={is_approved}, 信頼度={confidence_score:.3f}, "
                f"BERT_positive={bert_scores.get('positive', 0):.3f}, "
                f"ネガティブワード={len(detected_words)}個"
            )
            
            return result
            
        except Exception as e:
            self.logger.error(f"コンテンツ審査エラー: {e}")
            return ContentModerationResult(
                is_approved=False,
                confidence_score=0.0,
                bert_scores={},
                negative_words=[],
                rejection_reasons=["審査システムエラー"]
            )
    
    def _make_final_decision(
        self,
        bert_scores: Dict[str, float],
        has_negative_words: bool,
        detected_words: List[str]
    ) -> Tuple[bool, float, List[str]]:
        """
        総合的な承認判定を実行
        
        Args:
            bert_scores: BERT感情分析結果
            has_negative_words: ネガティブワード検出フラグ
            detected_words: 検出されたネガティブワード
            
        Returns:
            (承認可否, 信頼度スコア, 拒否理由リスト)
        """
        rejection_reasons = []
        
        # 1. ネガティブワードチェック（最優先）
        if has_negative_words:
            rejection_reasons.append(f"ネガティブワード検出: {', '.join(detected_words)}")
            return False, 1.0, rejection_reasons
        
        # 2. BERT感情分析チェック
        positive_score = bert_scores.get('positive', 0.0)
        negative_score = bert_scores.get('negative', 0.0)
        
        if positive_score < self.bert_threshold:
            rejection_reasons.append(f"ポジティブスコア不足: {positive_score:.3f} < {self.bert_threshold}")
        
        if negative_score > 0.5:  # ネガティブが50%以上
            rejection_reasons.append(f"ネガティブスコア過大: {negative_score:.3f}")
        
        # 3. 総合判定
        if rejection_reasons:
            confidence_score = max(negative_score, 1.0 - positive_score)
            return False, confidence_score, rejection_reasons
        
        # 4. 承認判定
        confidence_score = positive_score
        
        if confidence_score >= self.confidence_threshold:
            return True, confidence_score, []
        else:
            return True, confidence_score, ["低信頼度での承認"]
    
    def get_system_status(self) -> Dict:
        """
        審査システムの状態を返す
        """
        return {
            "bert_model_loaded": self.bert_analyzer.model is not None,
            "bert_threshold": self.bert_threshold,
            "confidence_threshold": self.confidence_threshold,
            "negative_words_count": self.word_detector.get_word_count(),
            "device": str(self.bert_analyzer.device)
        }
    
    def update_thresholds(self, bert_threshold: float = None, confidence_threshold: float = None):
        """
        閾値を動的に更新
        
        Args:
            bert_threshold: BERT感情分析閾値
            confidence_threshold: 信頼度閾値
        """
        if bert_threshold is not None:
            self.bert_threshold = bert_threshold
            self.logger.info(f"BERT閾値更新: {bert_threshold}")
        
        if confidence_threshold is not None:
            self.confidence_threshold = confidence_threshold
            self.logger.info(f"信頼度閾値更新: {confidence_threshold}")