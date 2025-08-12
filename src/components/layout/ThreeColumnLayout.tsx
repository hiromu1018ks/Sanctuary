"use client";

import React from "react";

interface ThreeColumnLayoutProps {
  children: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

/**
 * 3カラムレイアウトコンポーネント
 * 参考画像に基づいたSNSアプリの典型的な3カラムレイアウト
 */
export const ThreeColumnLayout = ({
  children,
  leftSidebar,
  rightSidebar,
}: ThreeColumnLayoutProps) => {
  // レスポンシブメインコンテンツのクラス計算
  const mainClasses = leftSidebar && rightSidebar 
    ? 'lg:col-span-6' 
    : leftSidebar || rightSidebar 
    ? 'lg:col-span-9' 
    : 'lg:col-span-12';
  
  return (
    <div className="min-h-screen bg-background">
      {/* レスポンシブ3カラムグリッドレイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 p-4 lg:p-6 max-w-7xl mx-auto">
        {/* 左サイドバー: デスクトップで3カラム */}
        {leftSidebar && (
          <aside className="lg:col-span-3 order-3 lg:order-1">
            {leftSidebar}
          </aside>
        )}
        
        {/* メインコンテンツエリア */}
        <main className={`order-1 lg:order-2 ${mainClasses}`}>
          {children}
        </main>
        
        {/* 右サイドバー: デスクトップで3カラム */}
        {rightSidebar && (
          <aside className="lg:col-span-3 order-2 lg:order-3">
            {rightSidebar}
          </aside>
        )}
      </div>
    </div>
  );
};