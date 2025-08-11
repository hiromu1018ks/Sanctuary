"use client";

import { withAdminAuth } from "@/hooks/useAdmin";
import Link from "next/link";
import { usePathname } from "next/navigation";

function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900">管理画面</h1>
          </div>
          <nav className="mt-6">
            <div className="px-3">
              <div className="space-y-1">
                <Link
                  href="/admin/dashboard"
                  className={`${
                    pathname?.startsWith("/admin/dashboard")
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                >
                  📊 ダッシュボード
                </Link>
                <Link
                  href="/admin/users"
                  className={`${
                    pathname?.startsWith("/admin/users")
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                >
                  👥 ユーザー管理
                </Link>
                <Link
                  href="/admin/posts"
                  className={`${
                    pathname?.startsWith("/admin/posts")
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                >
                  📝 投稿管理
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        <main className="flex-1">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(AdminLayout);
