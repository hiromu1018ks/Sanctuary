import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <div className="min-h-screen bg-orange-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-orange-800">🌱 Sanctuary</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>プロフィール</DropdownMenuItem>
              <DropdownMenuItem>設定</DropdownMenuItem>
              <DropdownMenuItem>ログアウト</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 投稿作成ボタン */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">✨ 新しい投稿を作成</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>投稿を作成</DialogTitle>
              <DialogDescription>
                今日の感謝や応援したいことをシェアしましょう
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea placeholder="今日の感謝や応援したいことをシェアしよう" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">0/500</span>
                <Button>投稿する</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 検索 */}
        <Input placeholder="投稿を検索..." />

        {/* タイムライン */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">田中太郎</CardTitle>
                  <CardDescription>2分前</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p>
                今日は素晴らしい一日でした！みなさんのおかげで新しいプロジェクトが成功しました。感謝の気持ちでいっぱいです
                🙏
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>AM</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">佐藤花子</CardTitle>
                  <CardDescription>1時間前</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p>
                チームのみんなが応援してくれて、今日のプレゼンが大成功でした！みなさんの温かい言葉に励まされました
                ✨
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
