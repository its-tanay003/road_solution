begin;

-- Cover foreign keys used by profile/SOS lookups.
create index if not exists idx_emergency_contacts_user_id
  on public.emergency_contacts(user_id);

create index if not exists idx_incident_logs_sos_event_id
  on public.incident_logs(sos_event_id);

create index if not exists idx_sos_events_unified_incident_id
  on public.sos_events(unified_incident_id);

create index if not exists idx_sos_events_user_id
  on public.sos_events(user_id);

-- Remove duplicate profile policies and recreate optimized versions.
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Users insert own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;

create policy "Users read own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users update own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Recreate emergency contact policies with initplan-friendly auth lookups.
drop policy if exists "Users read own contacts" on public.emergency_contacts;
drop policy if exists "Users insert own contacts" on public.emergency_contacts;
drop policy if exists "Users update own contacts" on public.emergency_contacts;
drop policy if exists "Users delete own contacts" on public.emergency_contacts;

create policy "Users read own contacts"
  on public.emergency_contacts
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert own contacts"
  on public.emergency_contacts
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update own contacts"
  on public.emergency_contacts
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete own contacts"
  on public.emergency_contacts
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Recreate SOS event policies with initplan-friendly auth lookups.
drop policy if exists "Users read own sos" on public.sos_events;
drop policy if exists "Users insert own sos" on public.sos_events;

create policy "Users read own sos"
  on public.sos_events
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert own sos"
  on public.sos_events
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- RLS was enabled without policies on these tables.
drop policy if exists "Users read own incident logs" on public.incident_logs;
create policy "Users read own incident logs"
  on public.incident_logs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.sos_events
      where sos_events.id = incident_logs.sos_event_id
        and sos_events.user_id = (select auth.uid())
    )
  );

drop policy if exists "Authenticated users read active responders" on public.responders;
create policy "Authenticated users read active responders"
  on public.responders
  for select
  to authenticated
  using (is_active = true);

-- PostGIS metadata should be readable but not writable through anon/auth clients.
alter table public.spatial_ref_sys enable row level security;

drop policy if exists "Read spatial reference metadata" on public.spatial_ref_sys;
create policy "Read spatial reference metadata"
  on public.spatial_ref_sys
  for select
  to anon, authenticated
  using (true);

-- Revoke public execution of the custom SECURITY DEFINER helper flagged by Supabase.
revoke execute on function public.rls_auto_enable() from anon, authenticated;

commit;
