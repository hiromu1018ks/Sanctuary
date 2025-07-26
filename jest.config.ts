import type { Config } from "jest";

const nextJest = require("next/jest");

// Next.jsプロジェクト用のJest設定を自動生成するためのファクトリー関数を作成
// Next.jsの内部的な設定（TypeScript、CSS modules、エイリアスなど）を自動的に処理
const createJestConfig = nextJest({
  dir: "./",
});

// プロジェクト固有のJest設定を定義
const config: Config = {
  // テスト実行前にjest-domのマッチャーを読み込み、DOM要素のテストを可能にする
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // React コンポーネントのテストでDOM操作を可能にするためjsdom環境を使用
  testEnvironment: "jsdom",

  // Next.jsのパスエイリアス（@/）をJestでも解決できるようにマッピング
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Supabaseクライアントライブラリをテスト環境でトランスパイル対象に含める
  // これらのライブラリはESMモジュールのため、Jestでの実行にはトランスパイルが必要
  transformIgnorePatterns: [
    "node_modules/(?!(isows|@supabase|@supabase/.*|msw|msw/.*)/)",
  ],

  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],

  // TypeScriptファイルをES Modulesとして扱う設定
  // モジュールのimport/exportを正しく処理するために必要
  extensionsToTreatAsEsm: [".ts", ".tsx"],

  // Next.jsのビルドファイルとnode_modulesをテスト対象から除外
  // パフォーマンス向上と不要なテスト実行を防ぐため
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
};

// Next.jsの設定とカスタム設定を統合した最終的なJest設定を出力
module.exports = createJestConfig(config);
