interface AIModerationRequest {
  content: string;
}

interface AIModerationResponse {
  status: "approved" | "rejected";
  is_approved: boolean;
  confidence_score: number;
  bert_scores: {
    positive: number;
    negative: number;
    neutral: number;
  };
  negative_words: string[];
  rejection_reasons: string[];
  processing_time_ms?: number;
}

export class AIReviewService {
  private readonly apiUrl: string;

  constructor() {
    // Python AI審査APIのURL
    this.apiUrl = process.env.AI_REVIEW_API_URL || "http://localhost:8000";
  }

  async moderateContent(
    content: string
  ): Promise<AIModerationResponse & { userMessage?: string[] }> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/moderate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`AI審査API error: ${response.status}`);
      }

      const result: AIModerationResponse = await response.json();
      return {
        ...result,
        userMessage: this.formatUserMessage(result.rejection_reasons),
      };
    } catch (error) {
      console.error("AI審査エラー:", error);
      const errorReasons = ["AI審査システムエラー"];
      return {
        status: "rejected",
        is_approved: false,
        confidence_score: 0.0,
        bert_scores: { positive: 0, negative: 0, neutral: 0 },
        negative_words: [],
        rejection_reasons: errorReasons,
        userMessage: this.formatUserMessage(errorReasons),
      };
    }
  }

  private formatUserMessage(reasons: string[]): string[] {
    return reasons.map(reason => {
      if (reason.includes("ポジティブスコア不足")) {
        return "Sanctuaryではより前向きな投稿を推奨しています";
      }
      if (reason.includes("ネガティブスコア過大")) {
        return "より建設的な表現での投稿をお願いします";
      }
      if (reason.includes("ネガティブワード検出")) {
        return "不適切な表現が含まれています";
      }
      if (reason.includes("AI審査システムエラー")) {
        return "一時的な問題が発生しました。しばらくしてから再度お試しください";
      }
      return "投稿内容を見直してください";
    });
  }
}
