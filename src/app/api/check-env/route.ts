import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrlStatus = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? "SET"
    : "NOT SET";
  const supabaseAnonKeyStatus = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? "SET"
    : "NOT SET";

  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrlStatus,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKeyStatus,
    message: "Environment variables check completed",
  });
}
