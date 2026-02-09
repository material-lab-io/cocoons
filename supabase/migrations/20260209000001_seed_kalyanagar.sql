-- Seed: Kalyanagar neighborhood + 4 MVP indicator categories
-- Idempotent: uses ON CONFLICT to allow re-runs

-- 1. Kalyanagar neighborhood
INSERT INTO neighborhoods (name, slug, city, ward_number, lat, lng)
VALUES ('Kalyanagar', 'kalyanagar', 'Bangalore', 21, 13.0250, 77.6400)
ON CONFLICT (slug) DO NOTHING;

-- 2. MVP indicators across 4 categories: air_quality, water_quality, green_cover, traffic
INSERT INTO indicators (name, slug, category, unit, description, source, source_url, higher_is_better, min_value, max_value)
VALUES
  ('PM2.5', 'pm25', 'air_quality', 'µg/m³',
   'Fine particulate matter concentration (24h average)',
   'CPCB', 'https://app.cpcbccr.com/ccr_docs/LATEST_AQI_BULLETIN.pdf',
   false, 0, 500),
  ('Air Quality Index', 'aqi', 'air_quality', 'AQI',
   'Composite Air Quality Index (CPCB NAQI)',
   'CPCB', 'https://app.cpcbccr.com/ccr_docs/LATEST_AQI_BULLETIN.pdf',
   false, 0, 500),
  ('Water Quality Index', 'wqi', 'water_quality', 'WQI',
   'Composite water quality score from BWSSB testing',
   'BWSSB', 'https://bwssb.karnataka.gov.in',
   true, 0, 100),
  ('Tree Canopy Cover', 'tree_canopy', 'green_cover', '%',
   'Percentage of area covered by tree canopy',
   'IISc / ISRO', 'https://iisc.ac.in',
   true, 0, 100),
  ('Park Area per Capita', 'park_area', 'green_cover', 'm²/person',
   'Green/park space available per resident',
   'BBMP', 'https://bbmp.gov.in',
   true, 0, 50),
  ('Average Commute Time', 'commute_time', 'traffic', 'min',
   'Average commute time to city center during peak hours',
   'Google Maps', 'https://maps.google.com',
   false, 0, 120),
  ('Traffic Congestion Index', 'congestion_index', 'traffic', 'index',
   'Ratio of actual vs free-flow travel time',
   'TomTom / Google', 'https://www.tomtom.com/traffic-index/',
   false, 1.0, 5.0)
ON CONFLICT (slug) DO NOTHING;

-- 3. Sample readings for the past 7 days (representative snapshot)
-- Using generate_series for daily readings per indicator
DO $$
DECLARE
  n_id uuid;
  ind record;
  base_val double precision;
  day_offset int;
  reading_val double precision;
BEGIN
  SELECT id INTO n_id FROM neighborhoods WHERE slug = 'kalyanagar';

  FOR ind IN SELECT id, slug FROM indicators LOOP
    -- Base values per indicator
    base_val := CASE ind.slug
      WHEN 'pm25' THEN 45.0
      WHEN 'aqi' THEN 95.0
      WHEN 'wqi' THEN 72.0
      WHEN 'tree_canopy' THEN 18.0
      WHEN 'park_area' THEN 3.2
      WHEN 'commute_time' THEN 38.0
      WHEN 'congestion_index' THEN 1.8
      ELSE 50.0
    END;

    FOR day_offset IN 0..29 LOOP
      -- Add deterministic variance based on day offset
      reading_val := base_val + (sin(day_offset * 0.5) * base_val * 0.1);
      reading_val := GREATEST(0, ROUND(reading_val::numeric, 2));

      INSERT INTO readings (neighborhood_id, indicator_id, value, recorded_at)
      VALUES (n_id, ind.id, reading_val, NOW() - (day_offset || ' days')::interval)
      ON CONFLICT (neighborhood_id, indicator_id, recorded_at) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- 4. Scores for current month (0-100 scale)
DO $$
DECLARE
  n_id uuid;
  ind record;
  base_val double precision;
  computed_score int;
  min_v double precision;
  max_v double precision;
  hib boolean;
  normalized double precision;
  p_start date;
  p_end date;
BEGIN
  SELECT id INTO n_id FROM neighborhoods WHERE slug = 'kalyanagar';
  p_start := date_trunc('month', CURRENT_DATE)::date;
  p_end := (date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day')::date;

  FOR ind IN SELECT id, slug, higher_is_better, min_value, max_value FROM indicators LOOP
    base_val := CASE ind.slug
      WHEN 'pm25' THEN 45.0
      WHEN 'aqi' THEN 95.0
      WHEN 'wqi' THEN 72.0
      WHEN 'tree_canopy' THEN 18.0
      WHEN 'park_area' THEN 3.2
      WHEN 'commute_time' THEN 38.0
      WHEN 'congestion_index' THEN 1.8
      ELSE 50.0
    END;

    min_v := ind.min_value;
    max_v := ind.max_value;
    hib := ind.higher_is_better;

    IF max_v - min_v = 0 THEN
      computed_score := 50;
    ELSE
      normalized := GREATEST(0, LEAST(1, (base_val - min_v) / (max_v - min_v)));
      IF hib THEN
        computed_score := ROUND(normalized * 100)::int;
      ELSE
        computed_score := ROUND((1 - normalized) * 100)::int;
      END IF;
    END IF;

    INSERT INTO scores (neighborhood_id, indicator_id, score, period_start, period_end)
    VALUES (n_id, ind.id, computed_score, p_start, p_end)
    ON CONFLICT (neighborhood_id, indicator_id, period_start, period_end) DO NOTHING;
  END LOOP;
END $$;

-- 5. City averages for comparison
DO $$
DECLARE
  ind record;
  city_val double precision;
  p_start date;
  p_end date;
BEGIN
  p_start := date_trunc('month', CURRENT_DATE)::date;
  p_end := (date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day')::date;

  FOR ind IN SELECT id, slug FROM indicators LOOP
    city_val := CASE ind.slug
      WHEN 'pm25' THEN 55.0
      WHEN 'aqi' THEN 120.0
      WHEN 'wqi' THEN 65.0
      WHEN 'tree_canopy' THEN 15.0
      WHEN 'park_area' THEN 2.5
      WHEN 'commute_time' THEN 45.0
      WHEN 'congestion_index' THEN 2.2
      ELSE 50.0
    END;

    INSERT INTO city_averages (indicator_id, value, period_start, period_end)
    VALUES (ind.id, city_val, p_start, p_end)
    ON CONFLICT (indicator_id, period_start, period_end) DO NOTHING;
  END LOOP;
END $$;

-- 6. Overall neighborhood score (aggregate of per-indicator scores)
DO $$
DECLARE
  n_id uuid;
  p_start date;
  p_end date;
  cat_scores jsonb := '{}'::jsonb;
  cat text;
  cat_avg int;
  overall int;
  cat_count int := 0;
  cat_total int := 0;
BEGIN
  SELECT id INTO n_id FROM neighborhoods WHERE slug = 'kalyanagar';
  p_start := date_trunc('month', CURRENT_DATE)::date;
  p_end := (date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day')::date;

  FOR cat IN SELECT DISTINCT i.category::text FROM indicators i LOOP
    SELECT ROUND(AVG(s.score))::int INTO cat_avg
    FROM scores s
    JOIN indicators i ON i.id = s.indicator_id
    WHERE s.neighborhood_id = n_id
      AND s.period_start = p_start
      AND s.period_end = p_end
      AND i.category::text = cat;

    IF cat_avg IS NOT NULL THEN
      cat_scores := cat_scores || jsonb_build_object(cat, cat_avg);
      cat_total := cat_total + cat_avg;
      cat_count := cat_count + 1;
    END IF;
  END LOOP;

  IF cat_count > 0 THEN
    overall := ROUND(cat_total::numeric / cat_count)::int;

    INSERT INTO neighborhood_scores (neighborhood_id, overall_score, category_scores, period_start, period_end)
    VALUES (n_id, overall, cat_scores, p_start, p_end)
    ON CONFLICT (neighborhood_id, period_start, period_end) DO NOTHING;
  END IF;
END $$;
