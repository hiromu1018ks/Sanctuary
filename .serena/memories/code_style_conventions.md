# コーディングスタイル・規約

## TypeScript規約
- **厳密な型定義**: any型は使用禁止、適切な型定義を行う
- **エクスポート**: named exportを基本とし、default exportは限定的に使用
- **ファイル拡張子**: `.ts`, `.tsx`を明示的に記述 (deno互換性)

## ファイル命名規則
- **lowerCamelCase**: ファイル名は`symbolIndex.ts`, `lspClient.ts`のようにキャメルケース
- **コンポーネント**: PascalCaseで命名 (`UserProfile.tsx`)
- **フック**: `use`プレフィックス (`useAdmin.tsx`)

## コード品質ツール
- **ESLint**: 構文チェック・コードスタイル統一
- **Prettier**: フォーマット自動調整
- **TypeScript strict mode**: 厳密な型チェック有効

## React/Next.js規約
- **App Router**: Next.js 13+ App Routerを使用
- **'use client'**: クライアントコンポーネントは明示的に指定
- **コンポーネント分離**: UI, hooks, utilityの適切な分離

## データベース・API規約
- **Prisma**: ORMとしてPrismaを使用
- **Auth.js v5**: 認証システムの標準
- **RESTful API**: Hono frameworkでRESTfulな設計

## インポート規約
```typescript
// 相対パス時は拡張子を明記 (deno互換性)
import { utils } from "./utils.ts"

// エイリアス使用
import { Button } from "@/components/ui/button"
```

## テスト規約
- **Jest + RTL**: コンポーネントテスト
- **Playwright**: E2Eテスト
- **テスト駆動開発**: 重要機能には必要に応じてテスト追加