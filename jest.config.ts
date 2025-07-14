import type { Config } from "jest";
import nextJest from "next/jest";

// Next.jsプロジェクト用のJest設定を自動生成するためのファクトリー関数を作成
// Next.jsの内部的な設定（TypeScript、CSS modules、エイリアスなど）を自動的に処理
const createJestConfig = nextJest({
  dir: "./",
});

// プロジェクト固有のJest設定を定義
const config: Config = {
  // テスト実行前にjest-domのマッチャーを読み込み、DOM要素のテストを可能にする
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // React コンポーネントのテストでDOM操作を可能にするためjsdom環境を使用
  testEnvironment: "jsdom",

  // Next.jsのパスエイリアス（@/）をJestでも解決できるようにマッピング
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

// Next.jsの設定とカスタム設定を統合した最終的なJest設定を出力
module.exports = createJestConfig(config);
