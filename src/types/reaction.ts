/**
 * リアクションの種類を定義する型
 */
export type ReactionType = "gratitude" | "empathy" | "wonderful" | "suppoer";

/**
 * 個別のリアクションデータの型定義
 */
export interface ReactionData {
  id: ReactionType; // リアクションの一意識別子
  label: string; // ユーザー向け表示ラベル
  iconName: string; // Lucide Reactアイコン名
  colorThema: "orange" | "pink" | "yellow" | "blue"; // カラーテーマ識別子
  count: number; // 現在のリアクション数
  isActive: boolean; // 現在のユーザーがリアクション済みか
  ariaLabel: string; // アクセンシビリティ用のラベル
}
/**
   *
  投稿のリアクション状態全体を表す型
   */
export interface PostReactions {
  /** 投稿ID */
  postId: string;
  /** 各リアクションの状態 */
  reactions: ReactionData[];
  /** リアクション総数 */
  totalCount: number;
  /** 最後の更新日時 */
  lastUpdated: string;
}

/**
 * リアクションのアクション型定義
 */
export interface ReactionAction {
  type:
    | "TOGGLE_REACTION"
    | "SET_REACTIONS"
    | "INCREMENT_COUNT"
    | "DECREMENT_COUNT";
  payload: {
    reactionType: ReactionType;
    postId?: string;
    newState?: boolean;
    reactions?: ReactionData[];
  };
}
