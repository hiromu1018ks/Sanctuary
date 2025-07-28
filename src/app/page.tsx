"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🎉 Auth.js認証成功！</h1>
        <p className="text-gray-600 mb-4">Googleログインが正常に動作しました</p>
        <Link href="/api/auth/session" className="text-blue-500 underline">
          セッション情報を確認
        </Link>
        <br />
        <Link
          href="/api/auth/signout"
          className="text-red-500 underline mt-2 inline-block"
        >
          ログアウト
        </Link>
      </div>
    </div>
  );
}
