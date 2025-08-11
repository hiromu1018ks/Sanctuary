import { GoogleGenerativeAI } from "@google/generative-ai";

// GeminiのAIモデレーションレスポンスを表すインターフェース
interface GeminiModerationResponse {
  is_approved: boolean;
  confidence_score: number;
  status: "approved" | "rejected";
  rejection_reasons: string[];
  userMessage?: string[];
  suggested_content?: string;
}

export class GeminiAIReviewService {
  private genAI: GoogleGenerativeAI;
  private model;

  constructor() {
    // Google Gemini APIキーを環境変数から取得
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY環境変数が設定されていません");
    }

    // GoogleGenerativeAIインスタンスを初期化
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Geminiモデル（gemini-2.0-flash-lite）を取得
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
    });
  }

  // 投稿内容をAIで審査し、承認・却下・改善案を返す
  async moderateContent(content: string): Promise<GeminiModerationResponse> {
    try {
      console.log("=== Gemini API 開始 ===");
      console.log("入力コンテンツ:", content);

      // 投稿内容をAIで判定
      const judgmentResult = await this.judgeContent(content);
      console.log("判定結果:", judgmentResult);

      if (judgmentResult.is_approved) {
        console.log("✅ 承認されました");
        // 承認された場合のレスポンスを返す
        return {
          is_approved: true,
          confidence_score: judgmentResult.confidence_score,
          status: "approved",
          rejection_reasons: [],
          userMessage: ["投稿が承認されました"],
        };
      } else {
        console.log("❌ 拒否されました。改善提案を生成中...");
        // 却下された場合、改善案を生成してレスポンスに含める
        const suggestion = await this.generateSuggestion(content);
        console.log("改善提案:", suggestion);
        return {
          is_approved: false,
          confidence_score: judgmentResult.confidence_score,
          status: "rejected",
          rejection_reasons: judgmentResult.rejection_reasons,
          userMessage: ["もう少しポジティブな表現で投稿してみませんか？"],
          suggested_content: suggestion,
        };
      }
    } catch (error) {
      // エラー発生時のレスポンス
      console.error("=== Gemini API エラー詳細 ===");
      console.error("エラー:", error);
      console.error("エラーメッセージ:", error?.message);
      console.error("エラーの詳細:", JSON.stringify(error, null, 2));
      return {
        is_approved: false,
        confidence_score: 0.0,
        status: "rejected",
        rejection_reasons: ["システムエラーが発生しました"],
        userMessage: [
          "一時的な問題が発生しました。しばらくしてから再度お試しください。",
        ],
      };
    }
  }

  // 投稿内容をAIに判定させ、承認可否・理由・信頼度を取得
  private async judgeContent(content: string): Promise<{
    is_approved: boolean;
    confidence_score: number;
    rejection_reasons: string[];
  }> {
    // AIに渡すプロンプトを作成（審査基準・投稿内容・回答形式を指定）
    const prompt = `
  あなたはSNSの投稿審査AIです。以下の投稿内容を分析してください。

  【審査基準】
  - ポジティブ、感謝、応援、喜び、成功体験、希望に満ちた内容：承認
  - 少しでもネガティブ、愚痴、不満、悲しみ、問題、困った内容：拒否

  【厳格な判定】
  「嫌なこと」「辛い」「悪い」「困った」「疲れた」「
  ムカつく」などの表現は全て拒否してください。

  【投稿内容】
  "${content}"

  以下のJSON形式で必ず回答してください。他の文章は一切含めないでください：
  {"is_approved": true, "confidence_score": 0.8,
  "rejection_reasons": []}
  `;

    // Geminiモデルでコンテンツ生成（AI判定を取得）
    const result = await this.model.generateContent(prompt);
    const response = result.response.text().trim();
    console.log("Gemini生の返答:", response);

    try {
      let jsonText = response;
      if (response.includes("```json")) {
        const match = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (match) {
          jsonText = match[1];
        }
      }

      console.log("JSON解析対象:", jsonText);

      // AIのJSONレスポンスをパースして返却
      const parsed = JSON.parse(jsonText);
      return {
        is_approved: parsed.is_approved,
        confidence_score: parsed.confidence_score,
        rejection_reasons: parsed.rejection_reasons,
      };
    } catch {
      // パース失敗時はデフォルト値を返却
      return {
        is_approved: false,
        confidence_score: 0.5,
        rejection_reasons: ["投稿内容の解析に失敗しました"],
      };
    }
  }

  // 却下された投稿内容をより前向きな表現に書き換える案を生成
  private async generateSuggestion(content: string): Promise<string> {
    // AIに渡すプロンプトを作成（前向きな表現への書き換えルールを指定）
    const prompt = `
  以下の投稿内容をより前向きで建設的な表現に書き換えてください。元の意味は保ちつつ、ポジティブな言い回しに変更してください。

  【元の投稿】
  "${content}"

  【書き換えのルール】
  - 同じ話題について書く
  - より前向きな表現を使う
  - 感謝や希望を含める
  - 簡潔にまとめる

  【改善された投稿内容のみを回答してください】
  `;

    // Geminiモデルで改善案を生成
    const result = await this.model.generateContent(prompt);
    return result.response.text().trim();
  }
}
