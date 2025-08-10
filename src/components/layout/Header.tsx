import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useEffect, useState } from "react";

export const Header = () => {
  const { data: session } = useSession();
  const [userNickname, setUserNickname] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/profile/me")
        .then(res => res.json())
        .then(data => setUserNickname(data.profile?.nickname))
        .catch(() => setUserNickname(null));
    }
  }, [session?.user?.id]);

  const handleGoogleSignIn = async () => {
    await signIn("google");
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header>
      <div className="flex items-center justify-between bg-orange-100 px-6 py-4 shadow-sm">
        <Link href="/" className="text-xl font-bold text-orange-800">
          Sanctuary
        </Link>
        <nav>
          <div className="flex items-center justify-end gap-4">
            {session?.user ? (
              <>
                <p className="text-sm md:text-base">
                  <span className="hidden md:inline">こんにちは、</span>
                  {userNickname || session.user.name || "ユーザー"}さん
                </p>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={session.user.image || ""}
                          alt={session.user.name || "User"}
                        />
                        <AvatarFallback>
                          {session.user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">プロフィール</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      ログアウト
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={handleGoogleSignIn}>ログイン</Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
