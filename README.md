# AI Coach

CV upload → extract → structured fields **plus a coaching report** (domain/job inference, format critique, experience comments, recommendations) → download that report as **PDF** or **Word**. Course demo for **CO3065 — Advanced Software Engineering** (HCMUT).

Legacy auth/CV HTTP contracts from the old Spring app are preserved. The implementation is a pnpm/turbo monorepo shaped like a small Fleet-style TypeScript system (`apps/api` Hono layers, `apps/web` Next.js App Router, `apps/api/src/contracts` Zod wire contracts).

## Quick start

Requires **Node ≥ 20** and **pnpm 10.x**. No Docker.

```bash
pnpm install
cp .env.example .env   # fill DATABASE_URL + S3_* (required to boot API)
pnpm dev
```

- API: [http://localhost:8090](http://localhost:8090) — `GET /api/health` → `{ error_code: 0, message: "OK", data: { ok: true } }`
- Web: [http://localhost:3000](http://localhost:3000)

```bash
pnpm --filter @aicoach/api test
pnpm typecheck
```

Register at `/auth/register`, then `/dashboard/upload` a PDF/DOCX/DOC. Extract is accepted immediately (`Task accepted`); the processing page polls `GET /api/cv/data/{file_id}` until analysis + `coaching_report` exist. On `/dashboard/results`, read the coaching sections and download **PDF** / **Word** exports of the report (not a re-download of the original CV).

## Layout

```
apps/api          Hono API, port 8090
  src/platform/   http, auth, db, storage, queue, llm, extract, coaching-report, export-report, cv-text
  src/modules/    users | cv | advice | system   (routes → handlers → service → repo)
apps/web          Next.js App Router, port 3000
apps/api/src/contracts   Zod wire schemas (API)
apps/web/src/types       Client TypeScript wire types
```

Handlers own the Hono context `c`. Services take plain arguments. Repos own SQL. The composition root (`platform/composition.ts`) constructs repos once.

## Main product flow

1. Upload CV → `POST /api/cv/upload`
2. Queue extract → `POST /api/cv/extract/{file_id}` (`Task accepted`)
3. Worker: extract text → structured fields → **coaching report** (stub or Gemini)
4. Read results → `GET /api/cv/data/{file_id}` includes `coaching_report`
5. Export coaching report → `GET /api/cv/export/{file_id}/pdf` or `.../docx` (authenticated binary download)
6. Personalization → auto `advice_snapshot` per analyze; pin recommendations; account-level diff at `/dashboard/advice`

### Advice (cá nhân hoá)

| Method | Path | Ý nghĩa |
| --- | --- | --- |
| GET | `/api/advice/snapshots` | Timeline snapshot lời khuyên theo account |
| GET | `/api/advice/diff` | So sánh 2 snapshot (mặc định latest vs previous) |
| GET/POST/PATCH/DELETE | `/api/advice/pins` | Sổ tay ghim thủ công |

Extract text được `cleanCvText` (học từ ATS) trước khi LLM/stub; báo cáo stub/LLM mặc định **tiếng Việt**.

## Infra (required cloud config)

| Concern | Required | Notes |
| --- | --- | --- |
| DB | `DATABASE_URL` (Neon/Postgres) | No PGlite fallback at runtime |
| Files | `S3_ENDPOINT` + `S3_ACCESS_KEY_ID` + `S3_SECRET_ACCESS_KEY` + `S3_BUCKET` | Cloudflare R2 free tier recommended |
| Jobs | in-process `setImmediate` queue | No Redis/RabbitMQ |
| LLM | Pollinations by default (no key) | `LLM_PROVIDER=stub` or optional `GEMINI_API_KEYS` |
| Export | PDF (`pdf-lib`) + Word (`docx`) | Coaching report, not original CV |

API **refuses to boot** if `DATABASE_URL` or any `S3_*` is missing. Set `JWT_SECRET` when sharing the process.

## HTTP envelope

Every response:

```json
{ "error_code": 0, "message": "OK", "data": {} }
```

Auth: `POST /api/users/register`, `POST /api/users/login` → `{ token, email }`. Bearer JWT, subject = email.

CV: `POST /api/cv/upload` (multipart `file`, 201), `POST /api/cv/extract/{file_id}` (`Task accepted`), `GET /api/cv/supported-types`, `GET /api/cv/data/{file_id}` (includes `coaching_report`), `GET /api/cv/list`, `GET /api/cv/export/{file_id}/pdf`, `GET /api/cv/export/{file_id}/docx`.

`coaching_report` shape:

```json
{
  "domain_inference": { "domain": "...", "job_titles": ["..."], "summary": "..." },
  "format_critique": { "summary": "...", "findings": ["..."] },
  "experience_comments": { "summary": "...", "strengths": ["..."], "gaps": ["..."] },
  "recommendations": ["..."]
}
```

## Docs

- [C4 context + container](documents/architecture/c4.md)
- [Logical modules / layers](documents/architecture/logical.md)
