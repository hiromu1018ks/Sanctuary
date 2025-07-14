import { supabaseTest } from "./supabase-test-client";
import { TestPost, TestUser } from "./test-data-factory";

// テストデータの識別とクリーンアップを容易にするための接頭辞
const TEST_PREFIX = "test_";

/**
 * 全てのテストデータを一括削除
 * テスト終了後の環境リセットや、テストスイート実行前の初期化で使用
 */
export const cleanupAllTestData = async () => {
  try {
    // posts → users の順で削除（外部キー制約を考慮した順序）
    await supabaseTest.from("posts").delete().like("id", `${TEST_PREFIX}%`);
    await supabaseTest.from("users").delete().like("id", `${TEST_PREFIX}%`);
    console.log("テストデータのクリーンアップが完了しました");
  } catch (error) {
    console.error("テストデータのクリーンアップでエラーが発生しました:", error);
    throw error;
  }
};

/**
 * 特定のテーブルのテストデータのみを削除
 * 個別のテストケースで部分的なクリーンアップが必要な場合に使用
 */
export const cleanupTestDataByTable = async (tableName: string) => {
  try {
    await supabaseTest.from(tableName).delete().like("id", `${TEST_PREFIX}%`);
    console.log(`${tableName}テーブルのテストデータを削除しました`);
  } catch (error) {
    console.error(`${tableName}テーブルのクリーンアップでエラー:`, error);
    throw error;
  }
};

/**
 * テストデータをデータベースに挿入
 * テストケース実行前の初期データ準備で使用
 */
export const seedTestData = async (
  tableName: string,
  data: TestUser | TestPost | (TestUser | TestPost)[]
) => {
  try {
    const { error } = await supabaseTest.from(tableName).insert(data);
    if (error) throw error;
    console.log(`${tableName}テーブルにテストデータを挿入しました`);
  } catch (error) {
    console.error(`${tableName}テーブルへの挿入でエラー:`, error);
    throw error;
  }
};
