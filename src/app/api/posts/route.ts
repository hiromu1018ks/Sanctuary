import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // セッションから認証済みユーザーを取得;
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new NextResponse(JSON.stringify({ error: "認証が必要です" }), {
        status: 401,
      });
    }

    const { content } = await request.json();

    // user_idは認証されたユーザーから取得;
    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      content,
    });

    if (error) {
      return new NextResponse(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new NextResponse(null, {
      status: 200,
    });
  } catch {
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
      }
    );
  }
}
