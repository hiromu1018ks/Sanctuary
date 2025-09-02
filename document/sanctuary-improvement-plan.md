# Sanctuary 改善計画（2025-09-02）

本ドキュメントは、現在のコードベースを踏まえた問題点の洗い出しと、誰でも着手できる改善手順を「改善点 → 改善方法（概要） → 細かいタスク分割」で整理したものです。各項目は小さなPRに分割できるよう具体化しています。

---

## 1. エラーハンドラが常に 500 を返す（Hono）

- 改善点:
  - `sanctuary-api/src/middleware/errorHandler.ts` で、例外が発生していない通常リクエストでも最終的に 500 を返してしまう実装になっています。
- 改善方法（概要）:
  - `await next()` を実行して問題なければ何もしない（レスポンスは下流で確定）。例外時のみ適切に JSON を返す実装へ修正します。
- 細かいタスク分割:
  - ファイルを修正して、`try { await next(); return; } catch { … }` の形に変更。
  - 既存のルートで 200/201/400/404 時に正しく返ることを手動確認（Post 作成、存在しない Post 取得など）。

---

## 2. Gemini API キー未設定時の起動失敗（AI 審査）

- 改善点:
  - `sanctuary-api/src/services/geminiAIReviewService.ts` をルート初期化で `new` しており、`GEMINI_API_KEY` 未設定だと起動時に例外が投げられ API 全体が落ちます。
- 改善方法（概要）:
  - 遅延初期化（必要時に初回 `new`）へ変更。キーが無い場合は「Python FastAPI の AI 審査（`AIReviewService`）にフォールバック」または「開発時は常に rejected/pending にする」等の安全な代替パスを用意します。
- 細かいタスク分割:
  - `posts.ts` でサービス生成を関数化し、`try/catch` で Gemini→Python→スタブの順に選択。
  - `.env` 設計を整理（`GEMINI_API_KEY` / `AI_REVIEW_API_URL`）。README/.env.example を更新。

---

## 3. リアクション機能の不整合（Next ↔ Hono）

- 改善点:
  - Next API（`src/app/api/posts/[postId]/reactions/route.ts`）は POST 時に `user_id` を Hono に渡していません。一方 Hono は `user_id` を必須にしています。
  - Hono に GET `/:postId/reactions` が無く、Next の GET プロキシが 404 になります。
  - Hono の POST は `upsert` のみで「トグル（削除）」が未実装です。
- 改善方法（概要）:
  - Next 側 POST で `auth()` から `session.user.id` を取得し、Hono へ `user_id` を付与。
  - Hono に GET 実装（type 別件数と、`x-user-id` があれば当該ユーザーの isActive 状態）。
  - Hono の POST を「存在すれば削除、無ければ作成」に変更。
- 細かいタスク分割:
  - Next: `POST /api/posts/[postId]/reactions` で `session = await auth()` → `user_id: session.user.id` をボディに含める。未認証は 401。
  - Hono: `GET /api/posts/:postId/reactions` を追加。`counts` は `groupBy`、`userReactions` は `findMany`（`x-user-id` → `UserProfile` → `Reaction`）。
  - Hono: `POST` は `findUnique` → ある場合 `delete`、無い場合 `create`。
  - フロントの `useReactions` は現在の楽観的更新で流用可。初期ロードで 404 しなくなることを確認。

---

## 4. NextAuth と DB の接続前提が README/.env に反映されていない

- 改善点:
  - NextAuth v5 + PrismaAdapter は Next プロセス側にも `DATABASE_URL` が必要ですが、`.env.local` の想定に含まれていません。
- 改善方法（概要）:
  - ルートの `.env.local` にも `DATABASE_URL` を記載。起動順（DB→Hono→Next）を明示します。
- 細かいタスク分割:
  - `.env.example` に Next 用 `DATABASE_URL` を追記。
  - README に起動手順（docker compose → prisma generate/migrate → API → Next）を追記。

---

## 5. `@prisma/client` が devDependencies

- 改善点:
  - `sanctuary-api/package.json` で `@prisma/client` が devDependencies。実行時に必要なため dependencies へ移動が正です。
- 改善方法（概要）:
  - `npm i -w sanctuary-api @prisma/client --save` に変更し lock を更新。
- 細かいタスク分割:
  - package.json 修正 → `npm install` → `npm run build` 動作確認。

---

## 6. API ベース URL の不統一（ハードコード混在）

- 改善点:
  - `src/app/api/posts/route.ts` は `http://localhost:3001` をハードコード。他は `SANCTUARY_API_URL` を使用など揺れがあります。
- 改善方法（概要）:
  - サーバー側は `process.env.SANCTUARY_API_URL ?? 'http://localhost:3001'` に統一。クライアントからの直接叩きは避け、原則 Next の API 経由に寄せます。
- 細かいタスク分割:
  - posts/profile/reactions などの Next API でベース URL をユーティリティ化（`getApiBase()`）。
  - ブラウザ実行コード（hooks/component）は Next API を叩く。

---

## 7. 管理 API をブラウザから直叩きしている

- 改善点:
  - `useUserManagement` が `http://localhost:3001/api/admin/*` を直接 fetch。CORS や環境切替で不便。
- 改善方法（概要）:
  - Next に `/api/admin/users`（GET/PATCH）を作りサーバー側で Hono にプロキシ。Cookie を自動で引き継げます。
- 細かいタスク分割:
  - `src/app/api/admin/users/route.ts`（GET, PATCH）を追加。
  - `useUserManagement` を Next API 経由に変更。

---

## 8. Supabase 依存の残骸（テスト・ページ）

- 改善点:
  - `__tests__` や `env-test` ページが Supabase 前提で、現実のアーキテクチャ（Hono+Prisma）と齟齬。`@/lib/supabase/client` ファイル自体も存在しません。
- 改善方法（概要）:
  - 選択肢A: Supabase 関連を一旦リポジトリから外す。
  - 選択肢B: 開発ツール用途に限定してスタブ化（`src/lib/supabase/client.ts` を安全なダミーに）。
  - テストは Supertest で Next/Hono のエンドポイントに合わせて書き直し。
- 細かいタスク分割:
  - `env-test` ページと `AuthContext` の用途を再定義。未使用なら削除、必要ならダミークライアント実装。
  - Jest の API テストを Hono 経由（あるいは Next API 経由）に変更。

---

## 9. サインイン時に `UserProfile.status` を即 `approved` にしている

- 改善点:
  - `auth.ts` の初回作成で `status: "approved"`。管理承認フロー（pending→approved）と矛盾。
- 改善方法（概要）:
  - 既定は `pending` に戻し、UI 側で `approved` のみが投稿/表示対象になるよう制御します。
- 細かいタスク分割:
  - `auth.ts` の `create` を `status: "pending"` に。
  - Post 作成/タイムライン取得が `approved` 前提で動作しているかを確認。

---

## 10. ログの粒度・PII 取扱い

- 改善点:
  - ルートやサービスで `console.log` が多く、メール等 PII をそのまま出力する個所があります。
- 改善方法（概要）:
  - ログレベル（info/warn/error）を分け、PII はマスク。開発と本番で出力レベルを切り替えます。
- 細かいタスク分割:
  - 共通ロガー util を用意（`LOG_LEVEL` 環境変数）。
  - ユーザー情報は `id` など最小限のみ出力。

---

## 11. 投稿/リアクション API の認証強化（信頼境界）

- 改善点:
  - Hono はクライアント送信の `user_id` を信頼しています。
- 改善方法（概要）:
  - 短期: Next API が `x-user-id` ヘッダーを付与し、Hono 側でそれを使用。`user_id` をボディで受け取らない。
  - 中期: Hono が NextAuth のセッションを直接検証（`Cookie` を転送し、`/api/auth/session` へ問い合わせ）。
- 細かいタスク分割:
  - Next API を修正（`x-user-id` 付与）。
  - Hono の posts/reactions/profile ルートで `x-user-id` を優先使用。
  - 将来的にミドルウェア化（adminAuth の一般化）。

---

## 12. レートリミット未実装

- 改善点:
  - 投稿/リアクションの濫用対策がない。
- 改善方法（概要）:
  - `hono-rate-limiter` などで IP/ユーザー単位のクォータを導入。
- 細かいタスク分割:
  - ルータ毎に 1分 X 回の制限を設定。超過時は 429 を返す。

---

## 13. 画像ホスト許可の見直し（Next Images）

- 改善点:
  - `next.config.ts` の `images.remotePatterns` が Google 画像のみ。ユーザー画像や将来の CDN を想定していません。
- 改善方法（概要）:
  - 使う可能性のあるドメイン（Supabase Storage, GitHub, 自前 CDN 等）を段階的に追加。
- 細かいタスク分割:
  - ユースケース洗い出し → 最小限のホワイトリストを追加。

---

## 14. E2E 実行時に Hono サーバーが起動していない

- 改善点:
  - Playwright の `webServer` は Next のみ。Hono も必要です。
- 改善方法（概要）:
  - `webServer` をスクリプトで多重起動するか、事前起動スクリプトを用意。もしくは Next API をモック。
- 細かいタスク分割:
  - `package.json` に `dev:all`（concurrently で Next と Hono）を追加。
  - Playwright の `webServer` を `command: npm run dev:all` に変更（もしくは `beforeAll` で起動）。

---

## 15. README と `.env.example` の不足

- 改善点:
  - 現在テンプレートのまま。起動手順、必要変数、サービス構成がわかりにくい。
- 改善方法（概要）:
  - 最低限の手順（DB→Hono→Next→AI 審査）と変数一覧を用意。
- 細かいタスク分割:
  - ルートに `.env.example` を追加。
  - README にステップバイステップの起動・テスト手順を追記。

---

## 16. ミドルウェア適用順序（ログ→エラー）

- 改善点:
  - 先にエラーハンドラを適用しており、ログ側で拾えないケースがあります。
- 改善方法（概要）:
  - `loggerMiddleware` → `corsMiddleware` → ルート → `errorHandler` など、目的に応じた並びへ。
- 細かいタスク分割:
  - `src/index.ts` の `app.use` 順序を変更。

---

## 17. リポジトリの不要ファイル・成果物

- 改善点:
  - ルート直下に不明ファイル（`--context`, `'`）が存在。`venv`, `__pycache__`, レポート出力物は .gitignore へ。
- 改善方法（概要）:
  - クリーンアップして CI 時間削減・ノイズ低減。
- 細かいタスク分割:
  - 不要ファイル削除、`.gitignore` へ各種パターンを追加（Python venv/キャッシュ、report）。

---

# 変更ガイド（サンプルコード）

> 参考実装です。実際の反映時は既存コードとの整合を確認してください。

- errorHandler（概要）

```ts
// sanctuary-api/src/middleware/errorHandler.ts
export const errorHandler = async (c: Context, next: () => Promise<void>) => {
  try {
    await next();
    return; // 正常系: 何もしない
  } catch (error) {
    console.error("Error occurred:", error);
    if (error instanceof HTTPException) {
      return c.json({ error: error.message, status: error.status }, error.status);
    }
    return c.json({ error: "Internal Server Error" }, 500);
  }
};
```

- Next の Reactions POST で `user_id` を付与

```ts
// src/app/api/posts/[postId]/reactions/route.ts
import { auth } from "@/../auth";
export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  const body = await request.json();
  const res = await fetch(`${API_BASE_URL}/posts/${params.postId}/reactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reactionType: body.reactionType, user_id: session.user.id }),
  });
  // …
}
```

- Hono の Reactions GET/トグル（イメージ）

```ts
// GET /api/posts/:postId/reactions
app.get("/:postId/reactions", async c => {
  const postId = c.req.param("postId");
  const userId = c.req.header("x-user-id");
  const counts = await prisma.reaction.groupBy({ by: ["reactionType"], where: { postId }, _count: { id: true } });
  let userReactions = undefined;
  if (userId) {
    const up = await prisma.userProfile.findUnique({ where: { userId } });
    if (up) {
      const list = await prisma.reaction.findMany({ where: { postId, userProfileId: up.id } });
      userReactions = list.reduce((acc, r) => ({ ...acc, [r.reactionType]: true }), {} as Record<string, boolean>);
    }
  }
  return c.json({ counts: Object.fromEntries(["thanks","support","empathy","wonderful"].map(k => [k, 0])), userReactions });
});

// POST /api/posts/:postId/reactions  トグル
app.post("/:postId/reactions", async c => {
  const postId = c.req.param("postId");
  const { reactionType, user_id } = await c.req.json();
  const up = await prisma.userProfile.findUnique({ where: { userId: user_id } });
  if (!up) return c.json({ error: "User profile not found" }, 404);
  const where = { postId_userProfileId_reactionType: { postId, userProfileId: up.id, reactionType } };
  const exists = await prisma.reaction.findUnique({ where });
  if (exists) {
    await prisma.reaction.delete({ where: { id: exists.id } });
  } else {
    await prisma.reaction.create({ data: { postId, userProfileId: up.id, reactionType } });
  }
  // 最新 counts を返す処理…
  return c.json({ ok: true });
});
```

---

# 実行順の提案（小さな PR 単位）

1) errorHandler 修正 + ミドルウェア順序整理（ログ→CORS→エラー）
2) Reactions: Next 側 `user_id` 付与 → Hono 側 GET/トグル実装 → UI 動作確認
3) API ベース URL 統一（ユーティリティ導入）
4) Gemini 遅延初期化 + フォールバック（`.env`/README 更新）
5) `@prisma/client` を dependencies へ移動
6) 管理 API を Next 経由に集約（`/api/admin/*`）
7) Supabase 残骸の削除 or スタブ化 + テスト移行（Supertest）
8) README と `.env.example` 追加
9) 認証強化（`x-user-id` → 将来 Cookie 検証へ）/ レートリミット導入
10) 画像ホスト許可の見直し、ログの PII マスキング

---

以上。各タスクは相互依存を最小化してあり、チームで並行作業しやすい粒度に分割しています。
