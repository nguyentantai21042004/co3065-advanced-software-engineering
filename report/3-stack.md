# Technical Stack & Implementation Guide

Rất tuyệt! Việc chuẩn bị **JSON Schema** và **Prompt chi tiết** cùng với việc code flow sẵn là chiến lược tối ưu nhất cho project 12 tiếng này. Đây là các tài nguyên cốt lõi mà nhóm bạn, đặc biệt là **Đội Xử lý Hồ sơ & Đánh giá**, cần phải hoàn thiện trong giai đoạn "Tìm hiểu trước".

## 1. 📝 Cấu Trúc JSON Schema (Output từ Gemini)

Ở **Bước 2** (Core AI Processing), Gemini cần trả về **HAI khối thông tin cấu trúc chính**: Thông tin Cá nhân (Profile) và Đánh giá Kỹ năng Sơ bộ (Initial Assessment).

### A. JSON Schema cho User Profile

Schema này dùng để trích xuất thông tin cơ bản để hiển thị cho người dùng xác nhận.

```json
{
  "type": "object",
  "properties": {
    "full_name": {
      "type": "string", 
      "description": "Họ và tên đầy đủ của người nộp hồ sơ."
    },
    "title": {
      "type": "string", 
      "description": "Vị trí/chức danh công việc hiện tại hoặc mong muốn."
    },
    "years_of_experience": {
      "type": "integer", 
      "description": "Tổng số năm kinh nghiệm làm việc liên quan."
    },
    "primary_contact": {
      "type": "string", 
      "description": "Email hoặc số điện thoại chính."
    },
    "educational_level": {
      "type": "string", 
      "description": "Trình độ học vấn cao nhất (ví dụ: Thạc sĩ, Cử nhân)."
    },
    "current_status": {
      "type": "string", 
      "enum": ["Employed", "Student", "Unemployed"], 
      "description": "Trạng thái công việc/học tập hiện tại."
    }
  },
  "required": ["full_name", "title", "years_of_experience"]
}
```

### B. JSON Schema cho Initial Assessment (Đánh giá Sơ bộ)

Schema này là nền tảng cho việc thiết lập mục tiêu sau này, tập trung vào kỹ năng chuyên môn.

```json
{
  "type": "object",
  "properties": {
    "overall_summary": {
      "type": "string", 
      "description": "Tóm tắt ngắn gọn 2-3 câu về điểm mạnh và kinh nghiệm nổi bật nhất của ứng viên."
    },
    "core_skills": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "skill_name": {
            "type": "string", 
            "description": "Tên kỹ năng cốt lõi (ví dụ: Java, Spring Boot, AWS, Project Management)."
          },
          "proficiency_level": {
            "type": "string", 
            "enum": ["Novice", "Intermediate", "Advanced", "Expert"], 
            "description": "Mức độ thành thạo ước tính."
          },
          "evidence": {
            "type": "string", 
            "description": "Dẫn chứng từ CV hỗ trợ cho mức độ thành thạo này."
          }
        },
        "required": ["skill_name", "proficiency_level"]
      }
    },
    "immediate_advice": {
      "type": "string", 
      "description": "Một lời khuyên chuyên môn ngắn gọn để ứng viên cải thiện trong tuần đầu tiên (tối đa 50 từ)."
    }
  },
  "required": ["overall_summary", "core_skills"]
}
```

## 2. 🗣️ Gợi ý Prompt Tối ưu cho Gemini (Bước 2)

Sử dụng kỹ thuật **System Instruction** và yêu cầu **multi-part structured output** để đảm bảo Gemini thực hiện cả hai tác vụ (Profile và Assessment) trong một lần gọi API duy nhất.

### SYSTEM INSTRUCTION:

```
Bạn là một AI Coach chuyên nghiệp, có kinh nghiệm phân tích hồ sơ kỹ thuật (CV/Resume).
Nhiệm vụ của bạn là đọc và phân tích CV được cung cấp (raw text) và trích xuất thông tin chi tiết cá nhân và đưa ra đánh giá kỹ năng sơ bộ.
Đầu ra phải là một đối tượng JSON DUY NHẤT chứa hai trường chính: "profile" và "assessment", tuân thủ chính xác các Schema đã được cung cấp.
Không đưa ra bất kỳ lời nói hay giải thích nào ngoài JSON.
```

### USER INPUT:

```
[RAW TEXT CỦA CV ĐÃ ĐƯỢC TRÍCH XUẤT TỪ FILE SẼ ĐƯỢC CHÈN VÀO ĐÂY]
```

### EXPECTED OUTPUT (Sử dụng Gemini API):

Yêu cầu Gemini sử dụng **Tool Calling** hoặc **response_schema** để trả về JSON với cấu trúc:

```json
{
  "profile": [dữ liệu theo Schema A],
  "assessment": [dữ liệu theo Schema B]
}
```

## 3. 💻 Chi Tiết Các Phần Phải Code Trước (Prototypes)

Đây là các khối code độc lập bạn nên phát triển và kiểm thử ở nhà, để khi vào thời gian chính thức, việc còn lại chỉ là **Ctrl+C và Ctrl+V** vào kiến trúc của nhóm.

### A. PoC (Proof-of-Concept) 1: Trích xuất Text (CV I/O - Thành viên 1, Đội 2)

| Mục tiêu | Thư viện Java | Code Flow Cần Có |
|----------|---------------|------------------|
| **Trích xuất PDF** | Apache PDFBox | Viết hàm `String extractTextFromPdf(File pdfFile)` |
| **Trích xuất DOCX** | Apache Tika hoặc Apache POI | Viết hàm `String extractTextFromDocx(File docxFile)` |
| **Hợp nhất** | Logic nhỏ | Viết hàm `String extractText(File file, String fileType)` để gọi hàm tương ứng. |

### B. PoC 2: Gọi Gemini API với Structured JSON (AI Processor 2 - Thành viên 2, Đội 2)

> **⚠️ Đây là phần quan trọng nhất cần phải hoạt động hoàn hảo.**

| Mục tiêu | Thư viện Java | Code Flow Cần Có |
|----------|---------------|------------------|
| **Tích hợp Gemini** | google-genai SDK (hoặc thư viện REST client) | Khởi tạo `GenerativeModel` với API Key và cấu hình. |
| **Request JSON** | response_schema hoặc Tool Calling | Viết hàm `JSONObject getStructuredProfileAndAssessment(String rawText)` nhận rawText và gửi kèm cả hai Schema A & B để ép buộc Gemini trả về cấu trúc JSON mong muốn. |
| **Parsing & Kiểm tra** | org.json hoặc Jackson | Viết code để kiểm tra xem JSON trả về có đúng cấu trúc (có key profile và assessment) hay không. |

### C. PoC 3: Mô phỏng Queue (Backend/Core Lead - Thành viên 1, Đội 1)

Mục tiêu là chứng minh 2 Service độc lập có thể giao tiếp qua Message Broker.

| Mục tiêu | Thư viện Java | Code Flow Cần Có |
|----------|---------------|------------------|
| **Publisher** | Spring Cloud Stream (hoặc RabbitTemplate/KafkaTemplate) | Viết một Service đơn giản có Endpoint API (ví dụ: `/test_publish`) để gửi một message giả lập `CV_UPLOADED` (chỉ chứa `{user_id: 123}`). |
| **Subscriber (Listener)** | Spring Cloud Stream @StreamListener hoặc @RabbitListener | Viết một Service khác nhận message này và chỉ in ra console `Received CV_UPLOADED for user 123. Starting AI Process....` |

## 4. 🎯 SMART Action Plan Schema (Bước 5)

### JSON Schema cho SMART Action Plan

```json
{
  "type": "object",
  "properties": {
    "plan_title": {
      "type": "string",
      "description": "Tiêu đề của kế hoạch hành động"
    },
    "goal_summary": {
      "type": "string",
      "description": "Tóm tắt mục tiêu của người dùng"
    },
    "actions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "action_id": {"type": "string"},
          "title": {"type": "string"},
          "description": {"type": "string"},
          "priority": {"type": "string", "enum": ["High", "Medium", "Low"]},
          "estimated_duration": {"type": "string"},
          "resources_needed": {"type": "array", "items": {"type": "string"}},
          "success_metrics": {"type": "string"}
        },
        "required": ["action_id", "title", "description", "priority"]
      }
    },
    "timeline": {
      "type": "object",
      "properties": {
        "total_duration": {"type": "string"},
        "milestones": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "week": {"type": "integer"},
              "milestone": {"type": "string"}
            }
          }
        }
      }
    }
  },
  "required": ["plan_title", "goal_summary", "actions"]
}
```

## 5. 📚 Dependencies & Libraries

### Core Dependencies cho pom.xml

```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- Message Queue -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-stream-rabbit</artifactId>
    </dependency>
    
    <!-- File Processing -->
    <dependency>
        <groupId>org.apache.pdfbox</groupId>
        <artifactId>pdfbox</artifactId>
    </dependency>
    <dependency>
        <groupId>org.apache.tika</groupId>
        <artifactId>tika-core</artifactId>
    </dependency>
    
    <!-- Gemini AI -->
    <dependency>
        <groupId>com.google.ai.client.generativeai</groupId>
        <artifactId>generativeai</artifactId>
    </dependency>
    
    <!-- JSON Processing -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
</dependencies>
```

## 6. 🚀 Implementation Checklist

### Pre-Development (Tuần 1-2)
- [ ] Setup local development environment
- [ ] Research và test Gemini API
- [ ] Implement PoC 1, 2, 3
- [ ] Create sample CV data for testing

### Development Phase (Tuần 3-4)
- [ ] Implement complete flow theo architecture
- [ ] Integration testing giữa các services
- [ ] Error handling và logging

### Final Phase (Tuần 5-6)
- [ ] Performance optimization
- [ ] Security implementation
- [ ] Documentation và deployment