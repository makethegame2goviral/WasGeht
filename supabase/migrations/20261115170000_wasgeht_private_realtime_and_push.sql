-- WasGeht: private Realtime call channels and Web Push runtime configuration.
-- The VAPID private key is provisioned separately in wg_push_config and must never be committed.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.wg_is_conversation_member(p_conversation_id uuid)
returns boolean language sql stable security definer
set search_path = public, pg_temp
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.wg_conversation_members m
    where m.conversation_id = p_conversation_id and m.user_id = (select auth.uid())
  );
$$;
revoke all on function private.wg_is_conversation_member(uuid) from public, anon;
grant execute on function private.wg_is_conversation_member(uuid) to authenticated;

create or replace function private.wg_is_conversation_creator(p_conversation_id uuid)
returns boolean language sql stable security definer
set search_path = public, pg_temp
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.wg_conversations c
    where c.id = p_conversation_id and c.created_by = (select auth.uid())
  );
$$;
revoke all on function private.wg_is_conversation_creator(uuid) from public, anon;
grant execute on function private.wg_is_conversation_creator(uuid) to authenticated;

create or replace function private.wg_is_public_conversation(p_conversation_id uuid)
returns boolean language sql stable security definer
set search_path = public, pg_temp
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.wg_conversations c
    where c.id = p_conversation_id and c.is_public = true
  );
$$;
revoke all on function private.wg_is_public_conversation(uuid) from public, anon;
grant execute on function private.wg_is_public_conversation(uuid) to authenticated;

drop policy if exists "wg_conv_members_visible_to_members" on public.wg_conversation_members;
create policy "wg_conv_members_visible_to_members" on public.wg_conversation_members
for select to authenticated
using (
  user_id = (select auth.uid())
  or private.wg_is_conversation_member(conversation_id)
  or private.wg_is_public_conversation(conversation_id)
);

drop policy if exists "wg_conv_members_add_by_creator" on public.wg_conversation_members;
create policy "wg_conv_members_add_by_creator" on public.wg_conversation_members
for insert to authenticated
with check (
  private.wg_is_conversation_creator(conversation_id)
  or private.wg_is_conversation_member(conversation_id)
);

create table if not exists public.wg_push_config (
  id smallint primary key default 1 check (id = 1),
  vapid_private_jwk jsonb not null,
  subject text not null,
  updated_at timestamptz not null default now()
);
alter table public.wg_push_config enable row level security;
revoke all on public.wg_push_config from anon, authenticated;
grant select on public.wg_push_config to service_role;
drop policy if exists "wg_push_config_service_read" on public.wg_push_config;
create policy "wg_push_config_service_read" on public.wg_push_config for select to service_role using (true);
drop policy if exists "wg_push_config_service_read" on public.wg_push_config;
create policy "wg_push_config_service_read" on public.wg_push_config
for select to service_role using (true);

drop policy if exists "WasGeht call channel members read" on realtime.messages;
drop policy if exists "WasGeht call channel members broadcast" on realtime.messages;
create policy "WasGeht call channel members read" on realtime.messages
for select to authenticated
using (
  extension = 'broadcast'
  and exists (
    select 1 from public.wg_conversation_members m
    where m.conversation_id::text = substring((select realtime.topic()) from 9)
      and m.user_id = (select auth.uid())
  )
);
create policy "WasGeht call channel members broadcast" on realtime.messages
for insert to authenticated
with check (
  extension = 'broadcast'
  and exists (
    select 1 from public.wg_conversation_members m
    where m.conversation_id::text = substring((select realtime.topic()) from 9)
      and m.user_id = (select auth.uid())
  )
);
