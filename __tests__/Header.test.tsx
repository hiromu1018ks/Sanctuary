// 認証状態を外部から制御可能にするため、AuthContextをモック化
// 実際のSupabaseセッションに依存せず、テストシナリオに応じて任意の認証状態を設定可能
jest.mock("@/app/providers/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// 認証状態変更の監視機能をモック化
// 実際のSupabaseサーバーとの通信を遮断し、テストの予測可能性を確保
jest.mock("@/lib/supabase/client", () => ({
  client: {
    auth: {
      onAuthStateChange: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "@/components/layout/Header";
import { mockUser } from "./utils/supabase-mock-patterns";
import { useAuth } from "@/app/providers/AuthContext";
import { client } from "@/lib/supabase/client";

describe("Header Test", () => {
  test("ヘッダーが表示される。", () => {
    // 認証済み状態を模擬して、ログイン後のヘッダー表示をテスト
    // 実際のOAuth認証フローを経由せずに、認証状態に応じたUI表示を検証
    const mockUseAuth = useAuth as unknown as jest.Mock;
    mockUseAuth.mockReturnValue({
      user: { email: mockUser.email, user_metadata: mockUser.user_metadata },
      session: { user: mockUser },
      loading: false, // 初期化完了状態を設定し、ローディング表示をスキップ
    });

    render(<Header />);

    // セマンティックHTMLの適切な実装を検証
    // アクセシビリティ要件を満たし、スクリーンリーダーが正しく解釈できることを確認
    expect(screen.getByRole("banner")).toBeInTheDocument();

    // アプリケーション名の表示とホームページへのリンク機能を確認
    expect(screen.getByText("Sanctuary")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sanctuary" })).toHaveAttribute(
      "href",
      "/"
    );
  });

  test("ログアウト状態の時、Headerに「ログイン」ボタンが表示される", () => {
    // 未認証状態での適切なUI表示を検証
    const mockUseAuth = useAuth as unknown as jest.Mock;
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
    });

    render(<Header />);

    // 未認証ユーザーに対するログイン導線が適切に提供されることを確認
    expect(
      screen.getByRole("button", { name: "ログイン" })
    ).toBeInTheDocument();
  });

  test("ログアウト状態の時、Headerに『ログアウト』ボタンが表示されない", () => {
    // 認証状態に応じたUI要素の条件表示が正しく動作することを確認
    const mockUserAuth = useAuth as unknown as jest.Mock;
    mockUserAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
    });

    render(<Header />);

    // 未認証時にログアウトボタンが誤って表示されないことを確認
    // queryByRoleを使用して要素の非存在を安全に検証
    expect(
      screen.queryByRole("button", { name: "ログアウト" })
    ).not.toBeInTheDocument();
  });

  test("ログイン状態の時、Headerにユーザーのメールアドレスまたは名前が表示される -フルネームあり", () => {
    // ユーザーのメタデータからフルネームを表示する機能をテスト
    const mockUserAuth = useAuth as unknown as jest.Mock;
    mockUserAuth.mockReturnValue({
      user: {
        email: mockUser.email,
        user_metadata: mockUser.user_metadata,
      },
      session: { user: mockUser },
      loading: false,
    });

    render(<Header />);

    // フルネームが利用可能な場合の表示内容を確認
    expect(screen.getByText("Test Userさん")).toBeInTheDocument();
  });

  test("ログイン状態の時、Headerにユーザーのメールアドレスまたは名前が表示される -フルネームなし", () => {
    // フルネームが未設定の場合のフォールバック表示をテスト
    const mockUserAuth = useAuth as unknown as jest.Mock;
    mockUserAuth.mockReturnValue({
      user: {
        email: mockUser.email,
        user_metadata: {}, // フルネーム情報を意図的に空にして条件をテスト
      },
      session: { user: mockUser },
      loading: false,
    });

    render(<Header />);

    // フルネームが存在しない場合、メールアドレスが表示されることを確認
    expect(screen.getByText("test@example.comさん")).toBeInTheDocument();
  });

  test("ログイン状態の時、Headerにユーザーのメールアドレスまたは名前が表示される -フルネーム,メールなし", () => {
    // 極端なエッジケースでのフォールバック表示をテスト
    const mockUserAuth = useAuth as unknown as jest.Mock;
    mockUserAuth.mockReturnValue({
      user: {
        email: undefined, // メールアドレスも未定義の状態を模擬
        user_metadata: {},
      },
      session: { user: mockUser },
      loading: false,
    });

    render(<Header />);

    // すべてのユーザー情報が欠如している場合の最終的なフォールバック表示を確認
    expect(screen.getByText("ゲストさん")).toBeInTheDocument();
  });

  test("ログイン状態の時、Headerに『ログアウト』ボタンが表示される", () => {
    // 認証済みユーザーに対するログアウト機能の提供を確認
    const mockUserAuth = useAuth as unknown as jest.Mock;
    mockUserAuth.mockReturnValue({
      user: {
        email: mockUser.email,
        user_metadata: mockUser.user_metadata,
      },
      session: { user: mockUser },
      loading: false,
    });

    render(<Header />);

    // ログイン状態でログアウトボタンが適切に表示されることを確認
    expect(
      screen.getByRole("button", { name: "ログアウト" })
    ).toBeInTheDocument();
  });

  test("ログイン状態の時、Headerに『ログイン』ボタンが表示されない", () => {
    // 認証状態に応じたUI要素の条件表示が正しく動作することを確認
    const mockUserAuth = useAuth as unknown as jest.Mock;
    mockUserAuth.mockReturnValue({
      user: {
        email: mockUser.email,
        user_metadata: mockUser.user_metadata,
      },
      session: { user: mockUser },
      loading: false,
    });

    render(<Header />);

    // 認証済み時にログインボタンが誤って表示されないことを確認
    expect(
      screen.queryByRole("button", { name: "ログイン" })
    ).not.toBeInTheDocument();
  });

  test("『ログアウト』ボタンをクリックした時、認証の signOut 関数が呼び出される", () => {
    // ログアウト機能の実装が正しく動作することを確認
    const mockUserAuth = useAuth as unknown as jest.Mock;
    mockUserAuth.mockReturnValue({
      user: {
        email: mockUser.email,
        user_metadata: mockUser.user_metadata,
      },
      session: { user: mockUser },
      loading: false,
    });

    render(<Header />);

    const button = screen.getByRole("button", { name: "ログアウト" });
    fireEvent.click(button);

    // Supabaseのログアウト処理が適切に呼び出されることを確認
    expect(client.auth.signOut).toHaveBeenCalled();
  });
});
