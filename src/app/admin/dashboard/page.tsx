"use client";

import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { stats, loading, error, refetch } = useAdminDashboard();

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          ダッシュボード
        </h1>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          ダッシュボード
        </h1>
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
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <Button onClick={refetch} variant="outline">
          🔄 更新
        </Button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">総ユーザー数</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {stats?.totalUsers || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">登録済みユーザー</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">総投稿数</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {stats?.totalPosts || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">全ての投稿</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">承認待ち投稿</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {stats?.pendingPosts || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">AI審査待ち</p>
        </div>
      </div>

      {/* 投稿状態の詳細 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          投稿状態の内訳
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats?.approvedPosts || 0}
            </div>
            <div className="text-sm text-green-800">承認済み</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {stats?.pendingPosts || 0}
            </div>
            <div className="text-sm text-orange-800">審査待ち</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {stats?.rejectedPosts || 0}
            </div>
            <div className="text-sm text-red-800">拒否済み</div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-gray-600">
          💡 ユーザー管理と投稿管理は左側のメニュー からアクセスできます。
        </p>
      </div>
    </div>
  );
}
