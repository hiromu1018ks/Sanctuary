import { test, expect } from "playwright/test";

test.describe("Sanctuary E2E Tests", () => {
  test("should display the homepage", async ({ page }) => {
    // ルートパスでアプリケーションの基本的な読み込み動作を確認
    // Next.jsアプリケーションのルーティングとSSR/SSGが正常に機能することを検証
    await page.goto("/");

    // ページタイトルの確認により、正しいページが表示されていることを保証
    // SEO設定とブランディングが適切に反映されているかを検証
    await expect(page).toHaveTitle(/Sanctuary/);

    // body要素の可視性チェックで、基本的なDOM構造が正常に構築されていることを確認
    await expect(page.locator("body")).toBeVisible();
  });

  test("should have basic navigation", async ({ page }) => {
    // ナビゲーション機能の基本的な動作確認のためのテスト
    // 将来的にヘッダーやメニューなどのナビゲーション要素のテストを追加予定
    await page.goto("/");

    // 現在は基本的な表示確認のみだが、ナビゲーション要素の実装後に
    // リンクのクリック動作やページ遷移の検証を追加する予定
    await expect(page.locator("body")).toBeVisible();
  });
});
