# AI Coach

Demo fullstack cho môn **CO3065 — Advanced Software Engineering** (HCMUT).

Sản phẩm giúp ứng viên / sinh viên **đưa CV lên một lần**, nhận lại phân tích có cấu trúc và một **báo cáo coaching** dễ đọc (lĩnh vực & vị trí phù hợp, góp ý format, nhận xét kinh nghiệm, khuyến nghị việc cần làm tiếp), rồi **tải báo cáo đó ra PDF hoặc Word**. Hệ thống còn giữ lịch sử lời khuyên theo tài khoản để so sánh tiến triển theo thời gian.

Đây không phải cổng ATS tuyển dụng. Trọng tâm là **cố vấn nghề nghiệp cá nhân** trên dữ liệu CV của chính người dùng.

---

## Giá trị mang lại

| Nhu cầu                              | AI Coach trả lời thế nào                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| “CV của mình đang kể chuyện gì?”     | Trích text → làm sạch → tách thông tin cơ bản, học vấn, kinh nghiệm, kỹ năng |
| “Nên ứng tuyển hướng nào?”           | `domain_inference`: lĩnh vực, gợi ý job title, tóm tắt                       |
| “Format / nội dung còn yếu chỗ nào?” | `format_critique` + `experience_comments` (điểm mạnh / khoảng trống)         |
| “Làm gì tiếp theo?”                  | Danh sách `recommendations`; có thể ghim vào sổ tay                          |
| “Lần này khác lần trước ra sao?”     | Snapshot tự tạo sau mỗi lần analyze + diff theo tài khoản                    |
| “Gửi mentor / giữ bản cứng?”         | Xuất **báo cáo coaching** PDF / Word (không phải tải lại file CV gốc)        |

Ngôn ngữ báo cáo mặc định: **tiếng Việt**.

---

## Ai dùng / không dùng

**Phù hợp**

- Sinh viên / ứng viên muốn feedback nhanh trên CV PDF hoặc DOCX.
- Demo kiến trúc fullstack (web + API + DB + object storage + LLM) cho môn ASE.
- Mentor muốn xem báo cáo coaching đã export.

**Ngoài scope demo**

- Matching ứng viên ↔ tin tuyển dụng hàng loạt.
- OCR CV scan ảnh (text quá ít sẽ không analyze chất lượng).
- Multi-tenant doanh nghiệp / RBAC phức tạp.
- Queue phân tán, worker tách process.

---

## Hành trình người dùng

1. Đăng ký / đăng nhập.
2. Upload CV (PDF, DOCX, DOC).
3. Hệ thống xếp hàng trích xuất ngay (`Task accepted`); màn hình processing poll đến khi có kết quả.
4. Xem báo cáo coaching trên `/dashboard/results`.
5. Tải PDF hoặc Word của báo cáo.
6. (Tuỳ chọn) Vào `/dashboard/advice` để xem timeline snapshot, diff, ghim khuyến nghị.

```text
Upload CV → Extract text → Structured fields + Coaching report
         → Xem trên web → Export PDF/Word
         → Snapshot / pin / diff theo account
```

---

## Chạy local

Cần **Node ≥ 20** và **pnpm 10.x**. Không cần Docker. API **bắt buộc** có Neon (`DATABASE_URL`) và Cloudflare R2 (`S3_*`); thiếu thì không boot.

```bash
pnpm install
cp .env.example .env   # điền DATABASE_URL + S3_* (xem documents/external-dependencies.md)
pnpm dev
```

- Web: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:8090](http://localhost:8090) — `GET /api/health` → `{ "error_code": 0, "message": "OK", "data": { "ok": true } }`

**Account thử nghiệm** (đã seed trên Neon, dùng login UI):

| Trường       | Giá trị                     |
| ------------ | --------------------------- |
| Email        | `nguyendinhkhanh@gmail.com` |
| Password     | `Demo@123456`               |
| Tên hiển thị | Nguyễn Đình Khánh           |

Vào [http://localhost:3000/auth/login](http://localhost:3000/auth/login) với cặp trên để test dashboard.

```bash
pnpm --filter @aicoach/api test
pnpm typecheck
```

Chi tiết lấy Neon / R2 / LLM: [documents/external-dependencies.md](documents/external-dependencies.md).

---

## Tính năng theo màn hình

| Màn hình           | Việc người dùng làm                                    |
| ------------------ | ------------------------------------------------------ |
| Landing `/`        | Hiểu sản phẩm, vào đăng ký hoặc upload nếu đã login    |
| Auth               | Đăng ký, đăng nhập (JWT lưu phía trình duyệt)          |
| Upload             | Chọn file CV, gửi lên, kích hoạt extract               |
| Processing         | Theo dõi tới khi có `coaching_report`                  |
| Results            | Đọc các mục coaching, tải PDF / Word                   |
| History            | Danh sách CV đã upload                                 |
| Advice             | Timeline snapshot, so sánh hai lần analyze, sổ tay pin |
| Profile / Settings | Thông tin tài khoản / tuỳ chọn UI                      |

---

## Kiến trúc (ngắn)

Monorepo pnpm / turbo, hai app:

| Thành phần             | Công nghệ          | Vai trò trong sản phẩm                              |
| ---------------------- | ------------------ | --------------------------------------------------- |
| `apps/web`             | Next.js App Router | Toàn bộ trải nghiệm người dùng                      |
| `apps/api`             | Hono trên Node     | Auth, CV pipeline, advice, export                   |
| Neon                   | Postgres           | User, metadata, kết quả analyze, snapshot / pin     |
| Cloudflare R2          | S3-compatible      | Bytes CV gốc                                        |
| Pollinations (default) | LLM HTTP           | Sinh structured + coaching; có thể Gemini hoặc stub |

Một process API vừa nhận HTTP vừa chạy worker extract / analyze (queue in-process). Không Redis / RabbitMQ trong demo.

```text
apps/api
  src/platform/     auth, db, storage, queue, llm, extract, coaching-report, export-report, …
  src/modules/      users | cv | advice | system   (routes → handlers → service → repo)
  src/contracts/    Zod wire (snake_case)
apps/web
  src/app/          landing, auth, dashboard/*
  src/types/wire.ts type mirror phía client
```

Handlers sở hữu Hono context. Service nhận argument thuần và giữ luật nghiệp vụ. Repo chỉ SQL. Composition root dựng repo một lần.

Sơ đồ C4 và lớp chi tiết:

- [documents/architecture/c4.md](documents/architecture/c4.md) — context + container + luồng nghiệp vụ
- [documents/architecture/logical.md](documents/architecture/logical.md) — module, async extract, authz, bảng dữ liệu

---

## Infra bắt buộc

| Concern | Cấu hình                                                                  | Ghi chú                                            |
| ------- | ------------------------------------------------------------------------- | -------------------------------------------------- |
| DB      | `DATABASE_URL`                                                            | Neon / Postgres; không fallback PGlite lúc runtime |
| File    | `S3_ENDPOINT` + `S3_ACCESS_KEY_ID` + `S3_SECRET_ACCESS_KEY` + `S3_BUCKET` | R2 free tier                                       |
| Job     | in-process `setImmediate`                                                 | Đủ demo single-node                                |
| LLM     | Pollinations mặc định (không key)                                         | `LLM_PROVIDER=stub` hoặc `GEMINI_API_KEYS`         |
| Export  | `pdf-lib` + `docx`                                                        | Xuất **báo cáo coaching**, không xuất lại CV gốc   |
| Auth    | `JWT_SECRET`                                                              | Đặt khi share / expose mạng                        |

---

## API bề mặt (cho tích hợp / demo)

Envelope mọi response:

```json
{ "error_code": 0, "message": "OK", "data": {} }
```

**Auth:** `POST /api/users/register`, `POST /api/users/login` → `{ token, email }`. Bearer JWT, subject = email.

**CV:**

| Method | Path                            | Ý nghĩa                                              |
| ------ | ------------------------------- | ---------------------------------------------------- |
| POST   | `/api/cv/upload`                | Multipart `file`, 201                                |
| POST   | `/api/cv/extract/{file_id}`     | Xếp hàng; `Task accepted`                            |
| GET    | `/api/cv/data/{file_id}`        | Extraction + analysis; có `coaching_report` khi xong |
| GET    | `/api/cv/list`                  | Lịch sử file của user                                |
| GET    | `/api/cv/supported-types`       | MIME / extension hỗ trợ                              |
| GET    | `/api/cv/export/{file_id}/pdf`  | Binary báo cáo coaching                              |
| GET    | `/api/cv/export/{file_id}/docx` | Binary báo cáo coaching                              |

**Advice (cá nhân hoá):**

| Method                | Path                    | Ý nghĩa                                          |
| --------------------- | ----------------------- | ------------------------------------------------ |
| GET                   | `/api/advice/snapshots` | Timeline snapshot theo account                   |
| GET                   | `/api/advice/diff`      | So sánh 2 snapshot (mặc định latest vs previous) |
| GET/POST/PATCH/DELETE | `/api/advice/pins`      | Sổ tay ghim thủ công                             |

Hình dạng `coaching_report`:

```json
{
  "domain_inference": { "domain": "...", "job_titles": ["..."], "summary": "..." },
  "format_critique": { "summary": "...", "findings": ["..."] },
  "experience_comments": { "summary": "...", "strengths": ["..."], "gaps": ["..."] },
  "recommendations": ["..."]
}
```

---

## Tài liệu

Mục lục đầy đủ + gợi ý thứ tự thuyết trình: [documents/README.md](documents/README.md).

**Nổi bật (logic lõi — ưu tiên khi present):**

- [Logic lõi hệ thống](documents/core-logic.md) — bài toán, 3 trụ cột, luồng E2E, điểm nói trước thầy cô
- [Pipeline extract & analyze](documents/extract-pipeline.md) — upload → queue → clean → LLM/stub → DB
- [Coaching & cá nhân hoá](documents/coaching-personalization.md) — 4 mục report, export, snapshot / diff / pin

**Kiến trúc & vận hành:**

- [C4 context + container](documents/architecture/c4.md)
- [Kiến trúc logic / module](documents/architecture/logical.md)
- [Phụ thuộc bên ngoài & credentials](documents/external-dependencies.md)
