import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const data = await request.json();
  await supabase.from("posts").insert(data);
  return new NextResponse(null, { status: 200 });
}
