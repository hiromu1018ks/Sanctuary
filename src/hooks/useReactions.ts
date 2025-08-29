import {
  createEmptyReactionCounts,
  createEmptyUserReactionState,
  ReactionCounts,
  ReactionType,
  UseReactionsOptions,
  UseReactionsReturn,
  UserReactionState,
} from "@/types/reaction";
import { useCallback, useEffect, useMemo, useState } from "react";

// 静的な空オブジェクトを定義（参照の安定性を保つ）
const EMPTY_REACTIONS = createEmptyReactionCounts();
const EMPTY_USER_REACTIONS = createEmptyUserReactionState();

/**
 * リアクション管理カスタムフック
 *
 * 【機能】
 * - 投稿のリアクション数とユーザー状態を管理
 * - リアクション追加/削除のトグル処理
 * - 楽観的更新によるレスポンシブUI
 * - エラーハンドリングとロールバック
 */
export const useReactions = (
  postId: string,
  options: UseReactionsOptions = {}
): UseReactionsReturn => {
  console.log(`🔥 useReactions 呼び出し開始: ${postId}`);
  // === 状態管理 ===
  const [reactions, setReactions] = useState<ReactionCounts>(() => EMPTY_REACTIONS);
  const [userReactions, setUserReactions] = useState<UserReactionState>(() => EMPTY_USER_REACTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // === API クライアント関数 ===

  /**
   * 投稿のリアクション情報を取得
   */
  const fetchReactions = useCallback(async () => {
    console.log(`📡 fetchReactions呼び出し: ${postId}`);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${postId}/reactions`);

      if (!response.ok) {
        if (response.status === 404) {
          console.info(
            `リアクション取得API未実装のため、空データで初期化: ${postId}`
          );
          // 状態更新を削除して再レンダリングを防ぐ
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // データがある場合のみ状態を更新
      if (data.counts) {
        setReactions(data.counts);
      }
      if (data.userReactions) {
        setUserReactions(data.userReactions);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "予期しないエラーが発生しました";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  /**
   * リアクションの追加/削除を切り替える（トグル）処理（楽観的更新を適用）
   */
  const toggleReaction = useCallback(
    async (targetPostId: string, reactionType: ReactionType) => {
      // 現在の状態をstateから直接参照せず、functional updateで最新値を取得
      let wasActive: boolean = false;
      let rollbackReactions!: ReactionCounts; // definite assignment assertion
      let rollbackUserReactions!: UserReactionState; // definite assignment assertion

      // 楽観的更新: functional updateで最新状態を取得・更新
      setUserReactions(prevUserReactions => {
        wasActive = prevUserReactions[reactionType];
        rollbackUserReactions = { ...prevUserReactions };
        
        return {
          ...prevUserReactions,
          [reactionType]: !wasActive,
        };
      });

      setReactions(prevReactions => {
        rollbackReactions = { ...prevReactions };
        
        return {
          ...prevReactions,
          [reactionType]: wasActive
            ? prevReactions[reactionType] - 1
            : prevReactions[reactionType] + 1,
        };
      });

      try {
        const response = await fetch(`/api/posts/${targetPostId}/reactions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reactionType }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.data?.counts) {
          setReactions(data.data.counts);
        }
      } catch (error) {
        // エラー時にロールバック
        setReactions(rollbackReactions);
        setUserReactions(rollbackUserReactions);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "リアクションの更新に失敗しました";
        setError(errorMessage);
      }
    },
    [] // 依存配列を空にしてtoggleReactionの再生成を防ぐ
  );

  // === 初期データ取得 ===
  useEffect(() => {
    console.log(`🔄 useEffect実行: ${postId}`);
    
    // React 19対応: 直接API呼び出しを行い、関数参照の問題を回避
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/posts/${postId}/reactions`);

        if (!response.ok) {
          if (response.status === 404) {
            console.info(
              `リアクション取得API未実装のため、空データで初期化: ${postId}`
            );
            // 空データで初期化（初期値と同じなので状態更新をスキップ）
            // setReactions(EMPTY_REACTIONS); // 削除: 既に初期値で設定済み
            // setUserReactions(EMPTY_USER_REACTIONS); // 削除: 既に初期値で設定済み
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // データがある場合のみ状態を更新
        if (data.counts) {
          setReactions(data.counts);
        }
        if (data.userReactions) {
          setUserReactions(data.userReactions);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "予期しないエラーが発生しました";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [postId]); // fetchReactionsを依存配列から削除

  // === 定期更新（オプション） ===
  // useEffect(() => {
  //   if (options.refetchInterval && options.refetchInterval > 0 && initialized) {
  //     const interval = setInterval(fetchReactions, options.refetchInterval);
  //     return () => clearInterval(interval);
  //   }
  // }, [options.refetchInterval, initialized, fetchReactions]);

  // === 計算された値 ===
  const hasReactions = useMemo(() => 
    Object.values(reactions).some(count => count > 0), [reactions]
  ); // いずれかのリアクションが1以上あるか？
  const totalCount = useMemo(() => 
    Object.values(reactions).reduce((sum, count) => sum + count, 0), [reactions]
  ); // 全リアクションの合計数

  return useMemo(() => ({
    reactions,
    userReactions,
    loading,
    error,
    toggleReaction,
    refetch: fetchReactions,
    hasReactions,
    totalCount,
  }), [reactions, userReactions, loading, error, toggleReaction, fetchReactions, hasReactions, totalCount]);
};
