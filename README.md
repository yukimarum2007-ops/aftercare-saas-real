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
| `/dashboard/customers` | アフター会社用：施主様の連携申請 承認/却下 | 必須 |
| `/request/[company_id]` | 施主・工務店の受付フォーム（未ログインでも利用可） | 不要 |
| `/status` , `/status/[code]` | 対応状況確認（受付ID入力） | 不要 |
| `/signup` | アフター会社の新規会員登録（ハウスメーカー選択・提携申請） | 不要 |
| `/maker/login` | ハウスメーカー担当者ログイン | - |
| `/maker/dashboard` | ハウスメーカー用：提携申請の承認/却下 | 必須 |
| `/maker/dashboard/new-request` | ハウスメーカー用：承認済み会社への案件直接登録 | 必須 |
| `/maker/dashboard/customers` | ハウスメーカー用：施主様の連携申請 承認/却下 | 必須 |
| `/customer/login` | 施主様ログイン | - |
| `/customer/signup` | 施主様の新規会員登録（ハウスメーカー・アフター会社を任意で選択） | 不要 |
| `/customer/dashboard` | 施主様マイページ：連携状況・自分の依頼案件の確認 | 必須 |
| `/customer/dashboard/new-request` | 施主様がアフター会社へ直接依頼を登録 | 必須 |
| `/customer/dashboard/profile` | 施主様プロフィール編集（氏名・連絡先・パスワード） | 必須 |

---

## 1. デモ用ログイン情報

| 種別 | メールアドレス | パスワード |
|---|---|---|
| アフター会社（サンプル住設アフターサービス株式会社） | `company@example.com` | `password123` |
| ハウスメーカー（サンプルハウスメーカー株式会社） | `maker@example.com` | `password123` |
| 施主様（田中 一郎） | `customer@example.com` | `password123` |

`/signup` から新しいアフター会社アカウントをその場で作成することもできます
（作成した会社は「みらい住宅株式会社」への提携申請が `pending` の状態で登録されます）。

`/customer/signup` から施主様アカウントも作成できます。ハウスメーカー・アフター会社は
**どちらも任意選択**で、選択した側にはそれぞれ「承認待ち」の連携申請が作成されます。
アフター会社は `/dashboard/customers`、ハウスメーカーは `/maker/dashboard/customers` から
承認・却下ができ、施主様は `/customer/dashboard` でその状況と自分が依頼した案件を確認できます。
施主様はどのアフター会社にも、連携の承認有無にかかわらず直接依頼を送ることができます
（連携はあくまで「担当が把握している顧客」を管理するための機能です）。

### 訪問希望時間について

アフター会社が空き枠設定で切り替えられるのは引き続き「午前/午後」の単位です。
そのうえで、依頼フォーム（施主直接・工務店経由・ハウスメーカー経由のいずれも）では、
選んだ午前/午後の中でさらに30分刻みの具体的な時間を選択できます。

- 午前: 9:00 / 9:30 / 10:00 / 10:30 / 11:00 / 11:30
- 午後: 13:00 / 13:30 / 14:00 / 14:30 / 15:00 / 15:30

選んだ時間は `preferred_time` として案件に保存され、管理画面・ステータス確認画面の
「希望日時」表示にも反映されます。

### プロフィール編集

施主様は新規登録時だけでなく、`/customer/dashboard/profile` からいつでも氏名・電話番号・
住所・メールアドレス・パスワードを変更できます（マイページ右上の歯車アイコンから移動できます）。

### デザインについて

Noto Sans JPフォント、グラデーションボタン、柔らかい影のカードなど、全体的にモダンな見た目に
統一しています。ボタン・カード・入力欄の基本スタイルは `app/globals.css` の `.btn-primary` /
`.btn-secondary` / `.card` / `.input-lg` クラスに集約されているため、ここを調整すると
アプリ全体のトーンを一括で変更できます。

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
