import React from "react";
import { Button } from "@/components/ui/button";
import { ReactionButtonProps, getReactionConfig } from "@/types/reaction";
import { cn } from "@/lib/utils";
import {
  Heart, // empathy用
  Users, // support用
  Handshake, // thanks用
  Star, // wonderful用
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Heart: Heart, // empathy (共感)
  Users: Users, // support (応援)
  Handshake: Handshake, // thanks (感謝) ← 追加
  Star: Star, // wonderful (素敵) ← 追加
};

/**
 * 個別リアクションボタンコンポーネント
 *
 * 【役割】
 * - 単一のリアクション（感謝・応援・共感・素敵）ボタンを表示
 * - クリック時のリアクション追加/削除処理
 * - ローディング状態とアクティブ状態の視覚フィードバック
 * - アクセシビリティ対応
 */
export const ReactionButton: React.FC<ReactionButtonProps> = ({
  postId,
  reactionType,
  count,
  isActive,
  isLoading,
  onToggle,
  className,
  disabled,
}) => {
  // 1. リアクション設定を取得
  const config = getReactionConfig(reactionType);

  // 2. アイコンコンポーネントを動的に取得
  const IconComponent = iconMap[config.icon];

  // 3. ボタンのスタイリング
  const buttonStyles = cn(
    // ベーススタイル
    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",

    // 通常状態
    "bg-gray-100 text-gray-600 hover:bg-gray-200",

    isActive && [
      "bg-opacity-20 text-opacity-90",
      config.colorClass, // thanks: bg-blue-500, support: bg-green-500 など
    ],

    // ローディング状態
    isLoading && "opacity-50 cursor-not-allowed",

    // 無効状態
    disabled && "opacity-50 cursor-not-allowed",

    className
  );

  // 4. クリックハンドラー
  const handleClick = () => {
    if (disabled || isLoading) return;
    onToggle(postId, reactionType);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={buttonStyles}
      aria-label={`${config.ariaLabel} (${count})`}
      aria-pressed={isActive}
    >
      {/* アイコン表示 */}
      {IconComponent && (
        <IconComponent
          size={16}
          className={cn(
            "transition-colors duration-200",
            isActive ? "fill-current" : "stroke-current"
          )}
        />
      )}

      {/* ラベルとカウント */}
      <span className="select-none">
        {config.label}
        {count > 0 && <span className="ml-1 font-bold">{count}</span>}
      </span>

      {/* ローディングインジケーター */}
      {isLoading && (
        <div className="ml-1 w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
      )}
    </Button>
  );
};

export default ReactionButton;
