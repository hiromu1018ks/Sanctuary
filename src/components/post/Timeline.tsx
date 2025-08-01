"use client";

import { usePostsTimeline } from "@/hooks/usePostsTimeline";
import { PostCard } from "./PostCard";
import { Notebook, Star } from "lucide-react";
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
      <div className="max-w-2xl mx-auto p-6">
        <div>
          <Notebook />
          投稿を読み込み中...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          onClick={refetch}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          再試行
        </Button>
      </div>
    );
  }

  if (posts.length == 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center text-gray-500">
        <p>
          <Star /> まだ投稿がありません
        </p>
        <p className="text-sm mt-2">最初の投稿をしてみましょう！</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="space-y-4">
        {posts.map(post => (
          <PostCard key={post.post_id} post={post} />
        ))}
      </div>
      {hasNextPage && (
        <div className="text-center mt-6">
          <button onClick={loadMore}>もっと読み込む</button>
        </div>
      )}
      <div className="flex gap-2 mt-4 p-4 border-t border-gray-200">
        <Button
          onClick={startPolling}
          disabled={isPolling}
          variant={isPolling ? "secondary" : "default"}
        >
          ボーリング開始 {isPolling && "🔄"}
        </Button>
        <Button onClick={stopPolling} variant="outline">
          ボーリング停止
        </Button>
      </div>
    </div>
  );
};
