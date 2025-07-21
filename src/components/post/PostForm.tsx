"use client";
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sanitizePostContent = (content: string): string => {
  const SCRIPT_TAG_PATTERN =
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

  const HTML_TAG_PATTERN = /<[^>]*>/g;

  return content.replace(SCRIPT_TAG_PATTERN, "").replace(HTML_TAG_PATTERN, "");
};

/**
 * 投稿フォームコンポーネント
 * 認証済みユーザーが新しい投稿を作成するためのフォーム
 */
export const PostForm = () => {
  const [postContent, setPostContent] = useState<string>("");
  // 二重送信防止 - ユーザーが複数回送信ボタンを押すことを防ぐ
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // 投稿の適切な長さを保つための制限 - UXと性能のバランスを考慮
  const MAX_CHARS = 500;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 空白のみの投稿を防止 - 意味のあるコンテンツのみを投稿させる
    const trimmedContent = postContent.trim();
    if (trimmedContent.length === 0) {
      setMessage("❌ 投稿内容を入力してください");
      return;
    }

    const sanitizedContent = sanitizePostContent(trimmedContent);

    setIsSubmitting(true);
    setMessage("");

    try {
      // TODO: 実際のAPI呼び出しに置き換える - 現在は開発用のシミュレート
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("送信された内容:", sanitizedContent);

      setMessage("✅ 投稿が完了しました！");
      setPostContent(""); // 成功時のみフォームをリセット
    } catch {
      setMessage("❌ 投稿に失敗しました");
    } finally {
      // 成功・失敗に関わらず送信状態を解除
      setIsSubmitting(false);
    }
  };

  // 文字数制限への接近を視覚的に警告するための色分け
  const getCharCountColor = () => {
    const length = postContent.length;
    if (length > 450) return "text-red-500"; // 90%以上で緊急警告
    if (length > 400) return "text-orange-500"; // 80%以上で注意喚起
    return "text-gray-500";
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-800">
            ✨ 新しい投稿を作成
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="今日の感謝や応援したいことをシェアしよう 🌟"
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              maxLength={MAX_CHARS}
              className="min-h-32"
              disabled={isSubmitting} // 送信中は入力を無効化
            />

            <div className="flex justify-between items-center">
              <div className={`text-sm font-medium ${getCharCountColor()}`}>
                {postContent.length}/{MAX_CHARS}
                {/* 制限に近づいた際の追加警告 */}
                {postContent.length > 450 && (
                  <span className="ml-2 text-xs">
                    ⚠ 上限まであと{MAX_CHARS - postContent.length}文字
                  </span>
                )}
              </div>

              <Button
                type="submit"
                disabled={postContent.trim().length === 0 || isSubmitting}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isSubmitting ? "送信中..." : "投稿"}
              </Button>
            </div>

            {/* 投稿結果のフィードバック表示 */}
            {message && (
              <div className="text-sm font-medium mt-2">{message}</div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
