# Phụ thuộc bên ngoài

Tài liệu liệt kê các dịch vụ cloud mà API cần khi chạy thật. Runtime không còn fallback PGlite hay ghi file local lúc boot: thiếu `DATABASE_URL` hoặc bất kỳ biến `S3_*` thì process thoát ngay (`loadConfig` trong `apps/api/src/config.ts`).

Secrets nằm ở `.env` (root) và `apps/api/.env.local`. Cả hai đã có trong `.gitignore`, không commit.

API load env theo thứ tự (script `dev` / `start` của `@aicoach/api`):

1. `../../.env` (root monorepo)
2. `apps/api/.env`
3. `apps/api/.env.local`

---

## Tóm tắt

| Vai trò        | Dịch vụ                 | Biến môi trường                                                                     | Bắt buộc?          | Ghi chú                                    |
| -------------- | ----------------------- | ----------------------------------------------------------------------------------- | ------------------ | ------------------------------------------ |
| Database       | Neon (Postgres)         | `DATABASE_URL`                                                                      | Có                 | Schema dùng `JSONB`, `UUID`, `TIMESTAMPTZ` |
| Object storage | Cloudflare R2 (S3 API)  | `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION` | Có                 | Bucket: `aicoach-cv-files`                 |
| LLM            | Pollinations (mặc định) | `LLM_PROVIDER`, `POLLINATIONS_URL`, `POLLINATIONS_MODEL`                            | Không (có default) | Không cần API key                          |
| LLM (tuỳ chọn) | Google Gemini           | `GEMINI_API_KEYS`, `LLM_PROVIDER=gemini`                                            | Không              | Nhiều key cách nhau bằng dấu phẩy          |
| Auth JWT       | secret local            | `JWT_SECRET`                                                                        | Nên đặt khi share  | Default chỉ dùng local                     |
| Web → API      | URL API                 | `NEXT_PUBLIC_API_URL`                                                               | Có cho web         | Ví dụ `http://localhost:8090/api`          |

---

## 1. Neon — Postgres managed

### App dùng thế nào

- `apps/api/src/platform/db.ts` mở kết nối qua driver `pg` với `DATABASE_URL`.
- Schema bootstrap bằng SQL thuần: `users`, `uploaded_file`, `extraction_result`, `cv_analysis_result`, `advice_snapshot`, `advice_pin`, …
- Nhiều cột là `JSONB` (CV structured fields, coaching report, pin payload).

### Cách lấy connection string

1. Vào [https://console.neon.tech](https://console.neon.tech) → đăng nhập.
2. Tạo project (region gần user, ví dụ Singapore / APAC nếu có).
3. Mở **Dashboard → Connection details**.
4. Copy URI dạng pooled (khuyến nghị cho API Node ngắn-sống):

   ```text
   postgresql://USER:PASSWORD@HOST-pooler.../neondb?sslmode=require
   ```

5. Dán vào `.env`: `DATABASE_URL=...`.

### Lưu ý kỹ thuật

- Neon thường gắn thêm `channel_binding=require`. Driver `node-pg` / một số client TLS có thể lỗi với tham số này. Trong `.env` local chỉ giữ `sslmode=require`.
- Dùng **pooler** (`-pooler` trong hostname) cho API HTTP. Connection trực tiếp phù hợp migration dài / admin.
- Free tier Neon đủ demo môn học. Rotate password nếu URI từng lộ ra chat hay screenshot.

### Kiểm tra nhanh

```bash
# từ apps/api, sau khi có .env ở root
node --import tsx --env-file=../../.env -e "
  import pg from 'pg';
  const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  console.log(await c.query('select current_database(), current_user'));
  await c.end();
"
```

---

## 2. Cloudflare R2 — object storage (S3-compatible)

### App dùng thế nào

- `apps/api/src/platform/storage.ts` dùng `@aws-sdk/client-s3` với endpoint R2.
- Lưu file CV upload (PDF / DOCX / DOC) theo `storage_path` trong bảng `uploaded_file`.
- Runtime không ghi disk local. Thiếu `S3_*` là không boot.

### Tài nguyên trên account demo

| Mục        | Giá trị                                                             |
| ---------- | ------------------------------------------------------------------- |
| Account ID | `9cbbc616008dec4e4665e5f4fd5de417`                                  |
| Bucket     | `aicoach-cv-files`                                                  |
| Endpoint   | `https://9cbbc616008dec4e4665e5f4fd5de417.r2.cloudflarestorage.com` |
| Token name | Account API token `aicoach-cv-files`                                |
| Quyền      | Object Read & Write, chỉ bucket `aicoach-cv-files`                  |

### Cách tạo S3 Access Key (làm lại khi rotate)

Wrangler không có lệnh tạo Access Key / Secret cho S3 API. Tạo token R2 trên Dashboard:

1. Đăng nhập Cloudflare → [R2 Overview](https://dash.cloudflare.com/?to=/:account/r2/overview).
2. **Account Details → API Tokens → Manage**.
3. **Create Account API token** (khuyến nghị cho app chạy lâu; không gắn life-cycle user).
4. Chọn:
   - Permission: **Object Read & Write**
   - Buckets: **Apply to specific buckets only** → `aicoach-cv-files`
   - TTL: Forever (hoặc có hạn nếu muốn rotate)
5. Sau khi Create, copy **một lần duy nhất**:
   - **Access Key ID** → `S3_ACCESS_KEY_ID`
   - **Secret Access Key** → `S3_SECRET_ACCESS_KEY`
6. Endpoint cố định theo account:

   ```text
   S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
   S3_BUCKET=aicoach-cv-files
   S3_REGION=auto
   ```

### Bucket (nếu cần tạo mới)

```bash
wrangler login
wrangler r2 bucket create aicoach-cv-files
wrangler r2 bucket list
```

OAuth Wrangler đủ để quản lý bucket / object, nhưng không thay thế S3 Access Key mà AWS SDK cần.

### Mapping biến

```bash
S3_ENDPOINT=https://9cbbc616008dec4e4665e5f4fd5de417.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=...        # từ trang success của R2 API token
S3_SECRET_ACCESS_KEY=...    # chỉ hiện một lần
S3_BUCKET=aicoach-cv-files
S3_REGION=auto
```

---

## 3. LLM — Pollinations (mặc định) / Gemini (tuỳ chọn)

### Pollinations

- Default khi không set `LLM_PROVIDER` và không có `GEMINI_API_KEYS`.
- Endpoint OpenAI-compatible: `https://text.pollinations.ai/openai`.
- Không cần key cho demo. Có thể bị rate-limit / queue (429).
- Biến:

  ```bash
  LLM_PROVIDER=pollinations
  POLLINATIONS_URL=https://text.pollinations.ai/openai
  POLLINATIONS_MODEL=openai
  ```

### Gemini (tuỳ chọn)

1. Lấy key tại [Google AI Studio](https://aistudio.google.com/apikey).
2. Đặt:

   ```bash
   LLM_PROVIDER=gemini
   GEMINI_API_KEYS=key1,key2
   ```

3. Không muốn gọi mạng: `LLM_PROVIDER=stub` (báo cáo coaching deterministic, tiếng Việt).

Logic chọn provider: `apps/api/src/config.ts` + client trong `apps/api/src/platform/llm.ts`.

---

## 4. JWT và Web

```bash
JWT_SECRET=<chuỗi ngẫu nhiên dài>   # openssl rand -hex 24
NEXT_PUBLIC_API_URL=http://localhost:8090/api
```

- Web (Next) gọi API qua `NEXT_PUBLIC_API_URL`.
- JWT sign / verify trong `apps/api/src/platform/auth.ts`. Đừng để default `dev-insecure-jwt-secret` nếu expose ra mạng.

---

## Checklist setup máy mới

1. `pnpm install`
2. Secrets:
   - Có sẵn: dùng `.env` local (đã gitignore).
   - Máy khác: `cp .env.example .env` rồi điền Neon URI + R2 keys theo các mục trên.
3. `pnpm dev` → API `:8090`, Web `:3000`.
4. `GET http://localhost:8090/api/health` phải `error_code: 0`.
5. Register → upload CV → chờ extract / analyze.

Mẫu biến (không secrets) nằm ở [`.env.example`](../.env.example).

---

## Bảo mật

- `.env` / `.env.local` không đưa vào git (đã ignore).
- Neon password từng lộ trong chat → nên rotate trên Neon Console khi xong demo hoặc trước khi public repo.
- R2 Secret Access Key chỉ hiện một lần trên Dashboard. Mất thì tạo token mới và revoke token cũ tại **R2 → API Tokens**.
- Không paste Access Key / Neon URI vào issue, PR, hay commit message.
