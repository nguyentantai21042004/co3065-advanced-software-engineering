# Tài liệu AI Coach

Bộ tài liệu phục vụ **demo môn CO3065** và thuyết trình (ưu tiên đọc phần nổi bật trước khi đào code).

## Nổi bật — logic lõi (đọc trước khi present)

| Tài liệu                                                   | Nội dung                                                        | Khi nào mở               |
| ---------------------------------------------------------- | --------------------------------------------------------------- | ------------------------ |
| [core-logic.md](core-logic.md)                             | Bài toán, 3 trụ cột, luồng E2E, lớp API, điểm nói trước thầy cô | Slide tổng / kiến trúc   |
| [extract-pipeline.md](extract-pipeline.md)                 | Upload → queue → extract → clean → LLM/stub → DB                | Slide “xử lý CV”         |
| [coaching-personalization.md](coaching-personalization.md) | Coaching report 4 mục, export, snapshot / diff / pin            | Slide “giá trị sản phẩm” |

## Kiến trúc hệ thống

| Tài liệu                                           | Nội dung                                                 |
| -------------------------------------------------- | -------------------------------------------------------- |
| [architecture/c4.md](architecture/c4.md)           | C4 context + container, ranh giới, sequence mức hệ thống |
| [architecture/logical.md](architecture/logical.md) | Module, lớp routes→repo, bảng dữ liệu, map màn hình      |

## Vận hành / credentials

| Tài liệu                                             | Nội dung                                     |
| ---------------------------------------------------- | -------------------------------------------- |
| [external-dependencies.md](external-dependencies.md) | Neon, R2, LLM, JWT — cách lấy và biến `.env` |

## Gợi ý thứ tự thuyết trình ~8–10 phút

1. **Sản phẩm** (1 phút) — README phần giá trị + demo login account thử nghiệm.
2. **Luồng người dùng** (1 phút) — upload → processing → results → export → advice ([core-logic.md](core-logic.md) §3).
3. **Kiến trúc** (2 phút) — C4 container + tách lớp handlers/service/repo ([architecture/c4.md](architecture/c4.md)).
4. **Pipeline extract** (2 phút) — async job, cleanCvText, LLM + fallback ([extract-pipeline.md](extract-pipeline.md)).
5. **Coaching & cá nhân hoá** (2 phút) — 4 mục report, snapshot, diff ([coaching-personalization.md](coaching-personalization.md)).
6. **Infra & demo sống** (1 phút) — Neon + R2 bắt buộc, account seed, Q&A trỏ bảng “map câu hỏi → file”.
