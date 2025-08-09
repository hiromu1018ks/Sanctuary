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
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {/* プロフィール画像表示（なければユーザー画像、さらに無ければニックネームの頭文字） */}
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={profile.profileImageUrl || profile.user.image || ""}
                alt={profile.nickname}
              />
              <AvatarFallback>
                {profile.nickname.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          {/* ニックネーム表示 */}
          <CardTitle className="text-2xl font-bold">
            {profile.nickname}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 自己紹介があれば表示 */}
          {profile.selfIntroduction && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">自己紹介</h3>
              <p className="text-gray-600 leading-relaxed">
                {profile.selfIntroduction}
              </p>
            </div>
          )}

          {/* 感謝の木のステージとポイント表示 */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">感謝の木</h3>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-medium">🌱</span>
              <span>
                {profile.currentTreeStage} (感謝ポイント:
                {profile.gratitudePoints})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
