# 住宅設備アフターメンテナンス管理システム（デモ版・モックデータ）

Next.js（App Router）+ Tailwind CSS のみで構築した、外部データベースへの接続が一切不要な
デモ版プロトタイプです。すべてのデータはブラウザのメモリ上（Reactの状態）で管理される
ダミーデータで動作するため、**環境変数の設定なしでそのままVercelにデプロイして画面を確認できます**。

> 元々の設計（Supabase / PostgreSQL / RLS を使ったマルチテナントSaaS）を実際に本番運用する
> 際の移行方針は、末尾の「6. 本番のデータベースに接続する場合」を参照してください。

## 画面構成

| URL | 対象 | ログイン |
|---|---|---|
| `/` | トップ（デモ用ログイン情報の案内あり） | 不要 |
| `/login` | アフター会社スタッフ | - |
| `/dashboard` | ダッシュボード（案件一覧・カレンダー・提携ステータス） | 必須 |
| `/dashboard/calendar` | 空き枠（午前/午後）設定 | 必須 |
| `/dashboard/partners` | 連携工務店管理・共有リンク発行 | 必須 |
| `/request/[company_id]` | 施主・工務店の受付フォーム | 不要 |
| `/status` , `/status/[code]` | 顧客向け対応状況確認 | 不要 |
| `/signup` | アフター会社の新規会員登録（ハウスメーカー選択・提携申請） | 不要 |
| `/maker/login` | ハウスメーカー担当者ログイン | - |
| `/maker/dashboard` | ハウスメーカー用：提携申請の承認/却下 | 必須 |
| `/maker/dashboard/new-request` | ハウスメーカー用：承認済み会社への案件直接登録 | 必須 |

---

## 1. デモ用ログイン情報

| 種別 | メールアドレス | パスワード |
|---|---|---|
| アフター会社（サンプル住設アフターサービス株式会社） | `company@example.com` | `password123` |
| ハウスメーカー（サンプルハウスメーカー株式会社） | `maker@example.com` | `password123` |

`/signup` から新しいアフター会社アカウントをその場で作成することもできます
（作成した会社は「みらい住宅株式会社」への提携申請が `pending` の状態で登録されます）。

※ データはブラウザのタブを開いている間だけメモリ上に保持されます。**ページを再読み込みすると
初期状態（上記のデモアカウント・サンプル案件）にリセットされます。**

---

## 2. ローカル環境構築

```bash
npm install
npm run dev
```

`.env` ファイルの作成や環境変数の設定は一切不要です。`http://localhost:3000` を開けば
すぐに動作します。

---

## 3. Vercelへのデプロイ手順（最短・環境変数不要）

1. GitHubにこのプロジェクトをpush
2. https://vercel.com で `Add New > Project` → 対象リポジトリを選択
3. 環境変数は何も設定せず、そのまま `Deploy` をクリック
4. ビルドが完了すればすぐに本番URLでアクセスできます

Next.jsの標準的な `app` ディレクトリ構成のみで構築しており、外部サービスへの通信や
ビルド時の環境変数読み込みが一切発生しないため、ビルドエラーや環境変数未設定によるエラーは
起こりません。

---

## 4. 技術構成

- **フレームワーク**: Next.js 14（App Router）/ React 18 / TypeScript
- **スタイリング**: Tailwind CSS（ブルー基調、大きめタップ領域のボタン）
- **アイコン**: lucide-react
- **状態管理**: `lib/store.tsx` の React Context 1本のみ（外部の状態管理ライブラリ不使用）
- **依存パッケージ**: `next` / `react` / `react-dom` / `lucide-react` の4つのみ
  （devDependenciesを除く）。Supabase等の外部SDKは含まれていません。

## 5. コード構成

```
app/
  page.tsx                          トップページ
  login/page.tsx                    アフター会社ログイン
  signup/page.tsx                   アフター会社 新規登録
  dashboard/                        アフター会社 管理画面（要ログイン）
    layout.tsx
    page.tsx
    calendar/page.tsx
    partners/page.tsx
  maker/
    login/page.tsx                  ハウスメーカー ログイン
    dashboard/                      ハウスメーカー 管理画面（要ログイン）
      layout.tsx
      page.tsx
      new-request/page.tsx
  request/[company_id]/page.tsx     施主・工務店向け 公開受付フォーム
  status/page.tsx                   受付ID入力画面
  status/[code]/page.tsx            対応状況確認画面
components/                         共通UIコンポーネント
lib/
  store.tsx                         モックデータのContext（状態管理の中心）
  mock-data.ts                      初期ダミーデータ
  types.ts                          型定義
  date.ts                           カレンダー生成ユーティリティ
supabase/schema.sql                 【参考】本番DB移行用のSupabaseスキーマ（未使用）
```

## 6. 本番のデータベースに接続する場合

このデモ版はUI・業務フローの確認を最優先し、Supabase等の外部接続を完全に排除した構成に
なっています。実際にデータを永続化する本番運用に切り替える際は、`supabase/schema.sql`
（マルチテナント設計・RLSポリシー・承認フロー・写真アップロードまで一式定義済み）を参考に、
`lib/store.tsx` 内の各関数（`login` / `submitPublicRequest` / `updateRequestStatus` など）を
実際のAPI呼び出し（Supabase・その他のバックエンド）に置き換えてください。画面側
（`app/` 以下のコンポーネント）は `useStore()` フックを通じてデータを参照する構造に
なっているため、置き換えの影響範囲は `lib/store.tsx` にほぼ閉じています。
