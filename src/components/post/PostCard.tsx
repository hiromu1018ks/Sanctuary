import { Post } from "@/types/post";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Clock
} from "lucide-react";

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

  // アクセシビリティ用のユニークID生成
  const postId = `post-${post.id}`;
  const authorId = `author-${post.id}`;
  const contentId = `content-${post.id}`;
  const timeId = `time-${post.id}`;

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

  // アクセシビリティ用の完全な日時フォーマット
  const formatFullDateTime = (dateString: string): string => {
    const postDate = new Date(dateString);
    return postDate.toLocaleString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const relativeTime = formatRelativeTime(post.created_at);
  const fullDateTime = formatFullDateTime(post.created_at);

  return (
    <Card 
      className="mb-4 bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 overflow-hidden"
      role="article"
      aria-labelledby={authorId}
      aria-describedby={`${contentId} ${timeId}`}
      id={postId}
    >
      <CardHeader className="pb-4 bg-gradient-to-r from-orange-25 to-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="ring-2 ring-orange-100 ring-offset-1">
              <AvatarImage 
                src={userAvatar || undefined} 
                alt={`${userName}のプロフィール画像`}
                className="object-cover"
              />
              <AvatarFallback 
                className="bg-gradient-to-br from-orange-400 to-orange-600 text-white font-semibold"
                aria-label={`${userName}のイニシャル`}
              >
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span 
                  id={authorId}
                  className="font-semibold text-gray-900 hover:text-orange-600 transition-colors cursor-pointer"
                  role="heading"
                  aria-level="3"
                >
                  {userName}
                </span>
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <Clock className="w-3 h-3 text-gray-400" aria-hidden="true" />
                <time 
                  id={timeId}
                  className="text-xs text-gray-500"
                  dateTime={post.created_at}
                  title={fullDateTime}
                  aria-label={`投稿日時: ${fullDateTime}`}
                >
                  <span aria-hidden="true">{relativeTime}</span>
                  <span className="sr-only">に投稿</span>
                </time>
              </div>
            </div>
          </div>
          
          {/* メニューボタン */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 h-8 w-8 -mr-2"
            aria-label="投稿メニュー"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div 
          id={contentId}
          className="text-gray-800 leading-relaxed whitespace-pre-wrap text-[15px] mb-4"
          role="text"
          aria-label="投稿内容"
        >
          {post.content}
        </div>
        
        {/* インタラクションボタン */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg px-3 py-2 h-9 transition-all duration-200"
              aria-label="いいね"
            >
              <Heart className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">0</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg px-3 py-2 h-9 transition-all duration-200"
              aria-label="コメント"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">0</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-lg px-3 py-2 h-9 transition-all duration-200"
              aria-label="シェア"
            >
              <Share2 className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">シェア</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
