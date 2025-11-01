# Luồng Nghiệp Vụ Tối Ưu Hóa (Sử dụng EDA)

Việc sử dụng Queue (chúng ta sẽ gọi là **Message Broker/Event Bus**) giúp nhóm 7 người dễ dàng chia nhỏ thành các **Service/Listener độc lập**.

## Tổng quan Kiến trúc

| Bước | Mô tả Hành động (Sync/Async) | Vai trò của AI & Service | Mục đích Tối ưu hóa |
|------|------------------------------|-------------------------|---------------------|
| 1 | **Upload & Publish** (Sync) | Người dùng tải CV lên. Frontend/Gateway Service xác thực file và lưu trữ (ví dụ: `storage://...`).<br/>**Publish một Event**: `CV_UPLOADED` (Payload: `user_id`, `file_path`). | Phản hồi nhanh cho người dùng. Tách biệt I/O và xử lý nặng. |
| 2 | **Core AI Processing** (Async) | Một Service Listener chuyên dụng đăng ký nhận Event `CV_UPLOADED`.<br/>**Action 1** (Thư viện): Extract Raw Text (dùng PDFBox/Tika).<br/>**Action 2** (Gemini API): Gửi Raw Text cho AI để nhận 2 Output Structured JSON cùng lúc (Sử dụng Tool Calling):<br/>1. **User Profile** (dữ liệu cá nhân)<br/>2. **Initial Assessment** (đánh giá sơ bộ). | **Tối ưu then chốt**: Gom 3 tác vụ (Extract, Profile, Assessment) thành một Listener duy nhất. Giảm độ trễ tổng thể và số lần gọi Queue/API. |
| 3 | **Persist & Trigger** (Async/Sync) | Service ở bước 2 lưu 2 Structured JSON vào Database.<br/>Service này **Publish Event**: `PROFILE_READY` (Payload: `user_id`).<br/>Frontend nhận thông tin này qua polling/websocket để cập nhật UI. | Đảm bảo dữ liệu được lưu trữ nhất quán (Consistent). |
| 4 | **Confirmation & Goal** (Sync) | Người dùng xem Profile & Initial Assessment, Bổ sung/Xác nhận. Sau đó, nhập Định hướng/Mục tiêu (Raw Text).<br/>**Action**: Frontend/Gateway Service nhận và lưu Mục tiêu. **Publish Event**: `GOAL_DEFINED` (Payload: `user_id`, `goal_text`). | Đây là điểm chạm quan trọng. Đảm bảo UI mượt mà. |
| 5 | **SMART Action Generation** (Async) | Một Service Listener khác đăng ký nhận Event `GOAL_DEFINED`.<br/>**Action** (Gemini API): Lấy Assessment từ DB + Goal từ Event. Gửi cho AI để tạo ra **SMART Action Plan** (Structured JSON). Lưu Plan vào DB. | Tách biệt hoàn toàn việc tạo Plan khỏi luồng chính. Sử dụng dữ liệu đầu vào đã được cấu trúc hóa để tạo ra đầu ra chất lượng cao. |
| 6 | **Notification** (Async) | Service ở bước 5 **Publish Event**: `PLAN_READY`.<br/>Một Notification Service đăng ký nhận Event này và gửi thông báo cho người dùng (Email/In-app). | **Nguyên tắc EDA**: Tách Core Logic khỏi các tác vụ phụ trợ (như gửi mail). |

## Chi tiết từng bước

### 1. Upload & Publish (Sync)
- **Input**: CV file từ người dùng
- **Process**: 
  - Xác thực file
  - Lưu trữ file
  - Publish event `CV_UPLOADED`
- **Output**: Phản hồi nhanh cho người dùng

### 2. Core AI Processing (Async)
- **Input**: Event `CV_UPLOADED`
- **Process**:
  - Extract text từ CV (PDFBox/Tika)
  - Gửi text đến Gemini API
  - Nhận 2 structured JSON: User Profile + Initial Assessment
- **Output**: Structured data được lưu vào database

### 3. Persist & Trigger (Async/Sync)
- **Input**: Structured JSON từ bước 2
- **Process**:
  - Lưu data vào database
  - Publish event `PROFILE_READY`
  - Cập nhật UI qua websocket/polling
- **Output**: UI được cập nhật với profile và assessment

### 4. Confirmation & Goal (Sync)
- **Input**: User goals từ UI
- **Process**:
  - Nhận và validate goals
  - Lưu goals vào database
  - Publish event `GOAL_DEFINED`
- **Output**: Goals được lưu trữ và event được publish

### 5. SMART Action Generation (Async)
- **Input**: Event `GOAL_DEFINED` + Assessment data từ DB
- **Process**:
  - Lấy assessment và goals từ database
  - Gửi đến Gemini API để tạo SMART action plan
  - Lưu action plan vào database
- **Output**: SMART action plan được tạo và lưu trữ

### 6. Notification (Async)
- **Input**: Event `PLAN_READY`
- **Process**:
  - Nhận event từ service trước
  - Gửi notification (email/in-app) cho user
- **Output**: User được thông báo về action plan hoàn thành

## Lợi ích của kiến trúc EDA

- **Scalability**: Mỗi service có thể scale độc lập
- **Maintainability**: Code được tách biệt rõ ràng theo domain
- **Reliability**: Event-driven architecture giúp system resilient hơn
- **Team Collaboration**: 7 người có thể làm việc song song trên các service khác nhau