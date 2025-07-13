import Link from "next/link";

export const Footer = () => {
  return (
    <footer>
      <div className="flex justify-center bg-orange-50 p-8 gap-6">
        <h1>© 2025 Sanctuary</h1>
        <Link href="/">プライバシーポリシー</Link>
        <Link href="/">利用規約</Link>
      </div>
    </footer>
  );
};
