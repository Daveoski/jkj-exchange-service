-- JKJ Exchange Services — PostgreSQL schema (Neon, Supabase or any Postgres 13+).
--
-- You normally do NOT need to run this: the API creates these tables automatically on
-- first use. It is provided for reference, manual setup and DBA review. Rerunnable.

create table if not exists inquiries (
  id              uuid primary key,
  reference       varchar(16)  not null unique,
  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now(),
  full_name       varchar(120) not null,
  email           varchar(254) not null,
  phone           varchar(30)  not null,
  company         varchar(160) not null default '',
  service         varchar(24)  not null,
  currency        varchar(8)   not null,
  amount          numeric(18,2),
  contact_method  varchar(24)  not null,
  message         text         not null,
  status          varchar(24)  not null default 'new',
  admin_notes     text         not null default '',
  email_status    varchar(16)  not null default 'pending',
  client_hash     varchar(64)  not null default '',
  constraint inquiries_service_check check (service in ('rmb','usd','alipay','wechat','bank','other')),
  constraint inquiries_currency_check check (currency in ('CNY','USD','NGN','OTHER')),
  constraint inquiries_contact_check check (contact_method in ('WhatsApp','Email','Phone call')),
  constraint inquiries_status_check check (status in ('new','contacted','in_progress','completed','closed')),
  constraint inquiries_amount_check check (amount is null or amount > 0)
);
create index if not exists inquiries_created_idx on inquiries (created_at desc);
create index if not exists inquiries_status_idx on inquiries (status);
create index if not exists inquiries_email_idx on inquiries (email);

-- Audit trail shown in the dashboard (received, emails, status changes, notes).
create table if not exists inquiry_events (
  id          uuid primary key,
  inquiry_id  uuid not null references inquiries(id) on delete cascade,
  created_at  timestamptz not null default now(),
  actor       varchar(254) not null,
  kind        varchar(24)  not null,
  detail      text not null default ''
);
create index if not exists inquiry_events_inquiry_idx on inquiry_events (inquiry_id, created_at);

-- Dashboard administrators. Passwords are bcrypt hashes; token_version revokes sessions.
create table if not exists admin_users (
  id             uuid primary key,
  email          varchar(254) not null unique,
  password_hash  varchar(255) not null,
  is_active      boolean not null default true,
  token_version  integer not null default 1,
  created_at     timestamptz not null default now(),
  last_login_at  timestamptz
);

-- Rate-limit ledger (keyed HMACs only — no raw IPs or emails). Pruned automatically.
create table if not exists rate_events (
  id          serial primary key,
  bucket      varchar(32) not null,
  key_hash    varchar(64) not null,
  created_at  timestamptz not null default now()
);
create index if not exists rate_events_lookup_idx on rate_events (bucket, key_hash, created_at);

-- To add another administrator, generate a hash with:
--   cd backend && python -c "from jkj.security import hash_password; print(hash_password('Their-Strong-Passw0rd'))"
-- then:
--   insert into admin_users (id, email, password_hash) values (gen_random_uuid(), 'name@example.com', '<hash>');
-- To deactivate one:  update admin_users set is_active = false where email = 'name@example.com';
