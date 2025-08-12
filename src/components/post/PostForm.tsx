"use client";
import React, { useState } from "react";
import { Sparkles } from "lucide-react";
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
      setMessage("エラー: " + errorMessage);
      // アクセシビリティ: エラー時にフォーカスをテキストエリアに移動
      document.getElementById(textareaId)?.focus();
      return;
    }

    if (trimmedContent.length > MAX_CHARS) {
      const errorMessage = `投稿内容は${MAX_CHARS}文字以内で入力してください`;
      setValidationError(errorMessage);
      setMessage("エラー: " + errorMessage);
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
        setMessage("成功: " + result.message);
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
            "提案: " +
              result.message +
              "\n\n投稿内容を編集して再度お試しください。"
          );
          setTimeout(() => {
            document.getElementById(textareaId)?.focus();
          }, 100);
        }
      }
    } catch {
      setMessage("エラー: 投稿に失敗しました");
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
    <div className="w-full">
      <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-orange-25 to-white border-b border-orange-100">
          <CardTitle
            className="flex items-center text-orange-800 font-bold text-lg"
            id="form-title"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mr-3 shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            新しい投稿を作成
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
                placeholder="今日の感謝や応援したいことをシェアしよう"
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                maxLength={MAX_CHARS}
                className="min-h-32 border-gray-200 focus:border-orange-400 focus:ring-orange-400 focus:ring-2 focus:ring-offset-0 rounded-lg transition-all duration-200 resize-none"
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
              <div className="space-y-2">
                {/* プログレスバー */}
                <div className="w-full max-w-xs">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 rounded-full ${
                        postContent.length > 450 
                          ? 'bg-red-500' 
                          : postContent.length > 400 
                          ? 'bg-orange-500' 
                          : 'bg-orange-400'
                      }`}
                      style={{ width: `${Math.min((postContent.length / MAX_CHARS) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                
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
  警告: 上限まであと{MAX_CHARS - postContent.length}文字
                      </span>
                      <span className="sr-only">
                        警告: 文字数制限まであと{MAX_CHARS - postContent.length}
                        文字です
                      </span>
                    </span>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={
                  postContent.trim().length === 0 || isSubmitting || isOverLimit
                }
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                aria-describedby={validationError ? validationId : undefined}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    送信中...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    投稿
                  </span>
                )}
              </Button>
            </div>

            {/* 投稿結果のフィードバック表示 */}
            {message && (
              <div
                id={messageId}
                className={`text-sm font-medium mt-4 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm border-l-4 transform transition-all duration-300 ${
                  message.includes("成功:")
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-l-green-500 border border-green-200 focus:ring-green-500"
                    : message.includes("提案:")
                      ? "bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-800 border-l-yellow-500 border border-yellow-200 focus:ring-yellow-500"
                      : "bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-l-red-500 border border-red-200 focus:ring-red-500"
                }`}
                role={message.includes("エラー:") ? "alert" : "status"}
                aria-live="polite"
                tabIndex={-1}
              >
                <div className="flex items-start space-x-3">
                  {/* アイコン表示 */}
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    message.includes("成功:")
                      ? "bg-green-100"
                      : message.includes("提案:")
                        ? "bg-yellow-100"
                        : "bg-red-100"
                  }`}>
                    {message.includes("成功:") ? (
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : message.includes("提案:") ? (
                      <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  
                  {/* メッセージ本文 */}
                  <div className="flex-1 whitespace-pre-line leading-relaxed">
                    {/* スクリーンリーダー用のプレフィックス */}
                    <span className="sr-only">
                      {message.includes("成功:")
                        ? "成功: "
                        : message.includes("提案:")
                          ? "情報: "
                          : "エラー: "}
                    </span>
                    {message}
                  </div>
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

