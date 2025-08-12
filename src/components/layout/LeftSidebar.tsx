"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  MessageSquare, 
  Users, 
  Image as ImageIcon, 
  Settings,
  User,
  Bell
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 左サイドバーコンポーネント
 * ユーザープロフィールとナビゲーションメニューを表示
 */
export const LeftSidebar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();

  const displayName = session?.user?.name || "User";
  const userImage = session?.user?.image;

  // ナビゲーションアイテム
  const navigationItems = [
    {
      icon: Home,
      label: "ホーム",
      href: "/",
      active: pathname === "/",
    },
    {
      icon: MessageSquare,
      label: "メッセージ",
      href: "/messages",
      active: pathname === "/messages",
      badge: 6, // 未読数の例
    },
    {
      icon: Users,
      label: "友達",
      href: "/friends",
      active: pathname === "/friends",
      badge: 3,
    },
    {
      icon: ImageIcon,
      label: "メディア",
      href: "/media",
      active: pathname === "/media",
    },
    {
      icon: Bell,
      label: "通知",
      href: "/notifications",
      active: pathname === "/notifications",
    },
    {
      icon: Settings,
      label: "設定",
      href: "/settings",
      active: pathname === "/settings",
    },
  ];

  return (
    <div className="space-y-3 md:space-y-4">
      {/* ユーザープロフィールカード */}
      <Card className="overflow-hidden bg-gradient-to-br from-orange-25 to-white border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-3 ring-orange-200 ring-offset-2 ring-offset-white">
              <AvatarImage 
                src={userImage || ""} 
                alt={`${displayName}のプロフィール画像`}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-gray-900 truncate">
                {displayName}
              </h3>
              <p className="text-xs text-orange-600 font-medium">
                @{session?.user?.email?.split('@')[0] || 'user'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Link href="/profile">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 font-medium"
            >
              <User className="w-3 h-3 mr-2" />
              プロフィールを見る
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* ナビゲーションメニュー */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-2">
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden
                    ${item.active 
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md transform scale-[1.02]" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:transform hover:scale-[1.01]"
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon 
                      className={`w-5 h-5 transition-transform duration-200 ${
                        item.active 
                          ? "text-white" 
                          : "text-gray-500 group-hover:text-orange-500 group-hover:scale-110"
                      }`} 
                    />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full bg-red-500 text-white min-w-[1.25rem] h-5 animate-pulse shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  
                  {/* アクティブ状態のアクセント */}
                  {item.active && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full opacity-80" />
                  )}
                </Link>
              );
            })}
          </nav>
        </CardContent>
      </Card>

      {/* アプリダウンロード促進カード */}
      <Card className="bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 border-0 shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full blur-2xl opacity-30 transform translate-x-8 -translate-y-8" />
        <CardContent className="p-5 text-center relative">
          <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
            <ImageIcon className="w-7 h-7 text-white" />
          </div>
          <h4 className="font-bold text-sm text-orange-900 mb-2">
            モバイルアプリ
          </h4>
          <p className="text-xs text-orange-700 mb-4 leading-relaxed">
            どこでもSanctuaryを楽しもう
          </p>
          <Button 
            size="sm" 
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-xs font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            ダウンロード
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};