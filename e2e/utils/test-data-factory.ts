import { faker } from "@faker-js/faker";

// テストデータの識別とクリーンアップを容易にするための接頭辞
const TEST_PREFIX = "test_";

// テストユーザーの型定義
// 実際のユーザーテーブルの構造に合わせて定義
export interface TestUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// テスト投稿の型定義
// 実際の投稿テーブルの構造に合わせて定義
export interface TestPost {
  id: string;
  content: string;
  user_id: string;
  status: "approved" | "pending" | "rejected";
  createdAt: string;
}

// テストユーザーを生成するファクトリー関数
// overridesパラメータにより、特定の値を持つユーザーを作成可能
export const createTestUser = (overrides: Partial<TestUser> = {}) => ({
  // TEST_PREFIXを使用してテストデータであることを明確化
  id: `${TEST_PREFIX}user_${faker.string.uuid()}`,
  // 実際のメールアドレス形式でランダムなテストデータを生成
  email: faker.internet.email(),
  // 現実的な人名を生成してテストの信頼性を向上
  name: faker.person.fullName(),
  // 最近の日付を生成してリアルなテスト環境を提供
  createdAt: faker.date.recent().toISOString(),
  // overridesで指定された値で既定値を上書き
  ...overrides,
});

// テスト投稿を生成するファクトリー関数
// userIdを必須パラメータとして受け取り、投稿とユーザーの関連性を保証
export const createTestPost = (
  userId: string,
  overrides: Partial<TestPost> = {}
) => ({
  // TEST_PREFIXを使用してテストデータであることを明確化
  id: `${TEST_PREFIX}post_${faker.string.uuid()}`,
  // ランダムな文章を生成してコンテンツテストに利用
  content: faker.lorem.sentence(),
  // 引数で渡されたuserIdを使用してユーザーとの関連性を確立
  user_id: userId,
  // デフォルトで承認済みステータスを設定し、一般的なテストケースに対応
  status: "approved",
  // 最近の日付を生成してリアルなテスト環境を提供
  createdAt: faker.date.recent().toISOString(),
  // overridesで指定された値で既定値を上書き
  ...overrides,
});

// 複数のテストユーザーを一度に生成するためのヘルパー関数
// 大量のテストデータが必要な場合に使用
export const createTestUsers = (count: number) => {
  return Array.from({ length: count }, () => createTestUser());
};

// 特定のユーザーに関連付けられた複数の投稿を生成するヘルパー関数
// ユーザーと投稿の関連性をテストする際に使用
export const createTestPosts = (userId: string, count: number) => {
  return Array.from({ length: count }, () => createTestPost(userId));
};
