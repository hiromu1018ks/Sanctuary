// テスト環境でのSupabase認証をモックするためのユーザー型定義
// 実際のSupabaseユーザーオブジェクトの構造に合わせて最小限の必要なプロパティのみを定義
export interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
  };
}

// テスト実行時にSupabaseクライアントの認証機能を置き換えるためのモック型
// 実際のSupabaseサーバーへの接続を回避し、テストの独立性と実行速度を向上させる
export interface MockSupabaseClient {
  auth: {
    onAuthStateChange: jest.Mock;
  };
}

// 認証済みセッションの最小限の表現
// テスト時にセッション情報が必要な場合に使用
export interface MockSession {
  user: MockUser;
}

// onAuthStateChangeの戻り値をモック化するための型定義
// 実際のSupabaseクライアントが返すサブスクリプションオブジェクトの構造を再現
export interface MockSubscription {
  data: {
    subscription: {
      unsubscribe: jest.Mock;
    };
  };
}

// 単体テストや統合テストで一貫した認証状態を再現するためのモックユーザー
// 実際のユーザー登録やログイン処理をスキップして、認証が必要な機能のテストを可能にする
export const mockUser: MockUser = {
  id: "test-user-id",
  email: "test@example.com",
  user_metadata: {
    full_name: "Test User",
  },
};

/**
 * テスト環境でログイン済みユーザーの認証状態をシミュレートするモック関数
 * AuthContextやSupabaseの認証機能をテストする際に、実際のログイン処理を行わずに
 * 認証済み状態を再現するために使用する
 *
 * @param mockClient - モック化されたSupabaseクライアント
 * @param user - テストで使用するユーザー情報（デフォルトはmockUser）
 *
 * 実際のSupabaseサーバーとの通信を避けることで、テストの実行速度を向上させ、
 * 外部依存による不安定さを排除する
 */
export const setupMockAuthLoggedIn = (
  mockClient: MockSupabaseClient,
  user: MockUser = mockUser
): void => {
  // onAuthStateChangeコールバックを即座に実行し、ログイン状態を模擬
  // 実際のSupabaseでは非同期的に呼び出されるが、テストでは同期的に実行して結果を予測可能にする
  mockClient.auth.onAuthStateChange.mockImplementation(callback => {
    callback("SIGNED_IN", { user });
    return {
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    };
  });
};

/**
 * ログアウト状態のSupabaseクライアントをモック化する
 * 未認証ユーザーの動作やログイン画面の表示をテストするために使用
 *
 * @param mockClient - モック化されたSupabaseクライアント
 *
 * 認証が必要な機能に対するアクセス制御や、未認証時のリダイレクト処理を
 * 安全にテストするために必要
 */
export const setupMockAuthLoggedOut = (
  mockClient: MockSupabaseClient
): void => {
  // セッションをnullに設定することで、未認証状態を再現
  // AuthContextのuseEffectで認証状態の変更を正しく検知できるようにする
  mockClient.auth.onAuthStateChange.mockImplementation(callback => {
    callback("SIGNED_OUT", null);
    return {
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    };
  });
};
