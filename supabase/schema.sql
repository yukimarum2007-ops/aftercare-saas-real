-- ============================================================
-- 住宅設備アフターメンテナンス マルチテナントSaaS
-- Supabase 完全版スキーマ定義（PostgreSQL / RLS）
-- ============================================================
-- このファイル1本を Supabase の SQL Editor に貼り付けて実行すれば
-- 全テーブル・トリガー・RLSポリシー・Storageバケットが作成されます。
-- （追加のマイグレーションファイルを実行する必要はありません）
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. companies（アフター会社）
-- ------------------------------------------------------------
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,               -- /request/[slug] の一部としても利用可
  phone text,
  address text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. house_makers（ハウスメーカー）
-- ------------------------------------------------------------
create table if not exists house_makers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. profiles（担当者アカウント。auth.usersと1:1）
--    アフター会社の担当者は company_id、ハウスメーカーの担当者は
--    house_maker_id を持つ（どちらか一方のみ）
-- ------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  house_maker_id uuid references house_makers(id) on delete cascade,
  full_name text,
  role text not null default 'staff',       -- 'admin' | 'staff'
  created_at timestamptz not null default now(),
  constraint profiles_one_org_check check (
    (company_id is not null and house_maker_id is null) or
    (company_id is null and house_maker_id is not null)
  )
);

create index if not exists idx_profiles_company_id on profiles(company_id);
create index if not exists idx_profiles_house_maker_id on profiles(house_maker_id);

-- ------------------------------------------------------------
-- 4. 新規サインアップ時の自動処理
--    - pending_company_name がある → 新規アフター会社の自己登録
--      （会社作成 + 管理者profile作成 + ハウスメーカーへの提携申請 pending）
--    - house_maker_id のみ → ハウスメーカー担当者アカウント作成
--    - company_id のみ → 既存アフター会社への担当者追加（管理者が招待する運用）
-- ------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_slug text;
begin
  if new.raw_user_meta_data ? 'pending_company_name' then
    v_slug := lower(regexp_replace(new.raw_user_meta_data->>'pending_company_name', '[^a-zA-Z0-9]+', '-', 'g'))
              || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);

    insert into public.companies (name, slug)
    values (new.raw_user_meta_data->>'pending_company_name', v_slug)
    returning id into v_company_id;

    insert into public.profiles (id, company_id, full_name, role)
    values (new.id, v_company_id, new.raw_user_meta_data->>'full_name', 'admin');

    if new.raw_user_meta_data ? 'house_maker_id' then
      insert into public.company_affiliations (company_id, house_maker_id, status)
      values (v_company_id, (new.raw_user_meta_data->>'house_maker_id')::uuid, 'pending');
    end if;

  elsif new.raw_user_meta_data ? 'house_maker_id' then
    insert into public.profiles (id, house_maker_id, full_name, role)
    values (
      new.id,
      (new.raw_user_meta_data->>'house_maker_id')::uuid,
      new.raw_user_meta_data->>'full_name',
      coalesce(new.raw_user_meta_data->>'role', 'staff')
    );

  elsif new.raw_user_meta_data ? 'company_id' then
    insert into public.profiles (id, company_id, full_name, role)
    values (
      new.id,
      (new.raw_user_meta_data->>'company_id')::uuid,
      new.raw_user_meta_data->>'full_name',
      coalesce(new.raw_user_meta_data->>'role', 'staff')
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ログイン中ユーザーの company_id / house_maker_id を取得するヘルパー関数
create or replace function auth_company_id()
returns uuid
language sql security definer set search_path = public stable
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

create or replace function auth_house_maker_id()
returns uuid
language sql security definer set search_path = public stable
as $$
  select house_maker_id from public.profiles where id = auth.uid();
$$;

-- ------------------------------------------------------------
-- 5. partners（連携工務店）
-- ------------------------------------------------------------
create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  contact_name text,
  contact_phone text,
  share_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create index if not exists idx_partners_company_id on partners(company_id);

-- ------------------------------------------------------------
-- 6. availability_slots（日付ごとの午前/午後 受付可否）
-- ------------------------------------------------------------
create table if not exists availability_slots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  slot_date date not null,
  am_available boolean not null default true,
  pm_available boolean not null default true,
  unique (company_id, slot_date)
);

create index if not exists idx_availability_company_date on availability_slots(company_id, slot_date);

-- ------------------------------------------------------------
-- 7. company_affiliations（アフター会社 ⇔ ハウスメーカーの提携申請）
-- ------------------------------------------------------------
create type affiliation_status as enum ('pending', 'approved', 'rejected');

create table if not exists company_affiliations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  house_maker_id uuid not null references house_makers(id) on delete cascade,
  status affiliation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, house_maker_id)
);

create index if not exists idx_affiliations_house_maker on company_affiliations(house_maker_id);
create index if not exists idx_affiliations_company on company_affiliations(company_id);

-- ------------------------------------------------------------
-- 8. requests（案件）
-- ------------------------------------------------------------
create type request_status as enum ('new', 'confirmed', 'completed');
create type preferred_slot_type as enum ('am', 'pm');
create type request_source as enum ('homeowner', 'house_maker', 'partner');

create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  partner_id uuid references partners(id) on delete set null,
  house_maker_id uuid references house_makers(id) on delete set null,
  source request_source not null default 'homeowner',
  tracking_code text unique not null default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  request_category text not null,          -- 選択式カテゴリ（例: 給湯器/水回り/建具 等）
  description text,
  photo_urls text[] not null default '{}',
  preferred_date date,
  preferred_slot preferred_slot_type,
  status request_status not null default 'new',
  staff_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_requests_company_id on requests(company_id);
create index if not exists idx_requests_status on requests(company_id, status);
create index if not exists idx_requests_tracking_code on requests(tracking_code);
create index if not exists idx_requests_house_maker on requests(house_maker_id);

-- ------------------------------------------------------------
-- 9. updated_at 自動更新トリガー（requests / company_affiliations 共通）
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_requests_updated_at on requests;
create trigger trg_requests_updated_at
  before update on requests
  for each row execute function set_updated_at();

drop trigger if exists trg_affiliations_updated_at on company_affiliations;
create trigger trg_affiliations_updated_at
  before update on company_affiliations
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- 10. ハウスメーカー経由の案件登録を検証するトリガー
--     承認(approved)済みの提携がなければ、そのハウスメーカー名義での
--     登録を拒否する（アプリ側の制御だけに依存しないDB側の強制）
-- ------------------------------------------------------------
create or replace function validate_request_house_maker()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.house_maker_id is not null then
    -- ログイン中のハウスメーカー担当者本人からの登録であることを確認
    if new.house_maker_id is distinct from auth_house_maker_id() then
      raise exception 'この操作を行う権限がありません（ハウスメーカーIDが一致しません）';
    end if;

    -- 対象アフター会社との提携が「承認済み」であることを確認
    if not exists (
      select 1 from company_affiliations
      where company_id = new.company_id
        and house_maker_id = new.house_maker_id
        and status = 'approved'
    ) then
      raise exception 'このハウスメーカーとアフター会社の提携は承認されていません';
    end if;

    new.source := 'house_maker';
  elsif new.partner_id is not null then
    new.source := 'partner';
  else
    new.source := 'homeowner';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_request_house_maker on requests;
create trigger trg_validate_request_house_maker
  before insert on requests
  for each row execute function validate_request_house_maker();

-- ------------------------------------------------------------
-- 11. RLS 有効化
-- ------------------------------------------------------------
alter table companies enable row level security;
alter table house_makers enable row level security;
alter table profiles enable row level security;
alter table partners enable row level security;
alter table availability_slots enable row level security;
alter table company_affiliations enable row level security;
alter table requests enable row level security;

-- ---- companies ----
-- ログインスタッフ・公開フォームどちらからも会社名を参照できるようにする
-- （公開フォームは会社名表示のため、slugでの単発参照が必要。insert/updateは不可）
create policy "companies_public_select" on companies
  for select using (true);

-- ---- house_makers ----
-- 新規登録フォームの選択肢として誰でも参照可能にする
create policy "house_makers_public_select" on house_makers
  for select using (true);

-- ---- profiles ----
-- 自分自身の profile 行は（会社/ハウスメーカーどちらの担当者でも）参照可能
create policy "profiles_select_self" on profiles
  for select using (id = auth.uid());

create policy "profiles_select_own_company" on profiles
  for select using (company_id = auth_company_id());

create policy "profiles_update_self" on profiles
  for update using (id = auth.uid());

-- ---- partners ----
create policy "partners_select_own_company" on partners
  for select using (company_id = auth_company_id());

create policy "partners_insert_own_company" on partners
  for insert with check (company_id = auth_company_id());

create policy "partners_update_own_company" on partners
  for update using (company_id = auth_company_id());

create policy "partners_delete_own_company" on partners
  for delete using (company_id = auth_company_id());

-- ---- availability_slots ----
create policy "slots_select_own_company" on availability_slots
  for select using (company_id = auth_company_id());

create policy "slots_public_select" on availability_slots
  for select using (true); -- 公開フォーム・ハウスメーカー側が空き枠を参照するため

create policy "slots_insert_own_company" on availability_slots
  for insert with check (company_id = auth_company_id());

create policy "slots_update_own_company" on availability_slots
  for update using (company_id = auth_company_id());

-- ---- company_affiliations ----
-- アフター会社側は自社の申請状況を閲覧
create policy "affiliations_select_own_company" on company_affiliations
  for select using (company_id = auth_company_id());

-- ハウスメーカー側は自社宛の申請を閲覧・承認/却下
create policy "affiliations_select_own_house_maker" on company_affiliations
  for select using (house_maker_id = auth_house_maker_id());

create policy "affiliations_update_own_house_maker" on company_affiliations
  for update using (house_maker_id = auth_house_maker_id());

-- ---- requests ----
-- 管理画面: 自社案件のみ閲覧・更新可
create policy "requests_select_own_company" on requests
  for select using (company_id = auth_company_id());

create policy "requests_update_own_company" on requests
  for update using (company_id = auth_company_id());

-- ハウスメーカー担当者は、自分が登録した案件の対応状況を閲覧できる
create policy "requests_select_own_house_maker" on requests
  for select using (house_maker_id = auth_house_maker_id());

-- 公開フォーム: 未ログインでも「登録(insert)」は可能（自社宛のみ）
-- ハウスメーカー担当者がログイン状態で house_maker_id 付きで登録する場合も
-- このポリシーの check(true) を通過するが、上記トリガー(10)が承認状態と
-- 本人確認を強制するため、未承認の会社へは登録できない。
create policy "requests_public_insert" on requests
  for insert with check (true);

-- 顧客ステータス確認画面は requests テーブルを直接SELECTさせず、
-- 下記の get_request_status() RPC (security definer) 経由でのみ参照させる。
-- （個人情報を含む全カラムを公開しないための設計）

create or replace function get_request_status(p_tracking_code text)
returns table (
  tracking_code text,
  status request_status,
  preferred_date date,
  preferred_slot preferred_slot_type,
  company_name text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select r.tracking_code, r.status, r.preferred_date, r.preferred_slot,
         c.name as company_name, r.created_at
  from requests r
  join companies c on c.id = r.company_id
  where r.tracking_code = upper(p_tracking_code);
$$;

grant execute on function get_request_status(text) to anon, authenticated;

-- ------------------------------------------------------------
-- 12. Storage（写真アップロード用バケット）
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('request-photos', 'request-photos', true)
on conflict (id) do nothing;

-- 誰でもアップロード可（施主・工務店・ハウスメーカー担当者は未ログイン/多様なため）
create policy "request_photos_public_insert"
  on storage.objects for insert
  with check (bucket_id = 'request-photos');

create policy "request_photos_public_select"
  on storage.objects for select
  using (bucket_id = 'request-photos');

-- ------------------------------------------------------------
-- 13. 動作確認用サンプルデータ（任意・不要なら削除してください）
-- ------------------------------------------------------------
-- insert into companies (name, slug, phone, address) values
--   ('サンプル住設アフターサービス株式会社', 'sample-after', '03-1234-5678', '東京都渋谷区1-1-1');
--
-- insert into house_makers (name, slug) values
--   ('サンプルハウスメーカー株式会社', 'sample-housemaker');
