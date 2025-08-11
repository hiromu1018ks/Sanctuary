"use client";

import { usePostManagement } from "@/hooks/usePostManagement";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// ステータス表示用のバッジコンポーネント
function StatusBadge({
  status,
}: {
  status: "pending" | "approved" | "rejected";
}) {
  const styles = {
    pending: "bg-orange-100 text-orange-800 border-orange-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };

  const labels = {
    pending: "審査待ち",
    approved: "承認済み",
    rejected: "拒否済み",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

// 投稿内容のプレビュー表示コンポーネント
function ContentPreview({
  content,
  maxLength = 100,
}: {
  content: string;
  maxLength?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (content.length <= maxLength) {
    return <span className="text-sm text-gray-900">{content}</span>;
  }

  return (
    <div>
      <span className="text-sm text-gray-900">
        {isExpanded ? content : `${content.substring(0, maxLength)}...`}
      </span>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="ml-2 text-xs text-blue-600 hover:text-blue-800"
      >
        {isExpanded ? "折りたたむ" : "続きを読む"}
      </button>
    </div>
  );
}

export default function PostManagement() {
  const {
    posts,
    loading,
    error,
    updating,
    refetchPosts,
    deletePost,
    approvePost,
  } = usePostManagement();
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  // 投稿削除ハンドラー
  const handleDeletePost = async (postId: string, content: string) => {
    const confirmMessage = `以下の投稿を削除しますか？\n\n"${content.substring(0, 50)}..."`;

    if (window.confirm(confirmMessage)) {
      const result = await deletePost(postId);

      if (result.success) {
        console.log("Post deleted successfully:", result.message);
      } else {
        alert(`エラー: ${result.message}`);
      }
    }
  };

  // 投稿承認ハンドラー
  const handleApprovePost = async (postId: string, content: string) => {
    const confirmMessage = `以下の投稿を強制承認しますか？\n\n"${content.substring(0, 50)}..."`;

    if (window.confirm(confirmMessage)) {
      const result = await approvePost(postId);

      if (result.success) {
        console.log("Post approved successfully:", result.message);
      } else {
        alert(`エラー: ${result.message}`);
      }
    }
  };

  // フィルタリング処理
  const filteredPosts =
    statusFilter === "all"
      ? posts
      : posts.filter(post => post.status === statusFilter);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">投稿管理</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">投稿管理</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            エラーが発生しました
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={refetchPosts}
            className="bg-red-600 hover:bg-red-700"
          >
            再読み込み
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">投稿管理</h1>
        <Button onClick={refetchPosts} variant="outline">
          🔄 更新
        </Button>
      </div>

      {/* フィルター */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <Button
            onClick={() => setStatusFilter("all")}
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
          >
            すべて ({posts.length})
          </Button>
          <Button
            onClick={() => setStatusFilter("pending")}
            variant={statusFilter === "pending" ? "default" : "outline"}
            size="sm"
          >
            審査待ち ({posts.filter(p => p.status === "pending").length})
          </Button>
          <Button
            onClick={() => setStatusFilter("approved")}
            variant={statusFilter === "approved" ? "default" : "outline"}
            size="sm"
          >
            承認済み ({posts.filter(p => p.status === "approved").length})
          </Button>
          <Button
            onClick={() => setStatusFilter("rejected")}
            variant={statusFilter === "rejected" ? "default" : "outline"}
            size="sm"
          >
            拒否済み ({posts.filter(p => p.status === "rejected").length})
          </Button>
        </div>
      </div>

      {/* 投稿一覧テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  投稿内容
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作成者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作成日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPosts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <ContentPreview content={post.content} maxLength={150} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {post.userProfile.nickname}
                      </div>
                      <div className="text-sm text-gray-500">
                        {post.userProfile.user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {post.status !== "approved" && (
                        <Button
                          onClick={() =>
                            handleApprovePost(post.id, post.content)
                          }
                          disabled={updating === post.id}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {updating === post.id ? "処理中..." : "強制承認"}
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeletePost(post.id, post.content)}
                        disabled={updating === post.id}
                        size="sm"
                        variant="destructive"
                      >
                        {updating === post.id ? "削除中..." : "削除"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {statusFilter === "all"
                ? "投稿がありません"
                : `${statusFilter}の投稿はありません`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
