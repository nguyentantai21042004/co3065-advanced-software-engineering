
# Checklist Code Core Flow (Cho Project 8 Tiếng)

Mục tiêu: Tạo ra 2 luồng xử lý chính chạy được

- **Luồng 1:** Nhận file CV → Trích xuất text → Gọi Gemini → Trả về JSON Profile & Assessment.
- **Luồng 2:** Nhận Assessment & Mục tiêu → Gọi Gemini → Trả về JSON Kế hoạch SMART.

---

## Giai đoạn 1: Chuẩn Bị Môi Trường & Dependencies

- [ ] **Khởi tạo Project:** Dùng [start.spring.io](https://start.spring.io) để tạo một project Spring Boot.
- [ ] **Thêm Dependencies vào `pom.xml`:** Copy chính xác các thư viện đã được liệt kê trong file `3-stack.md`:

  - `spring-boot-starter-web`
  - `spring-cloud-starter-stream-rabbit` (hoặc **Kafka** – tuỳ nhóm bạn chọn)
  - `pdfbox` và `tika-core` để xử lý file
  - `generativeai` (SDK của Google)
  - `jackson-databind` để xử lý JSON

- [ ] **Cấu hình API Key:** Lưu Gemini API Key vào `application.properties` hoặc `application.yml`. **Không hardcode trong Java.**

  **Ví dụ:**
  ```properties
  gemini.api.key=YOUR_API_KEY
  ```

---

## Giai đoạn 2: Code PoC Các Thành Phần Độc Lập

Đây là các khối code bạn có thể viết và kiểm thử riêng lẻ trước khi tích hợp.

### PoC 1: Module Trích Xuất Text (CV I/O)

- [ ] Viết class `FileExtractorService`.
- [ ] Implement hàm `String extractTextFromPdf(File pdfFile)` sử dụng Apache PDFBox.
- [ ] Implement hàm `String extractTextFromDocx(File docxFile)` sử dụng Apache Tika.
- [ ] Viết một hàm main hoặc test để thử ném một file CV mẫu vào, kiểm tra có in ra được text thuần hay chưa.

### PoC 2: Module Gọi Gemini (AI Processor)

- [ ] Tạo các class Java (POJO) tương ứng với các JSON Schema đã định nghĩa:  
  `UserProfile`, `InitialAssessment`, `CoreSkill`, `SmartActionPlan`  
  _(Jackson tự động map JSON trả về thành object, tiện lợi)_

- [ ] Viết class `GeminiService`.
- [ ] Viết hàm quan trọng nhất:  
  ```java
  JSONObject getStructuredProfileAndAssessment(String cvRawText)
  ```

  **Gợi ý triển khai:**
  - Khởi tạo GenerativeModel.
  - Xây dựng prompt theo đúng SYSTEM INSTRUCTION trong `3-stack.md`.
  - Sử dụng `response_schema` hoặc Tool Calling của Gemini SDK để ép Gemini trả về JSON chuẩn:  
    ```json
    { "profile": { ... }, "assessment": { ... } }
    ```
  - Dùng một đoạn CV mẫu để gọi hàm này, in kết quả, kiểm tra cấu trúc JSON có chuẩn không.

- [ ] Viết hàm tương tự:
  ```java
  JSONObject getSmartActionPlan(InitialAssessment assessment, String userGoal)
  ```
  - Nhận vào `InitialAssessment` (tạo ở bước trước) và `userGoal` (text mục tiêu của người dùng)
  - Xây dựng prompt phù hợp cho việc tạo kế hoạch SMART
  - Ép Gemini trả về JSON theo schema của SMART Action Plan

---

## Giai đoạn 3: Tích Hợp Luồng Chảy qua Message Queue

Đây là lúc kết nối các PoC ở trên lại theo kiến trúc **EDA**.

### PoC 3: Mô phỏng Queue

- [ ] **Viết Publisher:**  
  Tạo một `RestController` đơn giản với endpoint `/upload`  
  _Flow:_
    - Nhận vào một file (`MultipartFile`)
    - Không xử lý file ở đây. Chỉ cần lưu file tạm (hoặc lên S3 nếu có thời gian), lấy đường dẫn.
    - Gửi một message `CV_UPLOADED` chứa
      ```json
      { "userId": "...", "filePath": "..." }
      ```
      lên Message Queue

- [ ] **Viết Subscriber (Listener) đầu tiên:**  
  Tạo một class lắng nghe message `CV_UPLOADED`.
  _Flow khi nhận message:_
    1. Đọc file từ `filePath`
    2. Gọi `FileExtractorService` (PoC 1) để lấy raw text
    3. Gọi `GeminiService` (PoC 2) để lấy JSON profile và assessment
    4. In kết quả JSON ra console (8 tiếng, chưa cần lưu DB)
    5. Gửi tiếp một message `PROFILE_READY` lên queue

- [ ] **Hoàn thiện luồng thứ hai:**

  - **Publisher thứ hai:**  
    Tạo một endpoint `/define-goal`  
    _Input:_ `{ "userId": "...", "goalText": "..." }`  
    Gửi một message `GOAL_DEFINED` lên queue.

  - **Subscriber (Listener) thứ hai:**  
    Tạo một class lắng nghe message `GOAL_DEFINED`.

    _Khi nhận message:_
    1. (Giả lập) Lấy `InitialAssessment` đã được tạo từ trước (có thể lưu tạm vào một `Map` trong bộ nhớ với key là `userId`)
    2. Gọi `getSmartActionPlan` của `GeminiService` với assessment và goalText
    3. In kết quả JSON kế hoạch SMART ra console
