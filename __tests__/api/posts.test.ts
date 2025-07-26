/**
 * @jest-environment node
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { createClient as mockCreateServerClient } from "@/lib/supabase/server";
import { POST } from "@/app/api/posts/route";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

config({ path: ".env.local" });

describe("POST /api/posts", () => {
  const TEST_USER_ID = "5d3d00e0-8044-4f43-baee-3dfb15fc349a";

  let supabase: ReturnType<typeof createClient>;

  // 各テストごとに新しいSupabaseクライアントを生成し、テスト間の状態の影響を防ぐ
  beforeEach(() => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  });

  // このテストは、正しい投稿データがpostsテーブルに保存されることを確認する
  test("有効な投稿データがpostsテーブルに正常に保存されること", async () => {
    // Arrange
    // 一意な投稿内容を生成（重複を避けるためにタイムスタンプを付与）
    const testContent = `This is a test post - ${Date.now()}`;

    // Act
    // postsテーブルにテスト用の投稿データ（user_idとcontentのみ）を挿入
    const { error } = await supabase.from("posts").insert({
      user_id: TEST_USER_ID,
      content: testContent,
    });

    // Assert
    expect(error).toBeNull();

    // 指定したユーザーIDと投稿内容で保存された投稿データを取得し、テストで作成したデータのみを抽出する
    const { data: savedPosts } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", TEST_USER_ID)
      .eq("content", testContent);

    // 保存された投稿が1件のみ存在し、内容が期待通りであることを検証する
    expect(savedPosts).toHaveLength(1);
    expect(savedPosts![0].content).toBe(testContent);

    // Clean up
    // テストで作成した投稿データを削除し、DBを元の状態に戻す
    await supabase.from("posts").delete().eq("content", testContent);
  });

  test("保存されたデータがデフォルト値で適切に初期化されること", async () => {
    // Arrange
    const testContent = `デフォルト値テスト - ${Date.now()}`;

    // Act
    // Supabaseのpostsテーブルに新しい投稿を挿入し、エラーが発生しないことを確認する
    const { error } = await supabase.from("posts").insert({
      user_id: TEST_USER_ID,
      content: testContent,
    });

    // Assert
    // 挿入時にエラーが発生しないことをアサート
    expect(error).toBeNull();

    // テストユーザーと投稿内容でpostsテーブルから該当レコードを取得
    const { data: savedPosts } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", TEST_USER_ID)
      .eq("content", testContent);

    // 1件だけ保存されていることを確認
    expect(savedPosts).toHaveLength(1);

    const savedPost = savedPosts![0];

    // statusカラムがデフォルト値"pending"で保存されていることを確認
    expect(savedPost.status).toBe("pending");
    // post_idが自動生成されていることを確認
    expect(savedPost.post_id).toBeDefined();
    expect(typeof savedPost.post_id).toBe("string");

    // created_at, updated_atが自動でセットされていることを確認
    expect(savedPost.created_at).toBeDefined();
    expect(savedPost.updated_at).toBeDefined();

    // 保存された投稿のcreated_atフィールドをDateオブジェクトに変換
    const savedTime = new Date(savedPost.created_at as string);
    // 保存された日時が有効なタイムスタンプであることを確認
    expect(savedTime.getTime()).toBeGreaterThan(0);
    // savedTimeが有効な日付であることを確認
    expect(!isNaN(savedTime.getTime())).toBe(true);

    // Clean up
    await supabase.from("posts").delete().eq("content", testContent);
  });

  test("保存された投稿に適切なuser_idが設定されること", async () => {
    const testContent = `認証テスト投稿 - ${Date.now()}`;

    // Supabaseクライアントの認証部分をモックし、認証済みユーザーIDを返す
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: TEST_USER_ID } },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          }),
        }),
      }),
    };

    // createServerClientの戻り値としてモックSupabaseを使用
    (mockCreateServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    // テスト用のリクエストオブジェクトを作成
    const mockRequest = {
      json: async () => ({ content: testContent }),
    } as Request;

    // POST APIを呼び出し
    const response = await POST(mockRequest);

    // レスポンスが正常(200)であることを確認
    expect(response.status).toBe(200);
    // postsテーブルへのinsertが呼ばれていることを確認
    expect(mockSupabase.from).toHaveBeenCalledWith("posts");
    // user_idとcontentが正しくinsertされていることを確認
    expect(mockSupabase.from().insert).toHaveBeenCalledWith({
      user_id: TEST_USER_ID,
      content: testContent.trim(),
      status: "pending",
    });

    // Cluan up
    await supabase.from("posts").delete().eq("content", testContent);
  });

  test("認証されていないユーザーの投稿は401エラーで拒否されること", async () => {
    const testContent = `認証失敗テスト - ${Date.now()}`;

    // Supabaseクライアントの認証部分をモックし、認証失敗を返す
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "Invalid token" },
        }),
      },
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      }),
    };

    // createServerClientの戻り値としてモックSupabaseを使用
    (mockCreateServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    // テスト用のリクエストオブジェクトを作成
    const mockRequest = {
      json: async () => ({ content: testContent }),
    } as Request;

    // POST APIを呼び出し
    const response = await POST(mockRequest);

    // 認証失敗時は401エラーが返ることを確認
    expect(response.status).toBe(401);

    // レスポンスボディにエラーメッセージが含まれることを確認
    const responseBody = await response.json();
    expect(responseBody.error).toBe("認証が必要です");

    // 認証失敗時はinsertが呼ばれていないことを確認
    expect(mockSupabase.from().insert).not.toHaveBeenCalled();
  });

  test("データベースエラー時に500エラーが返されること", async () => {
    const testContent = `DBエラーテスト - ${Date.now()}`;

    // Supabaseクライアントの認証部分をモックし、認証済みユーザーIDを返す
    // insert時にDBエラーを返すようにモック
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: TEST_USER_ID } },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: {
            message: "Database connection failed",
            code: "CONNECTTION_ERROR",
          },
        }),
      }),
    };

    // createServerClientの戻り値としてモックSupabaseを使用
    (mockCreateServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    // テスト用のリクエストオブジェクトを作成
    const mockRequest = {
      json: async () => ({ content: testContent }),
    } as Request;

    // POST APIを呼び出し
    const response = await POST(mockRequest);

    // DBエラー時は500エラーが返ることを確認
    expect(response.status).toBe(500);

    // レスポンスボディにDBエラーメッセージが含まれることを確認
    const responseBody = await response.json();
    expect(responseBody.error).toBe("Database connection failed");

    // postsテーブルへのinsertが呼ばれていることを確認
    expect(mockSupabase.from).toHaveBeenCalledWith("posts");
    // user_idとcontentが正しくinsertされていることを確認
    expect(mockSupabase.from().insert).toHaveBeenCalledWith({
      user_id: TEST_USER_ID,
      content: testContent.trim(),
      status: "pending",
    });
  });

  test("新規投稿を作成すると、初期状態が`pending`になる", async () => {
    const testContent = `初期状態テスト - ${Date.now()}`;

    const { error } = await supabase.from("posts").insert({
      user_id: TEST_USER_ID,
      content: testContent,
    });

    expect(error).toBeNull();

    const { data: savedPosts } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", TEST_USER_ID)
      .eq("content", testContent);

    expect(savedPosts).toHaveLength(1);
    expect(savedPosts![0].status).toBe("pending");

    await supabase.from("posts").delete().eq("content", testContent);
  });

  test("MVP期間中は、pending投稿が即座にapprovedに自動変更される", async () => {
    const testContent = `MVP期間中の自動承認テスト - ${Date.now()}`;

    // Supabaseクライアントの認証部分をモックし、認証済みユーザーIDを返す
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: TEST_USER_ID } },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          }),
        }),
      }),
    };

    // createServerClientの戻り値としてモックSupabaseを使用
    (mockCreateServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    // テスト用のリクエストオブジェクトを作成
    const mockRequest = {
      json: async () => ({ content: testContent }),
    } as Request;

    // POST APIを呼び出し
    const response = await POST(mockRequest);

    // レスポンスが正常(200)であることを確認
    expect(response.status).toBe(200);

    // postsテーブルへのinsertが呼ばれていることを確認
    expect(mockSupabase.from).toHaveBeenCalledWith("posts");
    expect(mockSupabase.from().insert).toHaveBeenCalledWith({
      user_id: TEST_USER_ID,
      content: testContent.trim(),
      status: "pending",
    });

    // MVP期間中の自動承認updateが呼ばれていることを確認
    expect(mockSupabase.from().update).toHaveBeenCalledWith({
      status: "approved",
      approved_at: expect.any(String),
    });

    // update条件が正しいことを確認
    const updateCall = mockSupabase.from().update;
    const eqChain = updateCall.mock.results[0].value;
    expect(eqChain.eq).toHaveBeenCalledWith("user_id", TEST_USER_ID);
    expect(eqChain.eq().eq).toHaveBeenCalledWith("content", testContent.trim());
    expect(eqChain.eq().eq().eq).toHaveBeenCalledWith("status", "pending");
  });
});
