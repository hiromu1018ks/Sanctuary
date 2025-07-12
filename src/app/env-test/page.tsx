"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EnvTestPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>("未テスト");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const testConnection = async () => {
    try {
      setConnectionStatus("テスト中...");
      const { data, error } = await supabase.from("users").select("count");

      if (error) {
        setConnectionStatus(`エラー：${error.message}`);
      } else {
        setConnectionStatus("接続完了!");
      }
    } catch (err) {
      setConnectionStatus(`接続失敗：${err}`);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-orange-800">
          🔧 環境変数テストページ
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>クライアントサイド環境変数</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>SUPABASE_URL:</strong>{" "}
              {supabaseUrl ? "✅ 設定済み" : "❌ 未設定"}
            </p>
            <p>
              <strong>SUPABASE_ANON_KEY:</strong>{" "}
              {supabaseKey ? "✅ 設定済み" : "❌ 未設定"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supabase接続テスト</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              <strong>接続状況:</strong> {connectionStatus}
            </p>
            <Button onClick={testConnection}>接続テスト実行</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
