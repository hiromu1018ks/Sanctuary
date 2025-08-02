from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from typing import Dict, Tuple
import logging


class JapaneseBertAnalyzer:
    """日本語BERT感情分析クラス"""

    def __init__(self):
        """
        BERTモデルを初期化
        cl-tohoku/bert-base-japanese-whole-word-maskingを使用
        """
        # 感情分析専用モデルに変更（多言語対応・日本語サポート）
        self.model_name = "cardiffnlp/twitter-xlm-roberta-base-sentiment-multilingual"
        self.tokenizer = None
        self.model = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # ログ設定
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def load_model(self) -> None:
        """
        BERTモデルとトークナイザーを読み込み
        初回実行時はインターネットからダウンロード
        """
        try:
            self.logger.info(f"BERTモデルを読み込み中: {self.model_name}")

            # トークナイザー読み込み
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)

            # 感情分析専用モデル読み込み（事前訓練済み）
            self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name)

            # デバイスに移動
            self.model.to(self.device)
            self.model.eval()  # 推論モード

            self.logger.info("BERTモデル読み込み完了")

        except Exception as e:
            self.logger.error(f"モデル読み込みエラー: {e}")
            raise

    def analyze_sentiment(self, text: str) -> Dict[str, float]:
        """
        テキストの感情分析を実行

        Args:
            text: 分析対象のテキスト

        Returns:
            感情スコア辞書 {"positive": 0.8, "negative": 0.1, "neutral": 0.1}
        """
        if not self.model or not self.tokenizer:
            raise ValueError(
                "モデルが読み込まれていません。load_model()を実行してください。"
            )

        try:
            # テキストをトークン化
            inputs = self.tokenizer(
                text, return_tensors="pt", truncation=True, padding=True, max_length=512
            )

            # デバイスに移動
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            # 推論実行
            with torch.no_grad():
                outputs = self.model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)

            # CPUに移動して結果を取得
            predictions = predictions.cpu().numpy()[0]

            return {
                "negative": float(predictions[0]),
                "neutral": float(predictions[1]),
                "positive": float(predictions[2]),
            }

        except Exception as e:
            self.logger.error(f"感情分析エラー: {e}")
            raise

    def is_positive_post(
        self, text: str, threshold: float = 0.6
    ) -> Tuple[bool, Dict[str, float]]:
        """
        投稿がポジティブかどうかを判定

        Args:
            text: 投稿テキスト
            threshold: ポジティブ判定の閾値

        Returns:
            (判定結果, 感情スコア)
        """
        scores = self.analyze_sentiment(text)
        is_positive = scores["positive"] > threshold

        return is_positive, scores
