import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrlStatus = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? "SET"
    : "NOT SET";
  const supabaseAnonKeyStatus = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? "SET"
    : "NOT SET";

  let connectionTest = "未テスト";

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.from("users").select("count");
    connectionTest = error ? `エラー: ${error.message}` : "接続成功";
  } catch (err) {
    connectionTest = `接続失敗: ${err}`;
  }

  return NextResponse.json({
    environment: "server-side",
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrlStatus,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKeyStatus,
    supabase_connection: connectionTest,
    message: "Server-side environment variables check completed",
  });
}
