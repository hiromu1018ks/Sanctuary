import { text } from "node:stream/consumers";

jest.mock("@/app/providers/AuthContext", () => ({
  useAuth: jest.fn(),
}));

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
import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

describe("PostForm", () => {
  test("コンポーネントがテキストエリアと送信ボタンを表示する", () => {
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

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("送信中...");

    await screen.findByText("✅ 投稿が完了しました！", {}, { timeout: 3000 });

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("投稿");

    expect(textArea).toHaveValue("");
  }, 10000);
});
