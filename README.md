# TerraSat AI

TerraSat AI is a map-first, tenant-aware remote-sensing and MRV prototype. LIVE mode searches Sentinel-2 L2A STAC catalogs, reads real COG bands, clips pixels to the submitted polygon, applies Sentinel-2 SCL masking and produces traceable measurements. LIVE failures never fall back to demo values. DEMO data is isolated in `src/demo` and is labelled synthetic.

## Architecture

`React client → Express API → persistent job/analysis store → Sentinel-2 and Open-Meteo providers → raster engine → evidence/MRV compiler → controlled AI tool router`

PostgreSQL schema and migrations model companies, users, parcels, jobs, scenes, analyses, observations, evidence, practice signals, weather, reports, artifacts, field verifications, caches and audit logs. The current single-process prototype uses atomic disk-backed stores for jobs, cached analysis output and artifacts; PostgreSQL becomes mandatory when `NODE_ENV=production`.

## Scientific contract

- NDVI: `(B08 - B04) / (B08 + B04)` at 10 m.
- NDWI (McFeeters variant): `(B03 - B08) / (B03 + B08)` at 10 m.
- NDMI: `(B08 - B11) / (B08 + B11)`; B11 is nearest-neighbour resampled from 20 m to the 10 m processing grid.
- NBR: `(B08 - B12) / (B08 + B12)`; B12 is nearest-neighbour resampled from 20 m.
- NDRE is emitted only when the real B05 red-edge asset exists: `(B08 - B05) / (B08 + B05)`.
- SCL classes 0, 1, 3, 8, 9, 10 and 11 are invalid (no-data/defective/shadow/cloud/cirrus/snow). Polygon-exterior and invalid-reflectance pixels are excluded.
- Sentinel-2 does not directly measure soil organic carbon, irrigation events or field practice compliance. Those claims remain inferred and require field evidence.

Every index includes formula, input bands, resolution, provider/scene, processing timestamp, mask, resampling method and algorithm version (`1.1.0`).

## Local setup

1. Install Node.js 22 and run `npm ci`.
2. Copy `.env.example` to `.env`. Never expose server secrets as `VITE_*` variables.
3. Optional PostgreSQL: `docker compose up -d`, set `DATABASE_URL`, then run `npm run db:migrate`.
4. Start with `npm run dev` and open `http://localhost:3000`.

Open-Meteo supplies real historical daily weather context. Planetary Computer is primary and Earth Search is the secondary public STAC catalog. Provider requests have hard timeouts.

## Validation

Run `npm run typecheck`, `npm test`, and `npm run build`. Tests cover geometry/UTM, polygon clipping, index formulae, SCL masks, asset-aware scene selection, chronological history, request validation, practice epistemic status and real PDF/SHA-256 output.

## Windows desktop

`npm run build:win` builds the web/server bundle, compiles Electron main/preload TypeScript and invokes electron-builder/NSIS. The download API only serves an artifact that actually exists in `release`; it never constructs a fake PE file. Hardware/provider values are measured or displayed as unavailable.

## Production notes

Production requires `DATABASE_URL`, a 32+ character `JWT_SECRET`, explicit CORS origins, durable artifact storage and a reverse proxy with TLS. Bearer tokens must include `sub`, `companyId`, and a role (`admin`, `analyst`, or `viewer`). Resource limits apply to request size, vertex count and polygon area. For horizontal scale, replace the atomic local job/cache adapters with the included PostgreSQL tables and a dedicated worker queue.
