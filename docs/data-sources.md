# Open Data APIs for Kalyanagar QoL Indicators

Research deliverable for coc-487. Documents available free/open APIs for Bangalore
neighborhood data relevant to the Hyperlocal Quality of Life Scorecard Platform.

---

## 1. Air Quality (PM2.5 / AQI)

### 1a. CPCB CCR — Primary Source

| Field | Detail |
|-------|--------|
| **Portal** | https://app.cpcbccr.com/ccr/ |
| **Auth** | Internal access token (not publicly documented); use unofficial clients |
| **Data format** | JSON (via API), CSV/XLSX (via download) |
| **Update frequency** | Real-time (15-min averages), 24h AQI bulletins |
| **Parameters** | PM2.5, PM10, SO2, NO2, O3, CO, NH3, AQI |
| **Rate limits** | Undocumented; scraping-based access |

**Bangalore CAAQMS stations (nearest to Kalyanagar):**

| Station | Type | Agency | Approx. distance from Kalyanagar |
|---------|------|--------|----------------------------------|
| Hebbal | CAAQMS | CPCB | ~3 km |
| Peenya | CAAQMS | KSPCB | ~7 km |
| BTM Layout | CAAQMS | CPCB | ~12 km |
| Silk Board | CAAQMS | CPCB | ~14 km |
| Bapuji Nagar | CAAQMS | CPCB | ~10 km |
| City Railway Station | CAAQMS | KSPCB | ~8 km |

**Unofficial Python client (recommended for ingestion):**
```
pip install cpcbccr
```
```python
from cpcbccr import get_states, get_cities, get_stations, get_data

stations = get_stations(city='Bengaluru')
data = get_data(
    from_date='01-01-2026',
    to_date='01-02-2026',
    station_id='site_XXX',   # get from get_stations()
    criteria='24 Hours'
)
```
- Repo: https://github.com/sakethramanujam/cpcbccr-python-client
- Also: https://github.com/thejeshgn/cpcbccr (scraper with request body examples)

**Request body structure (internal API):**
```json
{
  "filtersToApply": {
    "parameter_list": [
      {"id": 0, "itemName": "PM2.5", "itemValue": "parameter_193"},
      {"id": 1, "itemName": "PM10", "itemValue": "parameter_215"}
    ],
    "criteria": "24 Hours",
    "fromDate": "01-01-2026",
    "toDate": "02-01-2026",
    "state": "Karnataka",
    "city": "Bengaluru",
    "station": "site_XXX"
  }
}
```

### 1b. OpenAQ — Aggregator (Alternative)

| Field | Detail |
|-------|--------|
| **API endpoint** | `https://api.openaq.org/v3/locations?coordinates=13.025,77.64&radius=10000` |
| **Auth** | API key (free registration at https://explore.openaq.org) |
| **Data format** | JSON |
| **Update frequency** | Mirrors source (typically hourly) |
| **Parameters** | PM2.5, PM10, O3, NO2, SO2, CO |
| **Rate limits** | Free tier: 100 req/min |
| **Docs** | https://docs.openaq.org |

### 1c. data.gov.in — Historical Datasets

| Field | Detail |
|-------|--------|
| **URL** | https://www.data.gov.in/dataset-group-name/Air%20Quality |
| **Auth** | API key (free registration) |
| **Data format** | CSV, JSON, XML |
| **Update frequency** | Periodic uploads (not real-time) |
| **Coverage** | Historical AQI data for Bangalore monitoring stations |

---

## 2. Water Quality (WQI)

### 2a. BWSSB Water Quality Monitoring System — Primary Source

| Field | Detail |
|-------|--------|
| **Portal** | https://wqms.bwssb.gov.in/ |
| **Auth** | Public dashboard (no API key documented) |
| **Data format** | Web dashboard; no documented REST API |
| **Update frequency** | Live monitoring (since Feb 2023) |
| **Parameters** | pH, TDS, turbidity, chlorine, flow rate |
| **Coverage** | BWSSB supply areas including Kalyanagar |
| **Ingestion strategy** | Web scraping or contact BWSSB for data access |

### 2b. OpenCity — BWSSB Data

| Field | Detail |
|-------|--------|
| **URL** | https://data.opencity.in/dataset/bwssb-data |
| **Auth** | None (open access) |
| **Data format** | CSV |
| **Datasets available** | Water supply coverage, sewerage key figures, consumption categories, population & supply requirements |
| **Note** | No direct water *quality* datasets; mostly infrastructure/operational data |

### 2c. Bengaluru Lakes Water Quality

| Field | Detail |
|-------|--------|
| **URL** | https://data.opencity.in/dataset/bengaluru-lakes-water-quality-data |
| **Auth** | None (open access) |
| **Data format** | CSV |
| **Parameters** | Lake-specific water quality measurements |
| **Coverage** | Bengaluru lakes (relevant for environmental QoL) |

### 2d. CPCB National Water Monitoring Programme (NWMP)

| Field | Detail |
|-------|--------|
| **URL** | https://cpcb.nic.in/nwmp-data/ |
| **Auth** | Public access |
| **Data format** | PDF reports, downloadable datasets |
| **Update frequency** | Monthly/quarterly |
| **Parameters** | pH, DO, BOD, Total Coliform, Conductivity, Nitrates, Fecal Coliform |
| **Coverage** | Water bodies across India; check for Bangalore-area stations |

### 2e. CGWB Ground Water Quality

| Field | Detail |
|-------|--------|
| **Portal** | https://gwdata.cgwb.gov.in/ |
| **Auth** | Public visualization; bulk download is district-wise |
| **Data format** | Downloadable (format varies) |
| **Update frequency** | Annual (pre-monsoon sampling) |
| **Parameters** | 85 parameters including pH, TDS, fluoride, arsenic, iron, nitrate |
| **Coverage** | Karnataka/Bangalore district; 1767 monitoring stations statewide |
| **GitHub tool** | https://github.com/craigdsouza/cgwb (data exploration scripts) |

---

## 3. Traffic & Commute Time

### 3a. Google Maps Routes API — Primary for Commute Time

| Field | Detail |
|-------|--------|
| **API endpoint** | `https://routes.googleapis.com/directions/v2:computeRoutes` |
| **Auth** | Google Cloud API key (requires billing account) |
| **Data format** | JSON |
| **Update frequency** | Real-time |
| **Free tier** | $200/month credit (~40,000 route requests) |
| **Parameters** | Duration, distance, duration_in_traffic, polyline |
| **Docs** | https://developers.google.com/maps/documentation/routes |

**Note:** Google Maps TrafficLayer (JS API) is visual-only — no raw data extraction.

**Sample request for Kalyanagar → MG Road commute:**
```
POST https://routes.googleapis.com/directions/v2:computeRoutes
Headers: X-Goog-Api-Key: YOUR_KEY, X-Goog-FieldMask: routes.duration,routes.distanceMeters

{
  "origin": {"location": {"latLng": {"latitude": 13.025, "longitude": 77.64}}},
  "destination": {"location": {"latLng": {"latitude": 12.975, "longitude": 77.607}}},
  "travelMode": "DRIVE",
  "routingPreference": "TRAFFIC_AWARE"
}
```

### 3b. Mapbox Traffic v1 — Congestion Layer

| Field | Detail |
|-------|--------|
| **Tileset** | `mapbox://mapbox.mapbox-traffic-v1` |
| **TileJSON** | `https://api.mapbox.com/v4/mapbox.mapbox-traffic-v1.json?access_token=TOKEN` |
| **Vector tiles** | `https://api.mapbox.com/v4/mapbox.mapbox-traffic-v1/{z}/{x}/{y}.mvt?access_token=TOKEN` |
| **Tilequery** | `https://api.mapbox.com/v4/mapbox.mapbox-traffic-v1/tilequery/{lng},{lat}.json?access_token=TOKEN` |
| **Auth** | Mapbox access token (free tier available) |
| **Update frequency** | Every ~8 minutes |
| **Data fields** | `congestion` (low/moderate/heavy/severe), `class` (road type), `closed` |
| **Free tier** | 50,000 map loads/month; traffic tiles may require sales contact for full access |
| **Docs** | https://docs.mapbox.com/data/tilesets/reference/mapbox-traffic-v1/ |

### 3c. HERE Traffic API v7 — Flow & Incidents

| Field | Detail |
|-------|--------|
| **Base URL** | `https://data.traffic.hereapi.com/v7` |
| **Flow endpoint** | `/flow?in=circle:13.025,77.64;r=3000&locationReferencing=shape&apiKey=KEY` |
| **Incidents** | `/incidents?in=circle:13.025,77.64;r=3000&locationReferencing=shape&apiKey=KEY` |
| **Auth** | API key (free registration at https://developer.here.com) |
| **Data format** | JSON |
| **Update frequency** | Real-time |
| **Free tier** | 1,000 requests/day |
| **Docs** | https://www.here.com/docs/bundle/traffic-api-developer-guide-v7 |

### 3d. TomTom Traffic Index — Congestion Index

| Field | Detail |
|-------|--------|
| **URL** | https://www.tomtom.com/traffic-index/bengaluru-traffic/ |
| **Auth** | Public dashboard (no API); API available via developer portal |
| **Data** | Congestion index, travel time ratio, peak hours analysis |
| **Relevance** | Direct source for `congestion_index` indicator |

### 3e. Open Data Sources

| Source | URL | Data |
|--------|-----|------|
| Bengaluru Traffic Police | https://btp.gov.in/statistics.aspx | Accident statistics, traffic data |
| OpenCity Traffic Signals | https://data.opencity.in/dataset/bengaluru-city-traffic-signal-data | Signal locations |
| Kaggle Traffic Dataset | https://www.kaggle.com/datasets/preethamgouda/banglore-city-traffic-dataset | Historical traffic patterns |

---

## 4. Green Cover & Tree Canopy

### 4a. Copernicus / Sentinel-2 — NDVI (Primary)

| Field | Detail |
|-------|--------|
| **Portal** | https://dataspace.copernicus.eu/ |
| **APIs** | STAC, openEO, Sentinel Hub |
| **Auth** | Free registration; token-based (OAuth2) |
| **Token endpoint** | https://documentation.dataspace.copernicus.eu/APIs/Token.html |
| **Spatial resolution** | 10m (bands B2, B3, B4, B8 for NDVI) |
| **Revisit time** | 5 days (2-satellite constellation) |
| **Free tier** | 12 TB/month download, 20 MBps bandwidth |
| **NDVI calculation** | `(B8 - B4) / (B8 + B4)` from Sentinel-2 L2A |

**Kalyanagar bounding box (approximate):**
```
BBOX: 77.62,13.01,77.66,13.04
```

### 4b. Google Earth Engine

| Field | Detail |
|-------|--------|
| **Portal** | https://earthengine.google.com/ |
| **Auth** | Google Cloud account (free for non-commercial research) |
| **Datasets** | Sentinel-2, Landsat, MODIS NDVI |
| **API** | Python (`ee` library) and JavaScript |
| **Spatial resolution** | 10m (Sentinel-2), 30m (Landsat) |
| **Docs** | https://developers.google.com/earth-engine/datasets/catalog/sentinel-2 |

### 4c. Global Forest Watch — Tree Cover Loss

| Field | Detail |
|-------|--------|
| **API base** | `https://data-api.globalforestwatch.org/` |
| **Query endpoint** | `/dataset/umd_tree_cover_loss/v1.9/query/json` |
| **Auth** | None required for basic queries |
| **Data format** | JSON, CSV |
| **Method** | POST with GeoJSON geometry |

**Sample request for Kalyanagar:**
```json
POST https://data-api.globalforestwatch.org/dataset/umd_tree_cover_loss/v1.9/query/json
{
  "sql": "SELECT SUM(area__ha) FROM results GROUP BY umd_tree_cover_loss__year",
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[77.62,13.01],[77.66,13.01],[77.66,13.04],[77.62,13.04],[77.62,13.01]]]
  }
}
```

### 4d. ISRO Bhuvan — Land Use / Vegetation

| Field | Detail |
|-------|--------|
| **Portal** | https://bhuvan.nrsc.gov.in/ |
| **WMS endpoint** | `https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms/get` |
| **Auth** | Free registration (optional for basic WMS) |
| **Layers** | Land use/land cover, urban land use, vegetation, water bodies |
| **Data format** | WMS tiles (PNG/JPEG), WFS (GeoJSON) |
| **Thematic portal** | https://bhuvan.nrsc.gov.in/gis/thematic/index.php |

### 4e. IISc BUiS — Bangalore Urban Information System

| Field | Detail |
|-------|--------|
| **Portal** | https://wgbis.ces.iisc.ac.in/sdss/BUiS/ |
| **Auth** | Public access |
| **Technology** | GeoServer, PostgreSQL/PostGIS, Leaflet |
| **Services** | WMS, WFS (OGC standards) |
| **Data** | Ward-wise tree distribution, urban dynamics (1973-2023), green cover change |
| **Key stat** | 51.86% increase in built-up area, 26.28% decrease in green cover (1973-2022) |
| **Relevance** | Best source for historical green cover trends at ward level |

### 4f. OpenStreetMap — Parks & Trees

| Field | Detail |
|-------|--------|
| **Overpass API** | `https://overpass-api.de/api/interpreter` |
| **Auth** | None |
| **Data format** | JSON, XML |

**Query for parks near Kalyanagar:**
```
[out:json];
(
  way["leisure"="park"](13.01,77.62,13.04,77.66);
  relation["leisure"="park"](13.01,77.62,13.04,77.66);
  node["natural"="tree"](13.01,77.62,13.04,77.66);
);
out body;
```

---

## 5. Noise Levels

### 5a. KSPCB Continuous Noise Monitoring — Primary Source

| Field | Detail |
|-------|--------|
| **Portal** | https://kspcb.karnataka.gov.in/environmental-monitoring/noise |
| **Stations in Bangalore** | 10 continuous monitoring stations |
| **Station types** | 2 silence, 3 residential, 3 commercial, 2 industrial |
| **Known stations** | BTM (R), Marathalli (C), Nisarga Bhawan (R), Parisar Bhawan (C), Peenya (I) |
| **Parameters** | Leq (day/night), Lmax, Lmin |
| **Auth** | Public dashboard |
| **Data format** | Web dashboard; no REST API |

### 5b. Karnataka Open Data — Historical Noise

| Field | Detail |
|-------|--------|
| **URL** | https://karnataka.data.gov.in/catalog/noise-levels-measured-monitoring-stations-bangalore |
| **Auth** | API key available via "Catalog API" |
| **Data format** | CSV (zip download available) |
| **Update frequency** | Periodic uploads |
| **Parameters** | Month-wise day/night noise levels at monitoring stations |
| **Published** | Dec 2021, updated Feb 2022 |
| **Source agency** | Karnataka State Pollution Control Board |

### 5c. CPCB ENVIS Noise Database

| Field | Detail |
|-------|--------|
| **URL** | https://cpcbenvis.nic.in/noise_quality_data.html |
| **Auth** | Public access |
| **Data format** | Downloadable reports |
| **Coverage** | National noise monitoring data including Bangalore stations |

### 5d. data.gov.in — CAAQMS Noise Data

| Field | Detail |
|-------|--------|
| **URLs** | https://www.data.gov.in/resource/noise-levels-measured-caaqms-cpcb-bwssb-commercial-area |
| **Auth** | data.gov.in API key (free) |
| **Data format** | CSV |
| **Note** | API not yet available for all datasets; download is primary access method |

### 5e. NoiseCapture — Crowdsourced (Supplementary)

| Field | Detail |
|-------|--------|
| **Community map** | https://noise-planet.org/map_noisecapture/ |
| **App** | Android (Google Play, F-Droid) |
| **License** | ODbL (open data) |
| **Data** | Crowdsourced noise measurements with GPS |
| **Limitation** | Coverage depends on community participation; sparse in India |

---

## 6. BBMP Civic Infrastructure

### 6a. OpenCity Urban Data Portal

| Field | Detail |
|-------|--------|
| **URL** | https://data.opencity.in/ |
| **Auth** | None (open access) |
| **Data format** | CSV, JSON, TSV, XML |
| **Datasets** | Traffic signals, BWSSB data, BBMP ward info, lakes data, ward delimitation |
| **BBMP ward data** | https://data.opencity.in/dataset/bbmp-ward-information |
| **Ward delimitation 2023** | https://data.opencity.in/dataset/bbmp-wards-delimitation-2023 |

### 6b. Bengaluru Open Data Portal

| Field | Detail |
|-------|--------|
| **URL** | https://opendata.benscl.com/ |
| **Auth** | None |
| **Data format** | CSV, JSON, TSV, XML |
| **BWSSB group** | https://opendata.benscl.com/?q=group/bangalore-water-supply-and-sewerage-board |

### 6c. K-GIS / KSRSAC — Spatial Data

| Field | Detail |
|-------|--------|
| **Portal** | https://kgis.ksrsac.in/bengalurugis/ |
| **Downloads** | https://kgis.ksrsac.in/kgis/downloads.aspx |
| **Auth** | Public access |
| **Data format** | KML, SHP (Shapefile), PDF |
| **Layers** | Admin boundaries, ward maps, transport, hydrology, cadastral maps, satellite imagery |
| **GitHub mirror** | https://github.com/samashti/KGIS (public spatial data) |

---

## Recommended Ingestion Priority

| Indicator | Primary Source | Fallback | API Quality |
|-----------|---------------|----------|-------------|
| **PM2.5 / AQI** | CPCB via `cpcbccr` Python client | OpenAQ API | Good (unofficial) |
| **WQI** | BWSSB WQMS (scrape) | CPCB NWMP downloads | Poor (no API) |
| **Tree Canopy** | Sentinel-2 via Copernicus STAC API | IISc BUiS WMS | Good (official) |
| **Park Area** | OSM Overpass API + BBMP ward data | OpenCity datasets | Good (open) |
| **Commute Time** | Google Routes API | HERE Routing API | Excellent |
| **Congestion Index** | HERE Traffic API v7 | Mapbox Traffic v1 | Good |
| **Noise** | Karnataka OGD (CSV download) | KSPCB portal (scrape) | Fair |

---

## Key Observations

1. **Air quality has the best API access** — CPCB data is available via unofficial Python clients. Hebbal station is closest to Kalyanagar (~3 km).

2. **Water quality is the hardest to get programmatically** — BWSSB WQMS has no public API. Best strategy is periodic scraping or requesting data access directly from BWSSB.

3. **Traffic/commute data requires paid APIs** — Google Routes and HERE both have free tiers sufficient for daily sampling. TomTom provides the congestion index value directly.

4. **Green cover requires satellite imagery processing** — Copernicus/Sentinel-2 is the best free source for NDVI at 10m resolution with 5-day revisit. IISc BUiS provides historical context.

5. **Noise data is available but not real-time** — Karnataka OGD has historical CSV datasets. Real-time access would require scraping KSPCB's dashboard.

6. **BBMP civic data is scattered** — OpenCity and opendata.benscl.com are the best aggregators, but coverage is uneven. K-GIS/KSRSAC provides the spatial layers.
