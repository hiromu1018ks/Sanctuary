"use client";
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SuggestionModal from "./SuggestionModal";

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
  // アクセシビリティ: バリデーションエラー状態の管理
  const [validationError, setValidationError] = useState<string>("");
  const [showSuggestionModal, setShowSuggestionModal] =
    useState<boolean>(false);
  const [suggestionData, setSuggestionData] = useState<{
    original: string;
    suggested: string;
  }>({ original: "", suggested: "" });

  // 投稿の適切な長さを保つための制限 - UXと性能のバランスを考慮
  const MAX_CHARS = 500;

  // アクセシビリティ: ユニークIDの生成
  const textareaId = "post-content-textarea";
  const charCountId = "char-count-status";
  const messageId = "form-message";
  const validationId = "validation-error";

  const handleAcceptSuggestion = (content: string) => {
    setPostContent(content);
  };

  const handleCloseModal = () => {
    setShowSuggestionModal(false);
  };

  const submitPost = async (
    content: string
  ): Promise<{
    success: boolean;
    message: string;
    suggested_content?: string;
  }> => {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
      }),
    });

    const data = await response.json();

    if (response.status === 201) {
      // 承認された場合
      return {
        success: true,
        message: data.message || "投稿が完了しました！",
      };
    } else if (response.status === 400) {
      // AI審査で拒否された場合
      return {
        success: false,
        message: data.message || "投稿が承認されませんでした",
        suggested_content: data.aiReview?.suggested_content,
      };
    } else {
      throw new Error(data.error || "投稿に失敗しました");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // バリデーションエラーをクリア
    setValidationError("");

    // 空白のみの投稿を防止 - 意味のあるコンテンツのみを投稿させる
    const trimmedContent = postContent.trim();
    if (trimmedContent.length === 0) {
      const errorMessage = "投稿内容を入力してください";
      setValidationError(errorMessage);
      setMessage("❌ " + errorMessage);
      // アクセシビリティ: エラー時にフォーカスをテキストエリアに移動
      document.getElementById(textareaId)?.focus();
      return;
    }

    if (trimmedContent.length > MAX_CHARS) {
      const errorMessage = `投稿内容は${MAX_CHARS}文字以内で入力してください`;
      setValidationError(errorMessage);
      setMessage("❌ " + errorMessage);
      document.getElementById(textareaId)?.focus();
      return;
    }

    const sanitizedContent = sanitizePostContent(trimmedContent);

    setIsSubmitting(true);
    setMessage("");
    setValidationError("");

    try {
      const result = await submitPost(sanitizedContent);

      if (result.success) {
        // 承認された場合のみフォームをクリア
        setMessage("✅ " + result.message);
        setPostContent(""); // 成功時のみフォームをリセット
        // アクセシビリティ: 成功時にメッセージにフォーカス（スクリーンリーダー用）
        setTimeout(() => {
          document.getElementById(messageId)?.focus();
        }, 100);
      } else {
        if (result.suggested_content) {
          setSuggestionData({
            original: sanitizedContent,
            suggested: result.suggested_content,
          });
          setShowSuggestionModal(true);
          setMessage("");
        } else {
          setMessage(
            "💡 " +
              result.message +
              "\n\n投稿内容を編集して再度お試しください。"
          );
          setTimeout(() => {
            document.getElementById(textareaId)?.focus();
          }, 100);
        }
      }
    } catch {
      setMessage("❌ 投稿に失敗しました");
      setTimeout(() => {
        document.getElementById(textareaId)?.focus();
      }, 100);
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

  // アクセシビリティ: ARIA属性の計算
  const isOverLimit = postContent.length > MAX_CHARS;

  return (
    <div className="container-responsive max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle
            className="flex items-center text-orange-800"
            id="form-title"
          >
            ✨ 新しい投稿を作成
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            noValidate
            aria-labelledby="form-title"
            role="form"
          >
            <div className="space-y-2">
              <label
                htmlFor={textareaId}
                className="block text-sm font-medium text-gray-700"
              >
                投稿内容
                <span className="text-red-500 ml-1" aria-label="必須項目">
                  *
                </span>
              </label>

              <Textarea
                id={textareaId}
                placeholder="今日の感謝や応援したいことをシェアしよう 🌟"
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                maxLength={MAX_CHARS}
                className="min-h-32"
                disabled={isSubmitting}
                required
                aria-required="true"
                aria-invalid={validationError ? "true" : "false"}
                aria-describedby={`${charCountId} ${validationError ? validationId : ""}`}
                aria-label="投稿内容を入力してください"
              />

              {/* バリデーションエラーの表示 */}
              {validationError && (
                <div
                  id={validationId}
                  className="text-sm text-red-600"
                  role="alert"
                  aria-live="polite"
                >
                  <span className="sr-only">エラー: </span>
                  {validationError}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
              <div
                id={charCountId}
                className={`text-sm font-medium ${getCharCountColor()}`}
                role="status"
                aria-live="polite"
                aria-label={`文字数: ${postContent.length}文字 / ${MAX_CHARS}文字`}
              >
                <span aria-hidden="true">
                  {postContent.length}/{MAX_CHARS}
                </span>
                <span className="sr-only">
                  現在{postContent.length}文字入力されています。最大{MAX_CHARS}
                  文字まで入力可能です。
                </span>

                {/* 制限に近づいた際の追加警告 */}
                {postContent.length > 450 && (
                  <span
                    className="ml-2 text-xs"
                    role="alert"
                    aria-live="assertive"
                  >
                    <span aria-hidden="true">
                      ⚠ 上限まであと{MAX_CHARS - postContent.length}文字
                    </span>
                    <span className="sr-only">
                      警告: 文字数制限まであと{MAX_CHARS - postContent.length}
                      文字です
                    </span>
                  </span>
                )}
              </div>

              <Button
                type="submit"
                disabled={
                  postContent.trim().length === 0 || isSubmitting || isOverLimit
                }
                className="bg-orange-500 hover:bg-orange-600"
                isLoading={isSubmitting}
                loadingText="投稿を送信中です"
                aria-describedby={validationError ? validationId : undefined}
              >
                {isSubmitting ? "送信中..." : "投稿"}
              </Button>
            </div>

            {/* 投稿結果のフィードバック表示 */}
            {message && (
              <div
                id={messageId}
                className={`text-sm font-medium mt-2 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  message.includes("✅")
                    ? "bg-green-50 text-green-800 border border-green-200 focus:ring-green-500"
                    : message.includes("💡")
                      ? "bg-yellow-50 text-yellow-800 border border-yellow-200 focus:ring-yellow-500"
                      : "bg-red-50 text-red-800 border border-red-200 focus:ring-red-500"
                }`}
                role={message.includes("❌") ? "alert" : "status"}
                aria-live="polite"
                tabIndex={-1}
              >
                <div className="whitespace-pre-line">
                  {/* スクリーンリーダー用のプレフィックス */}
                  <span className="sr-only">
                    {message.includes("✅")
                      ? "成功: "
                      : message.includes("💡")
                        ? "情報: "
                        : "エラー: "}
                  </span>
                  {message}
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
      <SuggestionModal
        isOpen={showSuggestionModal}
        onClose={handleCloseModal}
        originalContent={suggestionData.original}
        suggestedContent={suggestionData.suggested}
        onAcceptSuggestion={handleAcceptSuggestion}
      />
    </div>
  );
};

