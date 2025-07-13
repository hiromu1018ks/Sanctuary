import Link from "next/link";

export default function AuthCodeError() {
  return (
    <div>
      <h1>認証エラー</h1>
      <p>ログインに失敗しました。再度お試しください。</p>
      <Link href="/">ホームに戻る</Link>
    </div>
  );
}
