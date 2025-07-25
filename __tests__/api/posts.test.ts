/**
 * @jest-environment node
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

describe("POST /api/posts", () => {
  const TEST_USER_ID = "5d3d00e0-8044-4f43-baee-3dfb15fc349a";

  let supabase: ReturnType<typeof createClient>;

  // 各テストの前にSupabaseクライアントを初期化
  beforeEach(() => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  });

  test("有効な投稿データがpostsテーブルに正常に保存されること", async () => {
    // Arrange
    const testContent = `This is a test post - ${Date.now()}`;

    // Act
    const { error } = await supabase.from("posts").insert({
      user_id: TEST_USER_ID,
      content: testContent,
    });

    // Assert
    expect(error).toBeNull();

    const { data: savedPosts } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", TEST_USER_ID)
      .eq("content", testContent);

    expect(savedPosts).toHaveLength(1);
    expect(savedPosts![0].content).toBe(testContent);

    // Clean up
    await supabase.from("posts").delete().eq("content", testContent);
  });
});
