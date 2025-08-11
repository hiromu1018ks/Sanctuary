"use client";

import { useUserManagement } from "@/hooks/useUserManagement";
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
    pending: "承認待ち",
    approved: "承認済み",
    rejected: "拒否済み",
  };

  return (
    <span
      className={`inline-flex items-center
  px-2.5 py-0.5 rounded-full text-xs font-medium
  border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export default function UserManagement() {
  const { users, loading, error, updating, refetch, updateUserStatus } =
    useUserManagement();
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  // ステータス更新ハンドラー
  const handleStatusUpdate = async (
    userId: string,
    status: "pending" | "approved" | "rejected"
  ) => {
    const result = await updateUserStatus(userId, status);

    if (result.success) {
      // 成功時は特に何もしない（ローカル状態は既に更新済み）
      console.log("Status updated successfully:", result.message);
    } else {
      // エラー時はアラートを表示（将来的にはtoast等に変更可能）
      alert(`エラー: ${result.message}`);
    }
  };

  // フィルタリング処理
  const filteredUsers =
    statusFilter === "all"
      ? users
      : users.filter(user => user.status === statusFilter);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">ユーザー管理</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-8">ユーザー管理</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            エラーが発生しました
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refetch} className="bg-red-600 hover:bg-red-700">
            再読み込み
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
        <Button onClick={refetch} variant="outline">
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
            すべて ({users.length})
          </Button>
          <Button
            onClick={() => setStatusFilter("pending")}
            variant={statusFilter === "pending" ? "default" : "outline"}
            size="sm"
          >
            承認待ち ({users.filter(u => u.status === "pending").length})
          </Button>
          <Button
            onClick={() => setStatusFilter("approved")}
            variant={statusFilter === "approved" ? "default" : "outline"}
            size="sm"
          >
            承認済み ({users.filter(u => u.status === "approved").length})
          </Button>
          <Button
            onClick={() => setStatusFilter("rejected")}
            variant={statusFilter === "rejected" ? "default" : "outline"}
            size="sm"
          >
            拒否済み ({users.filter(u => u.status === "rejected").length})
          </Button>
        </div>
      </div>

      {/* ユーザー一覧テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ユーザー
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  権限
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  活動
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  登録日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.nickname}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.role === "admin" ? "管理者" : "ユーザー"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    投稿: {user._count.posts} / いいね: {user._count.reactions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {user.status !== "approved" && (
                        <Button
                          onClick={() =>
                            handleStatusUpdate(user.id, "approved")
                          }
                          disabled={updating === user.id}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {updating === user.id ? "更新中..." : "承認"}
                        </Button>
                      )}
                      {user.status !== "rejected" && (
                        <Button
                          onClick={() =>
                            handleStatusUpdate(user.id, "rejected")
                          }
                          disabled={updating === user.id}
                          size="sm"
                          variant="destructive"
                        >
                          {updating === user.id ? "更新中..." : "拒否"}
                        </Button>
                      )}
                      {user.status !== "pending" && (
                        <Button
                          onClick={() => handleStatusUpdate(user.id, "pending")}
                          disabled={updating === user.id}
                          size="sm"
                          variant="outline"
                        >
                          {updating === user.id ? "更新中..." : "保留"}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {statusFilter === "all"
                ? "ユーザーがいません"
                : `${statusFilter}のユーザーはいません`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
