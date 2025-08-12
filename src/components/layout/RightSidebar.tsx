"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  TrendingUp, 
  Heart, 
  MessageCircle,
  Calendar,
  Coffee,
  Music,
  Camera,
  Book
} from "lucide-react";

/**
 * 右サイドバーコンポーネント
 * おすすめユーザー、統計情報、おすすめコンテンツを表示
 */
export const RightSidebar = () => {
  // ダミーデータ（実際はAPIから取得）
  const suggestedUsers = [
    {
      id: 1,
      name: "田中 太郎",
      username: "tanaka_taro",
      image: null,
      mutualFriends: 12,
    },
    {
      id: 2,
      name: "佐藤 花子",
      username: "sato_hanako",
      image: null,
      mutualFriends: 8,
    },
    {
      id: 3,
      name: "鈴木 次郎",
      username: "suzuki_jiro",
      image: null,
      mutualFriends: 5,
    },
  ];

  const recommendations = [
    { id: 1, type: "music", label: "音楽", icon: Music, color: "bg-pink-100 text-pink-600" },
    { id: 2, type: "cooking", label: "料理", icon: Coffee, color: "bg-orange-100 text-orange-600" },
    { id: 3, type: "photography", label: "写真", icon: Camera, color: "bg-blue-100 text-blue-600" },
    { id: 4, type: "reading", label: "読書", icon: Book, color: "bg-green-100 text-green-600" },
  ];

  return (
    <div className="space-y-3 md:space-y-4">
      {/* ストーリー風のコンテンツ */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-orange-25 to-white">
          <CardTitle className="text-sm font-bold text-gray-900 flex items-center">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse" />
            今日のハイライト
            <span className="ml-auto text-xs text-orange-600 font-normal">今後実装</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm" />
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6 ring-2 ring-white/20">
                    <AvatarFallback className="text-xs bg-white/20 text-white font-semibold">
                      T
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-white font-semibold drop-shadow-sm">太郎</span>
                </div>
              </div>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-green-400 to-green-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm" />
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6 ring-2 ring-white/20">
                    <AvatarFallback className="text-xs bg-white/20 text-white font-semibold">
                      H
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-white font-semibold drop-shadow-sm">花子</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* おすすめユーザー */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-gray-900 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-2 shadow-sm">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            おすすめのユーザー
            <span className="ml-auto text-xs text-blue-600 font-normal">今後実装</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Avatar className="w-10 h-10 ring-2 ring-gray-200 ring-offset-1 group-hover:ring-blue-300 transition-colors duration-200">
                  <AvatarImage src={user.image || ""} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 text-sm font-semibold">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-200">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1" />
                    共通の友達 {user.mutualFriends}人
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs px-4 py-1.5 h-8 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 font-medium"
              >
                フォロー
              </Button>
            </div>
          ))}
          <div className="pt-3 border-t border-gray-100">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium transition-all duration-200"
            >
              すべて見る
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* おすすめコンテンツ */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-gray-900 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mr-2 shadow-sm">
              <span className="text-white text-xs font-bold">#</span>
            </div>
            おすすめトピック
            <span className="ml-auto text-xs text-purple-600 font-normal">今後実装</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {recommendations.map((rec) => {
              const Icon = rec.icon;
              return (
                <div
                  key={rec.id}
                  className={`aspect-square rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md ${rec.color.split(' ')[0]} border border-gray-100`}
                >
                  <div className={`w-10 h-10 rounded-full ${rec.color} flex items-center justify-center mb-3 shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
                    {rec.label}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">フォロー</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 統計情報 */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-gray-900 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mr-2 shadow-sm">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            今週の活動
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">いいね</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-red-600">24</span>
              <div className="w-16 h-1 bg-red-200 rounded-full mt-1">
                <div className="w-3/4 h-full bg-red-500 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">コメント</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-blue-600">12</span>
              <div className="w-16 h-1 bg-blue-200 rounded-full mt-1">
                <div className="w-1/2 h-full bg-blue-500 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">投稿日数</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-green-600">5</span>
              <span className="text-xs text-green-600 font-medium">日</span>
              <div className="w-16 h-1 bg-green-200 rounded-full mt-1">
                <div className="w-5/6 h-full bg-green-500 rounded-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};