-- Neighborhoods table
create table neighborhoods (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  city text not null default 'Bangalore',
  ward_number int,
  lat double precision not null,
  lng double precision not null,
  boundary jsonb, -- GeoJSON polygon
  created_at timestamptz not null default now()
);

-- Indicator categories
create type indicator_category as enum (
  'air_quality',
  'water_quality',
  'green_cover',
  'traffic',
  'noise',
  'waste_management',
  'safety',
  'civic_infrastructure',
  'community_amenities'
);

-- Indicator definitions
create table indicators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category indicator_category not null,
  unit text not null,
  description text,
  source text,
  source_url text,
  higher_is_better boolean not null default false,
  min_value double precision,
  max_value double precision,
  created_at timestamptz not null default now()
);

-- Indicator readings (time-series data)
create table readings (
  id uuid primary key default gen_random_uuid(),
  neighborhood_id uuid not null references neighborhoods(id),
  indicator_id uuid not null references indicators(id),
  value double precision not null,
  recorded_at timestamptz not null,
  source_raw jsonb,
  created_at timestamptz not null default now()
);

create index idx_readings_neighborhood on readings(neighborhood_id);
create index idx_readings_indicator on readings(indicator_id);
create index idx_readings_recorded_at on readings(recorded_at desc);
create unique index idx_readings_unique on readings(neighborhood_id, indicator_id, recorded_at);

-- City-wide averages for comparison
create table city_averages (
  id uuid primary key default gen_random_uuid(),
  indicator_id uuid not null references indicators(id),
  value double precision not null,
  period_start date not null,
  period_end date not null,
  created_at timestamptz not null default now()
);

create unique index idx_city_avg_unique on city_averages(indicator_id, period_start, period_end);

-- Scores (computed from readings, 0-100 scale)
create table scores (
  id uuid primary key default gen_random_uuid(),
  neighborhood_id uuid not null references neighborhoods(id),
  indicator_id uuid not null references indicators(id),
  score int not null check (score >= 0 and score <= 100),
  computed_at timestamptz not null default now(),
  period_start date not null,
  period_end date not null
);

create unique index idx_scores_unique on scores(neighborhood_id, indicator_id, period_start, period_end);

-- Overall neighborhood score (aggregate)
create table neighborhood_scores (
  id uuid primary key default gen_random_uuid(),
  neighborhood_id uuid not null references neighborhoods(id),
  overall_score int not null check (overall_score >= 0 and overall_score <= 100),
  category_scores jsonb not null, -- { "air_quality": 72, "water_quality": 85, ... }
  computed_at timestamptz not null default now(),
  period_start date not null,
  period_end date not null
);

create unique index idx_neighborhood_scores_unique on neighborhood_scores(neighborhood_id, period_start, period_end);

-- Enable Row Level Security
alter table neighborhoods enable row level security;
alter table indicators enable row level security;
alter table readings enable row level security;
alter table city_averages enable row level security;
alter table scores enable row level security;
alter table neighborhood_scores enable row level security;

-- Public read access policies
create policy "Public read neighborhoods" on neighborhoods for select using (true);
create policy "Public read indicators" on indicators for select using (true);
create policy "Public read readings" on readings for select using (true);
create policy "Public read city_averages" on city_averages for select using (true);
create policy "Public read scores" on scores for select using (true);
create policy "Public read neighborhood_scores" on neighborhood_scores for select using (true);
