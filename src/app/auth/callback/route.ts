import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  console.log("=== Debug Info ===");
  console.log("origin:", origin);
  console.log("code:", code);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("error:", error);

    if (!error) {
      const next = searchParams.get("next") ?? "/";
      console.log("Success! Redirecting to:", `${origin}${next}`);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  console.log("Error case, redirecting to error page");
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
