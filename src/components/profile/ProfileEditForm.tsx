import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { ProfileData } from "@/types/profile";

// プロフィール編集フォームのProps型定義
interface ProfileEditFormProps {
  initialProfile: ProfileData;
  onSaveSuccess: () => void;
}

// プロフィール編集フォームコンポーネント
export default function ProfileEditForm({
  initialProfile,
  onSaveSuccess,
}: ProfileEditFormProps) {
  // ニックネームの状態管理
  const [nickname, setNickname] = useState(initialProfile.nickname);
  // 自己紹介の状態管理
  const [selfIntroduction, setSelfIntroduction] = useState(
    initialProfile.selfIntroduction || ""
  );
  // 保存処理中かどうかの状態管理
  const [isSubmitting, setIsSubmitting] = useState(false);
  // メッセージ表示用の状態管理
  const [message, setMessage] = useState("");

  // ニックネームの最大文字数
  const MAX_NICKNAME_CHARS = 50;
  // 自己紹介の最大文字数
  const MAX_INTRO_CHARS = 500;

  // フォーム送信時の処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedNickname = nickname.trim();
    // ニックネーム未入力チェック
    if (trimmedNickname.length === 0) {
      setMessage("エラー: ニックネームを入力してください");
      return;
    }

    // ニックネーム文字数制限チェック
    if (trimmedNickname.length > MAX_NICKNAME_CHARS) {
      setMessage(
        `エラー: ニックネームは${MAX_NICKNAME_CHARS}文字以内で入力してください`
      );
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      // プロフィール更新API呼び出し
      const response = await fetch("/api/profile/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: trimmedNickname,
          selfIntroduction: selfIntroduction.trim() || null,
        }),
      });

      const data = await response.json();

      // 更新成功時
      if (response.ok) {
        setMessage("成功: プロフィールを更新しました！");
        onSaveSuccess();
      } else {
        // 更新失敗時
        setMessage(`エラー: ${data.error || "更新に失敗しました"}`);
      }
    } catch {
      // ネットワークエラー時
      setMessage("エラー: ネットワークエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>プロフィール編集</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            {/* ニックネーム入力欄 */}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ニックネーム *
            </label>
            <Input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              maxLength={MAX_NICKNAME_CHARS}
              disabled={isSubmitting}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">
              {nickname.length}/{MAX_NICKNAME_CHARS}
            </div>
          </div>

          <div>
            {/* 自己紹介入力欄 */}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              自己紹介
            </label>
            <Textarea
              value={selfIntroduction}
              onChange={e => setSelfIntroduction(e.target.value)}
              maxLength={MAX_INTRO_CHARS}
              disabled={isSubmitting}
              placeholder="あなたについて教えてください..."
              className="min-h-24"
            />
            <div className="text-xs text-gray-500 mt-1">
              {selfIntroduction.length}/{MAX_INTRO_CHARS}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            {/* 保存ボタン */}
            <Button
              type="submit"
              disabled={isSubmitting || nickname.trim().length === 0}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </div>
          {/* メッセージ表示欄 */}
          {message && (
            <div
              className={`text-sm font-medium mt-2 p-3 rounded-md ${
                message.includes("成功:")
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
