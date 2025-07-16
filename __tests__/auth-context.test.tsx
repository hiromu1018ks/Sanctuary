// Supabaseクライアントの認証機能をモック化
// 実際のSupabaseサーバーへの接続を回避し、テストの実行速度と安定性を向上させる
jest.mock("@/lib/supabase/client", () => ({
  client: {
    auth: {
      onAuthStateChange: jest.fn(),
    },
  },
}));

import { AuthProvider, useAuth } from "@/app/providers/AuthContext";
import {
  MockSubscription,
  MockSupabaseClient,
  MockUser,
  mockUser,
  setupMockAuthLoggedIn,
  setupMockAuthLoggedOut,
} from "./utils/supabase-mock-patterns";
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { client } from "@/lib/supabase/client";

// TypeScriptの型システムを回避してモックオブジェクトへの安全なアクセスを実現
const mockClient = client as unknown as MockSupabaseClient;

// テスト専用のコンポーネント
// 認証状態の変化をUIレベルで検証するための最小限の実装
const TestComponent = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (user) return <div>Logged in: {user.user_metadata.name}</div>;
  return <div>Not logged in</div>;
};

describe("AuthContent", () => {
  beforeEach(() => {
    // テスト間でのモック状態の漏れを防ぐクリーンアップ
    jest.clearAllMocks();
  });

  test("ログイン状態のテスト", async () => {
    setupMockAuthLoggedIn(mockClient);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // 認証状態の変更がReactのstate更新サイクルを通じて反映されるまで待機
    await waitFor(() => {
      expect(screen.getByText("Logged in: Test User")).toBeInTheDocument();
    });
  });

  test("ログアウト状態のテスト", async () => {
    setupMockAuthLoggedOut(mockClient);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument();
    });
  });
});

describe("AuthProviderの状態管理ロジック", () => {
  test("初期状態が正しく設定される", () => {
    const mockClient = client as unknown as MockSupabaseClient;

    // 認証状態の変更通知を送信せず、サブスクリプションのみを返すよう設定
    // これによりAuthProviderは初期のloading状態を維持する
    mockClient.auth.onAuthStateChange.mockImplementation(() => {
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // 認証状態の変更コールバックが実行されていないため、初期状態が継続される
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Logged in:")).not.toBeInTheDocument();
    expect(screen.queryByText("Not logged in")).not.toBeInTheDocument();
  });
});

describe("useAuthカスタムフック", () => {
  test("AuthProvider内で正常に動作する - 初期状態", () => {
    const mockClient = client as unknown as MockSupabaseClient;

    // 認証状態の変更を監視するが、即座にコールバックを実行しない設定
    mockClient.auth.onAuthStateChange.mockImplementation(() => {
      return {
        data: { subscription: { unsubscribe: jest.fn() } },
      };
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    // 認証状態の取得前は必ずローディング状態になることを確認
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
    expect(result.current.session).toBe(null);
  });

  test("AuthProvider内で正常に動作する - ログイン状態", () => {
    const mockClient = client as unknown as MockSupabaseClient;

    // 初期化時に即座にログイン状態を設定
    setupMockAuthLoggedIn(mockClient);

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    // setupMockAuthLoggedInにより同期的に認証状態が設定される
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.session).toEqual({ user: mockUser });
  });

  test("AuthProvider外で使用するとエラーが発生する", () => {
    // 不適切な使用パターンに対する防御機能のテスト
    // 開発時のミスを早期に発見するための仕組み
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within a AuthProvider");
  });
});

describe("認証状態変化時のコンポーネント再レンダリング", () => {
  test("認証状態変化に応じてコンポーネントが再レンダリングされる", async () => {
    const mockClient = client as unknown as MockSupabaseClient;
    let authCallback: (
      event: string,
      session: { user: MockUser } | null
    ) => MockSubscription;

    // 認証状態の変更を手動で制御できるよう、コールバック関数を保存
    mockClient.auth.onAuthStateChange.mockImplementation(callback => {
      authCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // 認証状態の変更を手動でトリガーし、React のstate更新を同期的に実行
    act(() => {
      authCallback("SIGNED_IN", { user: mockUser });
    });

    // 認証状態の変更がUIに反映されるまで待機
    await waitFor(() => {
      expect(screen.getByText("Logged in: Test User")).toBeInTheDocument();
    });

    // ログアウト状態への変更をテスト
    act(() => {
      authCallback("SIGNED_OUT", null);
    });

    // 認証状態の変更がUIに反映されることを確認
    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument();
    });
  });
});
