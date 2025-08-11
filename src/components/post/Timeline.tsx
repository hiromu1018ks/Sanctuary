"use client";

import { usePostsTimeline } from "@/hooks/usePostsTimeline";
import { PostCard } from "./PostCard";
import { Notebook, Star, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

export const Timeline = () => {
  const {
    posts,
    loading,
    error,
    refetch,
    loadMore,
    hasNextPage,
    isPolling,
    startPolling,
    stopPolling,
  } = usePostsTimeline();

  if (loading) {
    return (
      <div 
        className="container-responsive max-w-2xl"
        role="status"
        aria-live="polite"
        aria-label="投稿を読み込み中"
      >
        <div className="flex items-center space-x-2">
          <Notebook aria-hidden="true" />
          <span>投稿を読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="container-responsive max-w-2xl text-center"
        role="alert"
        aria-live="assertive"
      >
        <p className="text-red-500 mb-4" id="error-message">
          <span className="sr-only">エラー: </span>
          {error}
        </p>
        <Button
          onClick={refetch}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          aria-describedby="error-message"
          aria-label="投稿の読み込みを再試行"
        >
          再試行
        </Button>
      </div>
    );
  }

  if (posts.length == 0) {
    return (
      <div 
        className="container-responsive max-w-2xl text-center text-gray-500"
        role="status"
        aria-live="polite"
      >
        <p className="flex items-center justify-center space-x-2">
          <Star aria-hidden="true" />
          <span>まだ投稿がありません</span>
        </p>
        <p className="text-sm mt-2">最初の投稿をしてみましょう！</p>
      </div>
    );
  }

  return (
    <div className="container-responsive max-w-2xl">
      {/* メインコンテンツエリア */}
      <main
        id="main-content"
        role="main"
        aria-label="投稿タイムライン"
      >
        {/* 投稿リスト */}
        <section 
          className="space-y-4"
          role="feed"
          aria-label={`投稿一覧（${posts.length}件の投稿）`}
          aria-live="polite"
        >
          <h2 className="sr-only">投稿一覧</h2>
          {posts.map((post, index) => (
            <PostCard 
              key={post.post_id} 
              post={post}
              aria-posinset={index + 1}
              aria-setsize={posts.length}
            />
          ))}
        </section>

        {/* もっと読み込むボタン */}
        {hasNextPage && (
          <div className="text-center mt-6">
            <Button
              onClick={loadMore}
              className="px-6 py-2"
              aria-label="さらに投稿を読み込む"
            >
              もっと読み込む
            </Button>
          </div>
        )}

        {/* ポーリング制御 */}
        <div 
          className="flex flex-col sm:flex-row gap-2 mt-4 p-4 border-t border-gray-200"
          role="group"
          aria-labelledby="polling-controls-title"
        >
          <h3 id="polling-controls-title" className="sr-only">
            自動更新の制御
          </h3>
          <Button
            onClick={startPolling}
            disabled={isPolling}
            variant={isPolling ? "secondary" : "default"}
            aria-pressed={isPolling}
            aria-label={isPolling ? "自動更新中" : "自動更新を開始"}
          >
            <span aria-hidden="true">ポーリング開始</span>
            <span className="sr-only">
              {isPolling ? "自動更新中" : "自動更新を開始"}
            </span>
            {isPolling && (
              <RefreshCw className="w-4 h-4 ml-1" aria-hidden="true" />
            )}
          </Button>
          <Button 
            onClick={stopPolling} 
            variant="outline"
            aria-label="自動更新を停止"
          >
            <span aria-hidden="true">ポーリング停止</span>
            <span className="sr-only">自動更新を停止</span>
          </Button>
        </div>
      </main>
    </div>
  );
};
