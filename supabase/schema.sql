-- ─────────────────────────────────────────────────────────────────────────────
-- OpenDoor — production schema for Supabase (Postgres)
-- NOT used by the demo. The demo stores data in browser localStorage
-- (lib/store.tsx). This file mirrors lib/types.ts so the store can be swapped
-- for Supabase later. Run it in Supabase → SQL Editor.
-- ─────────────────────────────────────────────────────────────────────────────

create type mentor_status as enum ('none', 'pending', 'approved', 'rejected');
create type active_role   as enum ('mentee', 'mentor');
create type availability  as enum ('available', 'limited', 'unavailable');
create type request_status as enum ('pending', 'accepted', 'declined', 'completed', 'canceled');
create type application_status as enum ('pending', 'approved', 'rejected');
create type helpful as enum ('yes', 'somewhat', 'no');

-- One row per auth user (Supabase Auth owns emails + passwords).
create table profiles (
  id            uuid primary key references auth.users on delete cascade,
  name          text not null check (char_length(name) between 2 and 100),
  grade         text not null,
  bio           text not null default '' check (char_length(bio) <= 600),
  interests     text not null default '',
  is_admin      boolean not null default false,
  mentor_status mentor_status not null default 'none',
  active_role   active_role not null default 'mentee',
  created_at    timestamptz not null default now(),
  constraint mentor_role_requires_approval check (active_role = 'mentee' or mentor_status = 'approved')
);

create table mentor_profiles (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null unique references profiles on delete cascade,
  headline          text not null,
  categories        text[] not null,
  achievements      text[] not null default '{}',
  intro             text not null,
  bio               text not null default '',
  experience        text[] not null default '{}',
  skills            text[] not null default '{}',
  topics            text[] not null default '{}',
  formats           text[] not null,
  availability      availability not null default 'available',
  availability_note text not null default '',
  other_areas       text[] not null default '{}',
  intro_video_path  text,                 -- Supabase Storage path in bucket "intro-videos"
  slots             timestamptz[] not null default '{}',  -- open 1-hour booking slots
  listed            boolean not null default false,
  created_at        timestamptz not null default now()
  -- future: resume_url, hourly_rate
);

create table mentoring_requests (
  id               uuid primary key default gen_random_uuid(),
  mentor_id        uuid not null references mentor_profiles on delete cascade,
  mentor_user_id   uuid not null references profiles on delete cascade,
  mentee_id        uuid not null references profiles on delete cascade,
  category         text not null,
  help_with        text not null check (char_length(help_with) between 15 and 1000),
  format           text not null check (format in ('online', 'in-person')),
  preferred_at     timestamptz not null,
  notes            text not null default '' check (char_length(notes) <= 500),
  status           request_status not null default 'pending',
  mentor_note      text not null default '',
  duration_minutes int check (duration_minutes between 5 and 480),
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint no_self_request check (mentor_user_id <> mentee_id),
  constraint completed_has_duration check (status <> 'completed' or duration_minutes is not null)
);
-- Reject past dates on insert (mirrors the form validation).
create or replace function reject_past_requests() returns trigger language plpgsql as $$
begin
  if new.preferred_at <= now() then raise exception 'preferred_at must be in the future'; end if;
  return new;
end $$;
create trigger requests_future_only before insert on mentoring_requests
  for each row execute function reject_past_requests();

create table feedback (
  id               uuid primary key default gen_random_uuid(),
  request_id       uuid not null unique references mentoring_requests on delete cascade,
  mentor_id        uuid not null references mentor_profiles on delete cascade,
  mentee_id        uuid not null references profiles on delete cascade,
  rating           int not null check (rating between 1 and 5),
  helpful          helpful not null,
  learned          text not null,
  improve          text not null default '',
  review           text not null default '',
  consent_to_share boolean not null default false,   -- show rating + review on the mentor's public profile
  mentor_reply     text not null default '' check (char_length(mentor_reply) <= 600),
  mentor_reply_at  timestamptz,
  created_at       timestamptz not null default now()
);

create table mentor_applications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles on delete cascade,
  name         text not null,
  grade        text not null,
  categories   text[] not null,
  other_area   text not null default '',
  expertise    text not null,
  achievements jsonb not null,            -- [{ "text": "...", "grade": "10" }]
  experience   text not null,
  motivation   text not null,
  topics       text not null,
  availability text not null,
  formats      text[] not null,
  intro_video_path text,
  status       application_status not null default 'pending',
  review_note  text not null default '',
  created_at   timestamptz not null default now(),
  reviewed_at  timestamptz
);

-- Session chat: open from acceptance until 5 days after the session ends (enforced in the insert policy).
create table messages (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references mentoring_requests on delete cascade,
  sender_id   uuid not null references profiles on delete cascade,
  body        text not null check (char_length(body) between 1 and 1000),
  created_at  timestamptz not null default now()
);

create type hours_status as enum ('pending', 'approved', 'rejected');

-- Volunteer-hour submissions a mentor sends to the school for approval.
create table hours_submissions (
  id              uuid primary key default gen_random_uuid(),
  mentor_user_id  uuid not null references profiles on delete cascade,
  request_ids     uuid[] not null,
  total_minutes   int not null check (total_minutes > 0),
  note            text not null default '',
  status          hours_status not null default 'pending',
  reviewer_note   text not null default '',
  created_at      timestamptz not null default now(),
  reviewed_at     timestamptz
);

-- ── Row Level Security ──────────────────────────────────────────────────────
create or replace function is_admin() returns boolean language sql stable security definer as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

alter table profiles            enable row level security;
alter table mentor_profiles     enable row level security;
alter table mentoring_requests  enable row level security;
alter table feedback            enable row level security;
alter table mentor_applications enable row level security;
alter table messages            enable row level security;
alter table hours_submissions   enable row level security;

-- profiles: you see/edit yourself; admins see everyone. (is_admin / mentor_status
-- changes should go through admin-only RPCs — add a trigger blocking self-escalation.)
create policy "own profile"   on profiles for select using (id = auth.uid() or is_admin());
create policy "edit own"      on profiles for update using (id = auth.uid());
create policy "insert own"    on profiles for insert with check (id = auth.uid() and is_admin = false and mentor_status = 'none');

-- mentor profiles: public directory shows listed profiles only.
create policy "public listed" on mentor_profiles for select using (listed or user_id = auth.uid() or is_admin());
create policy "mentor edits own" on mentor_profiles for update using (user_id = auth.uid());
create policy "admin manages" on mentor_profiles for all using (is_admin());

-- requests: visible to the two participants and admins.
create policy "participants read" on mentoring_requests for select
  using (mentee_id = auth.uid() or mentor_user_id = auth.uid() or is_admin());
create policy "mentee creates" on mentoring_requests for insert
  with check (mentee_id = auth.uid() and status = 'pending');
create policy "participants update" on mentoring_requests for update
  using (mentee_id = auth.uid() or mentor_user_id = auth.uid());

-- feedback: mentee writes once; only admins read (never public without consent).
create policy "mentee writes" on feedback for insert with check (
  mentee_id = auth.uid() and exists (
    select 1 from mentoring_requests r where r.id = request_id and r.mentee_id = auth.uid() and r.status = 'completed'));
create policy "read feedback" on feedback for select using (
  is_admin() or mentee_id = auth.uid() or consent_to_share
  or exists (select 1 from mentor_profiles m where m.id = mentor_id and m.user_id = auth.uid()));
-- NOTE: expose public reviews through a view that omits the private "learned"/"improve" columns.
create policy "mentor replies" on feedback for update
  using (exists (select 1 from mentor_profiles m where m.id = mentor_id and m.user_id = auth.uid()));

-- applications: applicant creates + reads own; admins review.
create policy "apply" on mentor_applications for insert with check (user_id = auth.uid() and status = 'pending');
create policy "read own" on mentor_applications for select using (user_id = auth.uid() or is_admin());
create policy "admin reviews" on mentor_applications for update using (is_admin());

-- messages: participants read/write while the chat window is open; admins may read for safety.
create policy "participants read messages" on messages for select using (
  is_admin() or exists (select 1 from mentoring_requests r where r.id = request_id
    and (r.mentee_id = auth.uid() or r.mentor_user_id = auth.uid())));
create policy "participants send while open" on messages for insert with check (
  sender_id = auth.uid() and exists (select 1 from mentoring_requests r where r.id = request_id
    and (r.mentee_id = auth.uid() or r.mentor_user_id = auth.uid())
    and r.status in ('accepted', 'completed')
    and now() <= r.preferred_at + make_interval(mins => coalesce(r.duration_minutes, 60)) + interval '5 days'));

-- hours: mentors submit + read their own; school admins review.
create policy "mentor submits hours" on hours_submissions for insert with check (mentor_user_id = auth.uid() and status = 'pending');
create policy "read hours" on hours_submissions for select using (mentor_user_id = auth.uid() or is_admin());
create policy "admin reviews hours" on hours_submissions for update using (is_admin());
