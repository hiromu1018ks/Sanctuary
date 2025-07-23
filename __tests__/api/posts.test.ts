/**
 * @jest-environment node
 */

const mockSupabaseClient = {
  from: jest.fn(() => ({
    insert: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
};

// テスト環境でSupabaseの実際のデータベース接続を回避し、テストの独立性と実行速度を確保
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
}));

import { POST } from "@/app/api/posts/route";

// Next.js App RouterのRequestオブジェクトを模擬する工場関数
// 実際のHTTPリクエスト環境に依存せずにAPIハンドラーの動作を検証するため
const createMockRequest = (data: any): Request =>
  ({
    json: jest.fn().mockResolvedValue(data),
    method: "POST",
  }) as unknown as Request;

describe("/api/posts", () => {
  test("有効なデータでPOSTリクエストが送信されると、200 OKステータスを返す", async () => {
    // 最小限のテストデータを使用し、APIの基本的な正常系フローを検証
    const postData = { content: "こんにちは" };

    const request = createMockRequest(postData);
    const response = await POST(request);

    // APIが基本的な成功レスポンスを返すことを確認 - 詳細な機能実装前の基盤動作を保証
    expect(response.status).toBe(200);
  });

  test("有効なデータでPOSTリクエストが送信されると、データがpostsテーブルに正常に挿入される", async () => {
    const postData = { content: "テスト投稿" };
    const request = createMockRequest(postData);

    await POST(request);

    expect(mockSupabaseClient.from).toHaveBeenCalledWith("posts");
    expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith(postData);
  });
});
