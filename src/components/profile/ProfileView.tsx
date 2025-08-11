"use client";

import { ProfileData } from "@/types/profile";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// プロフィール表示用コンポーネントのProps型定義
interface ProfileViewProps {
  profile: ProfileData;
}

// プロフィール表示コンポーネント
export default function ProfileView({ profile }: ProfileViewProps) {
  // アクセシビリティ用のユニークID生成
  const profileId = `profile-${profile.user.id}`;
  const nicknameId = `nickname-${profile.user.id}`;
  const bioId = `bio-${profile.user.id}`;
  const treeId = `tree-${profile.user.id}`;

  return (
    <div className="container-responsive max-w-2xl">
      <Card 
        role="article"
        aria-labelledby={nicknameId}
        aria-describedby={`${profile.selfIntroduction ? bioId : ''} ${treeId}`}
        id={profileId}
      >
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {/* プロフィール画像表示（なければユーザー画像、さらに無ければニックネームの頭文字） */}
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={profile.profileImageUrl || profile.user.image || ""}
                alt={`${profile.nickname}のプロフィール画像`}
              />
              <AvatarFallback 
                className="text-2xl"
                aria-label={`${profile.nickname}のイニシャル`}
              >
                {profile.nickname.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* ニックネーム表示 */}
          <CardTitle 
            className="text-2xl font-bold"
            id={nicknameId}
            role="heading"
            aria-level="1"
          >
            {profile.nickname}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 自己紹介があれば表示 */}
          {profile.selfIntroduction && (
            <section aria-labelledby="bio-heading">
              <h3 
                id="bio-heading"
                className="font-semibold text-gray-700 mb-2"
                role="heading"
                aria-level="2"
              >
                自己紹介
              </h3>
              <p 
                id={bioId}
                className="text-gray-600 leading-relaxed"
                role="text"
              >
                {profile.selfIntroduction}
              </p>
            </section>
          )}

          {/* 感謝の木のステージとポイント表示 */}
          <section aria-labelledby="tree-heading">
            <h3 
              id="tree-heading"
              className="font-semibold text-gray-700 mb-2"
              role="heading"
              aria-level="2"
            >
              感謝の木
            </h3>
            <div 
              id={treeId}
              className="flex items-center space-x-2"
              role="status"
              aria-label={`現在の成長段階: ${profile.currentTreeStage}、感謝ポイント: ${profile.gratitudePoints}ポイント`}
            >
              <span 
                className="text-lg font-medium" 
                aria-hidden="true"
                role="img"
                aria-label="新芽"
              >
                🌱
              </span>
              <span>
                <span className="font-medium">{profile.currentTreeStage}</span>
                <span className="text-gray-600">
                  {" "}(感謝ポイント: <span className="font-medium">{profile.gratitudePoints}</span>)
                </span>
              </span>
              
              {/* スクリーンリーダー用の追加情報 */}
              <span className="sr-only">
                あなたの感謝の木は現在{profile.currentTreeStage}の段階で、
                {profile.gratitudePoints}ポイントの感謝ポイントを獲得しています。
              </span>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
