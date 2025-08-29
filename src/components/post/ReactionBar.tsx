import React from "react";
import { cn } from "@/lib/utils";
import { REACTION_TYPES } from "@/types/reaction";
import ReactionButton from "./ReactionButton";
import { useReactions } from "@/hooks/useReactions";

/**
 * リアクションバーコンポーネント
 *
 * 【役割】
 * - 4つのリアクションボタン（感謝・応援・共感・素敵）を横並びで表示
 * - 各ボタンの状態管理とクリックイベント処理
 * - レスポンシブ対応とスペーシング調整
 */
export const ReactionBar: React.FC<{ postId: string; className?: string }> = React.memo(({
  postId,
  className,
}) => {
  console.log(`🎯 ReactionBar レンダリング: ${postId}`);
  const { reactions, userReactions, loading, error, toggleReaction } =
    useReactions(postId);

  // エラー時の表示
  if (error) {
    return (
      <div className="text-sm text-red-500 py-2">
        リアクションの読み込みに失敗しました
      </div>
    );
  }

  // リアクションボタン群の表示
  return (
    <div
      className={cn(
        "flex items-center gap-1 py-2",
        "border-t border-gray-100",
        className
      )}
    >
      {REACTION_TYPES.map(reactionType => (
        // 各リアクションタイプごとにボタンを表示
        <ReactionButton
          key={reactionType}
          postId={postId}
          reactionType={reactionType}
          count={reactions[reactionType] || 0}
          isActive={userReactions[reactionType] || false}
          isLoading={loading}
          onToggle={toggleReaction}
          className="flex-1 justify-center min-w-0"
        />
      ))}
    </div>
  );
});

export default ReactionBar;
