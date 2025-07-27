import { Post } from "@/types/post";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

// 投稿カードのプロパティ型定義
interface PostCardProps {
  post: Post;
}

// 投稿カードコンポーネント
export const PostCard = ({ post }: PostCardProps) => {
  // ユーザー名（未設定の場合は「匿名ユーザー」）
  const userName = post.user?.nickname || "匿名ユーザー";
  // ユーザーのアバター画像URL
  const userAvatar = post.user?.profile_image_url;

  // 投稿日時を相対時間で表示する関数
  const formatRelativeTime = (dateString: string): string => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffMs = now.getTime() - postDate.getTime();

    // ミリ秒を各単位に変換
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // 条件分岐で適切な表示を返す
    if (minutes < 1) return "たった今";
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;

    // 1週間以上前は日付を表示
    return postDate.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={userAvatar || undefined} />
            <AvatarFallback className="bg-orange-100 text-orange-800">
              {/* ユーザー名の先頭文字を表示 */}
              {userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{userName}</span>
              <span className="text-sm text-gray-500">
                {/* 投稿日時を相対時間で表示 */}
                {formatRelativeTime(post.created_at)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {/* 投稿内容を表示 */}
          {post.content}
        </p>
      </CardContent>
    </Card>
  );
};
