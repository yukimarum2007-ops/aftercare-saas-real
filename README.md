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
| `/dashboard/partners` | 簡易な共有リンク発行（旧・工務店連携機能。下記参照） | 必須 |
| `/dashboard/customers` | アフター会社用：施主様の連携申請の確認・承認、電話番号での招待 | 必須 |
| `/request/[company_id]` | 施主・工務店の受付フォーム（未ログインでも利用可） | 不要 |
| `/status` , `/status/[code]` | 対応状況確認（受付ID入力） | 不要 |
| `/signup` | アフター会社の新規会員登録（ハウスメーカー・工務店選択・提携申請） | 不要 |
| `/maker/login` | ハウスメーカー・工務店ログイン（共通） | - |
| `/maker/signup` | ハウスメーカー・工務店の新規会員登録（種別選択） | 不要 |
| `/maker/dashboard` | 提携アフター会社の確認・承認、新規提携申請の送信 | 必須 |
| `/maker/dashboard/new-request` | 承認済みアフター会社への案件直接登録 | 必須 |
| `/maker/dashboard/customers` | 施主様の連携申請の確認・承認、電話番号での招待 | 必須 |
| `/customer/login` | 施主様ログイン | - |
| `/customer/signup` | 施主様の新規会員登録（ハウスメーカー・工務店/アフター会社を任意で選択） | 不要 |
| `/customer/dashboard` | 施主様マイページ：連携状況の確認・承認、新規連携申請、自分の依頼案件の確認 | 必須 |
| `/customer/dashboard/new-request` | 施主様がアフター会社へ直接依頼を登録 | 必須 |
| `/customer/dashboard/profile` | 施主様プロフィール編集（氏名・連絡先・パスワード） | 必須 |

---

## 1. デモ用ログイン情報

| 種別 | メールアドレス | パスワード |
|---|---|---|
| アフター会社（サンプル住設アフターサービス株式会社） | `company@example.com` | `password123` |
| ハウスメーカー（サンプルハウスメーカー株式会社） | `maker@example.com` | `password123` |
| 工務店（みらい工務店株式会社） | `contractor@example.com` | `password123` |
| 施主様（田中 一郎） | `customer@example.com` | `password123` |

### ハウスメーカーと工務店は同じ立場

ハウスメーカーと工務店は、アフター会社・施主様どちらから見ても「連携先」として同じ機能
（アフター会社との提携申請・承認、施主様との連携申請・承認、案件の代理登録）を持つため、
ログイン(`/maker/login`)・新規登録(`/maker/signup`)ページは共通です。登録時に「ハウスメーカー」
か「工務店」かを選ぶだけで、以降の画面・機能はまったく同じです。

なお `/dashboard/partners` は、アカウントを持たない工務店へ簡易な共有リンクだけを発行する
従来からの軽量機能で、上記のアカウント型の工務店連携とは別物として残しています。

### 提携・連携はすべて相互承認制

- **アフター会社 ⇔ ハウスメーカー/工務店**: `/signup` でアフター会社が申請することも、
  `/maker/signup` や `/maker/dashboard` からハウスメーカー・工務店側が申請することもできます。
  申請していない側が `/dashboard`（アフター会社）または `/maker/dashboard`（ハウスメーカー・
  工務店）で承認・却下します。
- **施主様 ⇔ アフター会社/ハウスメーカー・工務店**: `/customer/signup` で施主様が申請するほか、
  `/customer/dashboard` からいつでも新しい連携を申請できます。逆にアフター会社・ハウスメーカー・
  工務店側も `/dashboard/customers` や `/maker/dashboard/customers` で施主様の電話番号を入力して
  招待でき、この場合は施主様が `/customer/dashboard` で承認・却下します。
- どちらの連携も、承認の有無にかかわらず施主様は好きなアフター会社に直接依頼を送れます
  （連携はあくまで「どの会社がどの施主様を担当しているか」を管理するための機能です）。

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

ログイン・新規登録・ステータス確認などの単体カードページには `.auth-bg` クラスで控えめな
装飾ブロブ（ぼかしたグラデーションの円）を背景に配置しています。一覧のクリック可能な行には
`.list-row`（ホバーで少し浮き上がる）、データが0件の箇所には `.empty-state`（アイコン付き）を
使っており、こちらも `app/globals.css` で一括調整できます。

### 提携・連携の解除

承認済みの提携・連携は、アフター会社側は `/dashboard`、ハウスメーカー・工務店側は
`/maker/dashboard` から、それぞれ相手先の行にあるリンク解除アイコンボタンで解除できます。
申請中のものも同じボタンで取り消せます（確認ダイアログが表示されます）。

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
    page.tsx                        ダッシュボード（提携ハウスメーカー・工務店の管理含む）
    calendar/page.tsx
    partners/page.tsx               簡易共有リンク（旧・工務店連携機能）
    customers/page.tsx              施主様の連携申請 管理・招待
  maker/                            ハウスメーカー・工務店 共通
    login/page.tsx
    signup/page.tsx
    dashboard/                      要ログイン
      layout.tsx
      page.tsx                      提携アフター会社の管理・新規申請
      new-request/page.tsx
      customers/page.tsx            施主様の連携申請 管理・招待
  customer/                         施主様
    login/page.tsx
    signup/page.tsx
    dashboard/                      要ログイン
      layout.tsx
      page.tsx                      マイページ（連携状況・依頼案件）
      new-request/page.tsx
      profile/page.tsx
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
