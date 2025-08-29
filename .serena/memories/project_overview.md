# Sanctuary - SNSアプリプロジェクト概要

## プロジェクトの目的
「ありがとう」と「応援」が育つ、心の安全地帯を提供するSNSアプリケーション。
ポジティブな投稿のみが共有される場として、AI審査システムを活用した品質管理を行う。

## 技術スタック

### フロントエンド
- **Next.js 15.3.5** (App Router)
- **React 19** 
- **TypeScript 5.9.2**
- **Tailwind CSS 4** (スタイリング)
- **Shadcn/ui** (UIコンポーネント)
- **next-auth 5.0.0-beta.29** (認証システム)

### バックエンド
- **Hono 4.8.9** (API フレームワーク)
- **TypeScript** 
- **Prisma 6.12.0** (ORM)
- **PostgreSQL** (データベース)
- **Google OAuth** (認証プロバイダー)

### テスト・開発ツール
- **Jest 30.0.4** (ユニットテスト)
- **Playwright 1.54.1** (E2Eテスト)
- **React Testing Library** (コンポーネントテスト)
- **ESLint + Prettier** (コード品質)

### AI審査システム
- **Python FastAPI** (別プロジェクト: sanctuary-ai-review)
- **Cardiff NLP BERT** (感情分析)

## プロジェクト構成
```
sanctuary/
├── src/ (Next.jsフロントエンド)
│   ├── app/ (App Router)
│   ├── components/ (UIコンポーネント)
│   ├── hooks/ (カスタムフック)
│   └── lib/ (ユーティリティ)
├── sanctuary-api/ (Honoバックエンド)
│   └── src/
│       ├── routes/ (APIエンドポイント)
│       ├── middleware/ (認証・CORS等)
│       └── generated/ (Prisma生成)
├── sanctuary-ai-review/ (Python AI審査)
└── document/ (仕様書・設計書)
```

## 主要な機能
1. Google認証による自由登録制
2. 投稿CRUD機能
3. Python AI審査システム
4. タイムライン表示
5. プロフィール機能
6. 管理者権限システム