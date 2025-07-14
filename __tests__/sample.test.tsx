// Jest DOMの拡張マッチャーを有効化（toBeInDocumentなどのDOM専用アサーションを使用するため）
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

// テスト専用のシンプルなコンポーネント
// 実際のアプリケーションコンポーネントではなく、テストの動作確認のみを目的とする
function TestComponent() {
  return <h1>Hello, Jest!</h1>;
}

// Jest と React Testing Library の基本的な動作確認を行うテストスイート
// 新しいプロジェクトでテスト環境が正しく設定されているかを検証する
describe("Jest and React Testing Library Setup", () => {
  // React コンポーネントの DOM レンダリングとアクセシビリティロールによる要素検索をテスト
  // screen.getByRole を使用することで、アクセシブルなテストを記述できることを確認
  it("renders a heading", () => {
    render(<TestComponent />);
    const heading = screen.getByRole("heading", { name: /hello, jest/i });
    expect(heading).toBeInTheDocument();
  });

  // Jest の基本的な動作確認用のテスト
  // テスト環境そのものが正常に動作することを保証する
  it("can run basic test", () => {
    expect(1 + 1).toBe(2);
  });
});
