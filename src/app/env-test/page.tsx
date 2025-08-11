"use client";

import { useState } from "react";
import { client } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EnvTestPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>("未テスト");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const testConnection = async () => {
    try {
      setConnectionStatus("テスト中...");
      const { error } = await client.from("users").select("count");

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
{supabaseUrl ? (
                <span className="text-green-600"><CheckCircle className="w-4 h-4 inline mr-1" />設定済み</span>
              ) : (
                <span className="text-red-600"><X className="w-4 h-4 inline mr-1" />未設定</span>
              )}
            </p>
            <p>
              <strong>SUPABASE_ANON_KEY:</strong>{" "}
{supabaseKey ? (
                <span className="text-green-600"><CheckCircle className="w-4 h-4 inline mr-1" />設定済み</span>
              ) : (
                <span className="text-red-600"><X className="w-4 h-4 inline mr-1" />未設定</span>
              )}
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
