-- ユーザーマスタ
create table user_mst (
  id uuid default gen_random_uuid() primary key,
  username text not null unique,
  email text not null unique,
  password_hash text not null,
  gender text not null check (gender in ('male', 'female')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 「すき」判定マスタ
create table suki_mst (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references user_mst(id) on delete cascade,
  target_user_id uuid not null references user_mst(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, target_user_id)
);

-- 「きらい」判定マスタ
create table kirai_mst (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references user_mst(id) on delete cascade,
  target_user_id uuid not null references user_mst(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, target_user_id)
);

-- チャットトランザクション
create table chat_trn (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid not null references user_mst(id) on delete cascade,
  receiver_id uuid not null references user_mst(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- インデックス
create index idx_suki_mst_user_id on suki_mst(user_id);
create index idx_suki_mst_target_user_id on suki_mst(target_user_id);
create index idx_kirai_mst_user_id on kirai_mst(user_id);
create index idx_kirai_mst_target_user_id on kirai_mst(target_user_id);
create index idx_chat_trn_sender_id on chat_trn(sender_id);
create index idx_chat_trn_receiver_id on chat_trn(receiver_id);
create index idx_chat_trn_created_at on chat_trn(created_at);

-- RLSポリシーの設定
alter table user_mst enable row level security;
alter table suki_mst enable row level security;
alter table kirai_mst enable row level security;
alter table chat_trn enable row level security;

-- ユーザーテーブルのポリシー
create policy "全てのユーザー操作を許可" on user_mst
  for all using (true);

-- すきテーブルのポリシー
create policy "すき情報の全操作を許可" on suki_mst
  for all using (true);

-- きらいテーブルのポリシー
create policy "きらい情報の全操作を許可" on kirai_mst
  for all using (true);

-- チャットテーブルのポリシー
create policy "チャットの全操作を許可" on chat_trn
  for all using (true);