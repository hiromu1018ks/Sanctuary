/**
 * Sanctuary リアクション機能の型定義
 *
 * このファイルは以下の責務を担います:
 * - リアクション機能の全型定義
 * - API リクエスト/レスポンス型
 * - React コンポーネント Props 型
 * - カスタムフック用型定義
 */

// ===== 基本型定義 =====

/**
 * リアクション種類の定義
 * Sanctuaryの「心の安全地帯」コンセプトを体現した4種類
 */
export type ReactionType = "thanks" | "support" | "empathy" | "wonderful";

/**
 * リアクション表示設定
 * UI表示とアクセシビリティを統一管理
 */
export interface ReactionConfig {
  type: ReactionType;
  label: string; // 日本語ラベル
  icon: string; // Lucide React アイコン名
  colorClass: string; // Tailwind CSS クラス
  ariaLabel: string; // アクセシビリティ用ラベル
}

/**
 * データベース直接対応型（Prisma スキーマと1:1対応）
 */
export interface ReactionData {
  id: string;
  postId: string;
  userProfileId: string;
  reactionType: ReactionType;
  createdAt: string;
}

/**
 * ユーザー情報付きリアクション（JOIN結果表現）
 */
export interface ReactionWithUser extends ReactionData {
  userProfile: {
    nickname: string;
    profileImageUrl: string | null;
    user: {
      name: string | null;
      image: string | null;
    };
  };
}

/**
 * リアクション集計データ（UI表示用）
 */
export interface ReactionCounts {
  thanks: number;
  support: number;
  empathy: number;
  wonderful: number;
}

/**
 * ユーザーの現在リアクション状態
 */
export interface UserReactionState {
  thanks: boolean;
  support: boolean;
  empathy: boolean;
  wonderful: boolean;
}

// ===== API 型定義 =====

/**
 * リアクション作成/削除リクエスト
 */
export interface ReactionRequest {
  postId: string;
  reactionType: ReactionType;
}

/**
 * 基本APIレスポンス
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  timestamp: string;
}

/**
 * リアクション作成レスポンス
 */
export interface ReactionCreateResponse {
  reaction: ReactionWithUser;
  counts: ReactionCounts;
}

/**
 * リアクション削除レスポンス
 */
export interface ReactionDeleteResponse {
  deletedId: string;
  counts: ReactionCounts;
}

/**
 * 投稿のリアクション一覧レスポンス
 */
export interface PostReactionsResponse {
  reactions: ReactionWithUser[];
  counts: ReactionCounts;
  userReactions: UserReactionState;
}

// ===== React コンポーネント型定義 =====

/**
 * ReactionButton コンポーネント Props
 */
export interface ReactionButtonProps {
  postId: string;
  reactionType: ReactionType;
  count: number;
  isActive: boolean;
  isLoading?: boolean;
  onToggle: (postId: string, type: ReactionType) => Promise<void>;
  className?: string;
  disabled?: boolean;
}

/**
 * ReactionBar コンポーネント Props
 */
export interface ReactionBarProps {
  postId: string;
  reactions: ReactionCounts;
  userReactions: UserReactionState;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

// ===== カスタムフック型定義 =====

/**
 * useReactions フック返り値型
 */
export interface UseReactionsReturn {
  reactions: ReactionCounts;
  userReactions: UserReactionState;
  loading: boolean;
  error: string | null;
  toggleReaction: (postId: string, type: ReactionType) => Promise<void>;
  refetch: () => Promise<void>;
  hasReactions: boolean;
  totalCount: number;
}

/**
 * useReactions フック設定オプション
 */
export interface UseReactionsOptions {
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: PostReactionsResponse) => void;
  onError?: (error: Error) => void;
}

// ===== 設定と定数 =====

/**
 * リアクション設定マップ（動的管理用）
 */
export const REACTION_CONFIGS: Record<ReactionType, ReactionConfig> = {
  thanks: {
    type: "thanks",
    label: "感謝",
    icon: "Handshake",
    colorClass: "text-amber-600 hover:text-amber-700 hover:bg-amber-50",
    ariaLabel: "感謝を表現する",
  },
  support: {
    type: "support",
    label: "応援",
    icon: "Users",
    colorClass: "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50",
    ariaLabel: "応援を表現する",
  },
  empathy: {
    type: "empathy",
    label: "共感",
    icon: "Heart",
    colorClass: "text-blue-600 hover:text-blue-700 hover:bg-blue-50",
    ariaLabel: "共感を表現する",
  },
  wonderful: {
    type: "wonderful",
    label: "素敵",
    icon: "Star",
    colorClass: "text-purple-600 hover:text-purple-700 hover:bg-purple-50",
    ariaLabel: "素敵さを表現する",
  },
} as const;

/**
 * 全リアクション種類（型安全な配列）
 */
export const REACTION_TYPES = Object.keys(REACTION_CONFIGS) as ReactionType[];

// ===== ユーティリティ関数 =====

/**
 * 型安全なリアクション設定取得
 */
export function getReactionConfig(type: ReactionType): ReactionConfig {
  return REACTION_CONFIGS[type];
}

/**
 * リクエスト型ガード（ランタイム型チェック）
 */
export function isValidReactionRequest(obj: any): obj is ReactionRequest {
  return (
    typeof obj === "object" &&
    typeof obj.postId === "string" &&
    obj.postId.length > 0 &&
    REACTION_TYPES.includes(obj.reactionType)
  );
}

/**
 * リアクションカウントの初期値生成
 */
export function createEmptyReactionCounts(): ReactionCounts {
  return {
    thanks: 0,
    support: 0,
    empathy: 0,
    wonderful: 0,
  };
}

/**
 * ユーザーリアクション状態の初期値生成
 */
export function createEmptyUserReactionState(): UserReactionState {
  return {
    thanks: false,
    support: false,
    empathy: false,
    wonderful: false,
  };
}
