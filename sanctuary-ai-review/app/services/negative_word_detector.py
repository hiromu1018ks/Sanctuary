from typing import List, Dict, Tuple, Set
import re
import json
from pathlib import Path
import logging


class NegativeWordDetector:
    """ネガティブワード検出クラス"""
    
    def __init__(self, custom_words_path: str = None):
        """
        ネガティブワード検出器を初期化
        
        Args:
            custom_words_path: カスタム辞書ファイルのパス
        """
        self.logger = logging.getLogger(__name__)
        
        # 基本的なネガティブワード辞書
        self.negative_words: Set[str] = set(self.load_default_negative_words())
        
        # カスタム辞書を読み込み
        if custom_words_path:
            self.load_custom_words(custom_words_path)
            
        # 正規表現パターンの準備
        self.compile_patterns()
    
    def load_default_negative_words(self) -> List[str]:
        """
        デフォルトのネガティブワード一覧を返す
        SNSでよく使われる攻撃的・否定的な表現を収録
        """
        return [
            # 攻撃的な表現
            "死ね", "殺す", "消えろ", "うざい", "きもい",
            "バカ", "アホ", "クズ", "ゴミ", "カス",
            
            # 差別・偏見表現
            "ブス", "デブ", "チビ", "ハゲ",
            
            # 否定的感情
            "嫌い", "憎い", "許さない", "最悪", "最低",
            "ムカつく", "イライラ", "腹立つ",
            
            # 絶望・抑うつ表現
            "つらい", "苦しい", "もうダメ", "終わった", "絶望",
            
            # その他の問題表現
            "炎上", "叩く", "批判", "文句", "愚痴"
        ]
    
    def load_custom_words(self, file_path: str) -> None:
        """
        カスタムネガティブワード辞書を読み込み
        
        Args:
            file_path: JSONファイルのパス
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                custom_data = json.load(f)
                custom_words = custom_data.get('negative_words', [])
                self.negative_words.update(custom_words)
                self.logger.info(f"カスタム辞書を読み込み: {len(custom_words)}語")
        except FileNotFoundError:
            self.logger.warning(f"カスタム辞書が見つかりません: {file_path}")
        except Exception as e:
            self.logger.error(f"カスタム辞書読み込みエラー: {e}")
    
    def compile_patterns(self) -> None:
        """
        正規表現パターンをコンパイル
        パフォーマンス向上のため事前にコンパイル
        """
        # ひらがな・カタカナ・漢字・英数字に対応
        word_patterns = []
        for word in self.negative_words:
            # 完全一致パターン
            pattern = rf'\b{re.escape(word)}\b'
            word_patterns.append(pattern)
        
        # 全パターンを結合
        self.compiled_pattern = re.compile('|'.join(word_patterns), re.IGNORECASE)
    
    def detect_negative_words(self, text: str) -> Tuple[bool, List[str]]:
        """
        テキスト内のネガティブワードを検出
        
        Args:
            text: 検査対象のテキスト
            
        Returns:
            (ネガティブワードが検出されたか, 検出された単語のリスト)
        """
        if not text.strip():
            return False, []
        
        try:
            # 正規表現で検索
            matches = self.compiled_pattern.findall(text)
            
            # 重複を除去
            detected_words = list(set(matches))
            
            # 検出結果
            has_negative = len(detected_words) > 0
            
            if has_negative:
                self.logger.info(f"ネガティブワード検出: {detected_words}")
            
            return has_negative, detected_words
            
        except Exception as e:
            self.logger.error(f"ネガティブワード検出エラー: {e}")
            return False, []
    
    def get_word_count(self) -> int:
        """
        登録されているネガティブワードの総数を返す
        """
        return len(self.negative_words)
    
    def add_word(self, word: str) -> None:
        """
        ネガティブワードを動的に追加
        
        Args:
            word: 追加する単語
        """
        self.negative_words.add(word)
        self.compile_patterns()  # パターンを再コンパイル
        self.logger.info(f"ネガティブワード追加: {word}")