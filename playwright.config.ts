import { defineConfig, devices } from "playwright/test";

export default defineConfig({
  // E2Eテストファイルの格納場所を指定
  testDir: "./e2e",

  // 長時間実行されるE2Eテストでのタイムアウト防止のため30秒に設定
  timeout: 30 * 1000,

  expect: {
    // DOM要素の状態変化待機時間を短めに設定し、テスト実行時間を短縮
    timeout: 5000,
  },

  // テスト実行速度向上のため、全テストを並列実行
  fullyParallel: true,

  // CI環境でのみ.only()の使用を禁止し、全テストが実行されることを保証
  forbidOnly: !!process.env.CI,

  // CI環境では不安定なテストによる失敗を防ぐため2回リトライ
  retries: process.env.CI ? 2 : 0,

  // CI環境では並列実行による不安定性を避けるため単一ワーカーで実行
  workers: process.env.CI ? 1 : undefined,

  // テスト結果を視覚的に確認できるHTML形式のレポートを出力
  reporter: "html",

  use: {
    // Next.js開発サーバーのデフォルトURL
    baseURL: "http://localhost:3000",

    // デバッグ効率化のため、失敗時の再実行でのみトレースを記録
    trace: "on-first-retry",

    // ストレージ使用量を抑制するため、失敗時のみスクリーンショットを保存
    screenshot: "only-on-failure",
  },

  projects: [
    {
      // 最も一般的なブラウザ環境でのテストを実行
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    // テスト前にNext.js開発サーバーを自動起動
    command: "npm run dev",
    url: "http://localhost:3000",

    // ローカル開発では既存のサーバーを再利用し、起動時間を短縮
    reuseExistingServer: !process.env.CI,
  },
});
