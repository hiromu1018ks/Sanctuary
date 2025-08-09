"use client";

import { ProfileData } from "@/types/profile";
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import ProfileView from "@/components/profile/ProfileView";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

// プロフィールページのコンポーネント
export default function ProfilePage() {
  // セッション情報の取得
  const { data: session } = useSession();
  // プロフィール情報の状態管理
  const [profile, setProfile] = useState<ProfileData | null>(null);
  // 編集モードの状態管理
  const [isEditing, setIsEditing] = useState(false);
  // ローディング状態管理
  const [loading, setLoading] = useState(true);
  // エラーメッセージの状態管理
  const [error, setError] = useState("");

  // プロフィール情報を取得する関数
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/profile/me", {
        headers: {
          "x-user-id": session?.user?.id || "",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      } else {
        setError("プロフィールの取得に失敗しました");
      }
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // プロフィール編集成功時の処理
  const handleSaveSuccess = () => {
    setIsEditing(false);
    fetchProfile();
  };

  // セッション情報が変化した時にプロフィール情報を取得
  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  // 未ログイン時の表示
  if (!session) {
    return <div className="text-center p-6">ログインが必要です</div>;
  }

  // ローディング中の表示
  if (loading) {
    return <div className="text-center p-6">読み込み中...</div>;
  }

  // エラー発生時の表示
  if (error) {
    return <div className="text-center p-6">{error}</div>;
  }

  // プロフィール情報が取得できなかった場合の表示
  if (!profile) {
    return <div className="text-center p-6">プロフィールが見つかりません</div>;
  }

  // プロフィール表示・編集フォームの切り替え
  return (
    <div className="max-w-4xl mx-auto p-6">
      {!isEditing && (
        <div className="text-center mb-6">
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            プロフィールを編集
          </Button>
        </div>
      )}

      {isEditing ? (
        <div>
          <div className="text-center mb-4">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              編集をキャンセル
            </Button>
          </div>
          <ProfileEditForm
            initialProfile={profile}
            onSaveSuccess={handleSaveSuccess}
          />
        </div>
      ) : (
        <ProfileView profile={profile} />
      )}
    </div>
  );
}
