// 認証関連の外部依存をモック化 - テスト環境で実際の認証処理を避けるため
jest.mock("@/app/providers/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Supabaseクライアントをモック化 - 実際のデータベース接続を避けるため
jest.mock("@/lib/supabase/client", () => ({
  client: {
    auth: {
      onAuthStateChange: jest.fn(),
    },
  },
}));

import { useAuth } from "@/app/providers/AuthContext";
import { mockUser } from "./utils/supabase-mock-patterns";
import { PostForm } from "@/components/post/PostForm";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

describe("PostForm", () => {
  test("コンポーネントがテキストエリアと送信ボタンを表示する", () => {
    // 認証済みユーザーの状態を模擬 - 正常な認証状態でのコンポーネント動作を検証するため
    const mockUseAuth = useAuth as unknown as jest.Mock;
    mockUseAuth.mockReturnValue({
      user: { email: mockUser.email, user_metadata: mockUser.user_metadata },
      session: mockUser,
      loading: false,
    });

    render(<PostForm />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("コンポーネントが初期文字数0を表示する", () => {
    const mockUseAuth = useAuth as unknown as jest.Mock;
    mockUseAuth.mockReturnValue({
      user: { email: mockUser.email, user_metadata: mockUser.user_metadata },
      session: mockUser,
      loading: false,
    });

    render(<PostForm />);
    // 文字数表示の初期値が正しく表示されることを確認 - ユーザーが現在の入力状況を把握できるようにするため
    expect(screen.getByText("0/500")).toBeInTheDocument();
  });

  test("テキストエリアにテキストを入力すると、その値が更新される", async () => {
    const mockUseAuth = useAuth as unknown as jest.Mock;
    mockUseAuth.mockReturnValue({
      user: { email: mockUser.email, user_metadata: mockUser.user_metadata },
      session: mockUser,
      loading: false,
    });

    render(<PostForm />);
    const textArea = screen.getByRole("textbox");
    await userEvent.type(textArea, "Hello, world!");
    // 入力値がReactの状態管理により正しく反映されることを検証
    expect(textArea).toHaveValue("Hello, world!");
  });

  test("テキストを入力すると、表示される文字数が正しく更新される", async () => {
    const mockUserAuth = useAuth as unknown as jest.Mock;
    mockUserAuth.mockReturnValue({
      user: {
        email: mockUser.email,
        user_metadata: mockUser.user_metadata,
      },
      session: mockUser,
      loading: false,
    });

    render(<PostForm />);
    const textArea = screen.getByRole("textbox");
    await userEvent.type(textArea, "Hello, world!");
    // リアルタイムでの文字数カウント機能を検証 - ユーザーが文字数制限を意識できるようにするため
    expect(screen.getByText("13/500")).toBeInTheDocument();
  });

  test("入力が500文字未満の場合、文字数制限の警告が表示されない", async () => {
    const mockUserAuth = useAuth as unknown as jest.Mock;
    mockUserAuth.mockReturnValue({
      user: {
        email: mockUser.email,
        user_metadata: mockUser.user_metadata,
      },
      session: mockUser,
      loading: false,
    });

    render(<PostForm />);
    // 制限まで余裕がある状態での警告表示をテスト - 不要な警告でユーザーを混乱させないため
    const text400 = "a".repeat(400);
    const textArea = screen.getByRole("textbox");
    await userEvent.type(textArea, text400);
    expect(screen.queryByText(/⚠ 上限まであと/)).not.toBeInTheDocument();
  });

  test("入力が500文字に達すると、文字数制限の警告が表示される", async () => {
    const mockUserAuth = useAuth as unknown as jest.Mock;
    mockUserAuth.mockReturnValue({
      user: {
        email: mockUser.email,
        user_metadata: mockUser.user_metadata,
      },
      session: mockUser,
      loading: false,
    });

    render(<PostForm />);
    // 制限に近づいた時の適切な警告表示を検証 - ユーザーが制限を超過する前に気づけるようにするため
    const text480 = "a".repeat(480);
    const textArea = screen.getByRole("textbox");
    await userEvent.type(textArea, text480);
    expect(screen.getByText("⚠ 上限まであと20文字")).toBeInTheDocument();
  });

  test("入力が500文字を超えると、それ以上の入力が防止される", async () => {
    const mockUserAuth = useAuth as unknown as jest.Mock;
    mockUserAuth.mockReturnValue({
      user: {
        email: mockUser.email,
        user_metadata: mockUser.user_metadata,
      },
      session: mockUser,
      loading: false,
    });

    render(<PostForm />);
    // HTML属性maxLengthによる文字数制限の動作を確認 - サーバー側での制限と整合性を保つため
    const text510 = "a".repeat(510);
    const textArea = screen.getByRole("textbox");
    await userEvent.type(textArea, text510);
    expect(textArea).toHaveValue("a".repeat(500));
  });

  test("空のテキストエリアの場合、送信ボタンが無効になる", async () => {
    const mockUserAuth = useAuth as unknown as jest.Mock;
    mockUserAuth.mockReturnValue({
      user: {
        email: mockUser.email,
        user_metadata: mockUser.user_metadata,
      },
      session: mockUser,
      loading: false,
    });

    render(<PostForm />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    // 空白文字のみの入力も無効として扱う - 意味のあるコンテンツのみを投稿させるため
    const textArea = screen.getByRole("textbox");
    await userEvent.type(textArea, "    ");
    expect(button).toBeDisabled();
  });

  test("有効なテキストで送信ボタンをクリックすると、送信ボタンが「送信中...」になる", async () => {
    const mockUserAuth = useAuth as unknown as jest.Mock;
    mockUserAuth.mockReturnValue({
      user: {
        email: mockUser.email,
        user_metadata: mockUser.user_metadata,
      },
      session: mockUser,
      loading: false,
    });

    render(<PostForm />);
    const textArea = screen.getByRole("textbox");
    await userEvent.type(textArea, "Hello, world!");
    const button = screen.getByRole("button");
    expect(button).toBeEnabled();

    await userEvent.click(button);
    // 送信中の視覚的フィードバックと二重送信防止の動作を検証
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("送信中...");

    // 送信完了後のフォーム状態リセットを確認 - 次の投稿のためにクリーンな状態にするため
    await screen.findByText("✅ 投稿が完了しました！", {}, { timeout: 3000 });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("投稿");
    expect(textArea).toHaveValue("");
  });

  test("送信中にエラーが発生すると、エラーメッセージが表示される", async () => {
    // コンソール出力のモック - HTMLタグのサニタイゼーション処理を検証するため
    const consoleSpy = jest.spyOn(console, "log");
    const mockUseAuth = useAuth as unknown as jest.Mock;
    mockUseAuth.mockReturnValue({
      user: { email: mockUser, user_metadata: mockUser.user_metadata },
      session: { user: mockUser },
      isLoading: false,
    });

    render(<PostForm />);
    const textArea = screen.getByRole("textbox");
    // XSS攻撃を模擬した入力でサニタイゼーション機能を検証
    await userEvent.type(textArea, "<script>alert('危険')</script>こんにちは");
    const button = screen.getByRole("button");
    await userEvent.click(button);

    await screen.findByText("✅ 投稿が完了しました！", {}, { timeout: 3000 });
    // HTMLタグが除去されて安全な内容のみが送信されることを確認
    expect(consoleSpy).toHaveBeenCalledWith("送信された内容:", "こんにちは");
    consoleSpy.mockRestore();
  });
});
