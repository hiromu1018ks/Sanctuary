import { NextResponse } from "next/server";
import { auth } from "../../../../auth";

const HONO_API_URL = "http://localhost:3001/api/posts";

const createErrorResponse = (message: string, status: number) => {
  return NextResponse.json({ error: message }, { status });
};

export async function POST(request: Request) {
  try {
    console.log("=== Next.js API Route開始 ===");

    const session = await auth();
    if (!session?.user?.id) {
      return createErrorResponse("認証が必要です", 401);
    }
    console.log("認証成功:", session.user.id);

    const body = await request.json();
    console.log("リクエストボディ取得完了");

    const honoResponse = await fetch(HONO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: session.user.id,
        content: body.content,
      }),
    });

    console.log("Hono API呼び出し完了:", honoResponse.status);

    const postData = await honoResponse.json();
    if (honoResponse.status === 201) {
      console.log("投稿作成成功");
      return NextResponse.json(postData, { status: 201 });
    } else if (honoResponse.status === 400) {
      console.log("AI審査で拒否、改善提案あり");
      return NextResponse.json(postData, { status: 400 });
    } else {
      console.log("その他のエラー");
      return createErrorResponse(
        postData.error || "投稿の作成に失敗しました",
        honoResponse.status
      );
    }
  } catch (error) {
    console.error("API Route エラー:", error);
    return createErrorResponse("サーバーエラーが発生しました", 500);
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = url.searchParams.toString();
    const apiUrl = queryParams
      ? `${HONO_API_URL}?${queryParams}`
      : HONO_API_URL;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch posts",
        },
        {
          status: response.status,
        }
      );
    }

    const posts = await response.json();
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
