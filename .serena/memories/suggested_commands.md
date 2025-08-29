# 開発コマンド集

## フロントエンド (Next.js)
```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プロダクションサーバー起動  
npm start

# リント (構文チェック)
npm run lint

# リント自動修正
npm run lint:fix

# フォーマット
npm run format

# フォーマット確認
npm run format:check

# ユニットテスト
npm test

# テスト監視モード
npm run test:watch

# E2Eテスト
npm run test:e2e

# E2EテストUI
npm run test:e2e:ui

# E2Eテストデバッグ
npm run test:e2e:debug
```

## バックエンド (Hono API)
```bash
cd sanctuary-api

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プロダクションサーバー起動
npm start
```

## データベース (Prisma)
```bash
cd sanctuary-api

# Prisma Studioでデータベース確認
npx prisma studio

# マイグレーション実行
npx prisma migrate dev

# データベースリセット
npx prisma migrate reset
```

## サーバー起動手順
1. PostgreSQL Docker起動
2. `cd sanctuary-api && npm run dev` (port 3001)  
3. `npm run dev` (Next.js - port 3000)
4. AI審査サーバー起動 (sanctuary-ai-review)

## 利用可能なポート
- Next.js: http://localhost:3000
- Hono API: http://localhost:3001
- Python AI: http://localhost:8000 (推測)