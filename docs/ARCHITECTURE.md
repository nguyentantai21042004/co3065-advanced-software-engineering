# Architecture Documentation - Spring Boot Backend

## Tổng quan dự án

Đây là một ứng dụng Spring Boot backend được xây dựng theo kiến trúc **Layered Architecture (N-Tier Architecture)** với các design patterns hiện đại. Dự án sử dụng Spring Boot 3.3.4, Java 17, và tích hợp nhiều công nghệ như Spring Security, JWT, OAuth2, Firebase, MoMo Payment.

---

## Công nghệ sử dụng

### Core Framework
- **Spring Boot 3.3.4**: Framework chính
- **Java 17**: Ngôn ngữ lập trình
- **Maven**: Dependency management và build tool

### Persistence Layer
- **Spring Data JPA**: ORM và database interaction
- **Hibernate**: JPA implementation
- **MySQL 8.0.28**: Relational database

### Security
- **Spring Security**: Authentication và authorization
- **JWT (JSON Web Token)**: Token-based authentication
- **OAuth2 Client**: Google OAuth integration
- **BCrypt**: Password encoding

### External Services
- **Firebase Admin SDK 9.1.1**: File storage (Firebase Storage)
- **MoMo Payment API**: Payment gateway integration
- **Google OAuth2**: Social login

### Utilities
- **Lombok**: Boilerplate code reduction
- **Jackson**: JSON serialization/deserialization
- **Spring Validation**: Input validation

---

## Kiến trúc tổng thể (Architecture Overview)

### 1. Layered Architecture (Kiến trúc phân lớp)

Dự án được tổ chức theo mô hình **4-tier architecture**:

```
┌─────────────────────────────────────────┐
│     Presentation Layer (Controllers)     │  <-- API Endpoints
├─────────────────────────────────────────┤
│       Business Logic Layer (Services)    │  <-- Business Rules
├─────────────────────────────────────────┤
│    Data Access Layer (Repositories)      │  <-- Database Operations
├─────────────────────────────────────────┤
│         Database (MySQL)                 │  <-- Persistence
└─────────────────────────────────────────┘
```

**Các tầng chính:**

#### a) **Presentation Layer (Controller Layer)**
- **Package**: `com.project.backend.controllers`
- **Mục đích**: Xử lý HTTP requests/responses, validation, error handling
- **Annotation chính**: `@RestController`, `@RequestMapping`
- **Ví dụ**: `StudentController`, `PrinterController`, `PaymentController`

**Đặc điểm:**
- Nhận request từ client
- Gọi service layer để xử lý business logic
- Trả về response với format chuẩn (`ResponseObject`)
- Sử dụng DTO để nhận dữ liệu từ client
- Sử dụng Response objects để trả dữ liệu về client

#### b) **Business Logic Layer (Service Layer)**
- **Package**: `com.project.backend.services`
- **Mục đích**: Chứa business logic, orchestration, transaction management
- **Pattern**: Interface-Implementation pattern
- **Annotation**: `@Service`

**Cấu trúc:**
```
services/
├── student/
│   ├── IStudentService.java      (Interface)
│   └── StudentService.java        (Implementation)
├── printer/
│   ├── IPrinterService.java
│   └── PrinterService.java
└── ...
```

**Đặc điểm:**
- Mỗi service có một interface và một implementation
- Chứa business rules và validation logic
- Quản lý transactions
- Gọi repository layer để truy cập database
- Có thể gọi services khác để orchestrate business processes

#### c) **Data Access Layer (Repository Layer)**
- **Package**: `com.project.backend.repositories`
- **Mục đích**: Truy cập và thao tác với database
- **Pattern**: Repository Pattern (từ Spring Data JPA)
- **Annotation**: `@Repository`
- **Base Interface**: `JpaRepository<Entity, ID>`

**Đặc điểm:**
- Extend `JpaRepository` để có sẵn CRUD operations
- Custom queries với `@Query` annotation
- Hỗ trợ pagination và sorting
- Type-safe query methods

#### d) **Domain Model Layer**
- **Package**: `com.project.backend.models`
- **Mục đích**: Định nghĩa entities/domain objects
- **Annotation**: `@Entity`, `@Table`

---

## Design Patterns được sử dụng

### 1. **Dependency Injection (DI) Pattern**

**Mô tả**: Spring Framework core pattern, inject dependencies thông qua constructor

**Cách sử dụng:**
```java
@Service
@RequiredArgsConstructor  // Lombok generates constructor
public class StudentService implements IStudentService {
    private final JwtTokenUtils jwtTokenUtil;
    private final StudentRepository studentRepository;
    private final RoleRepository roleRepository;
    // Dependencies are injected automatically
}
```

**Lợi ích:**
- Loose coupling
- Dễ test (có thể mock dependencies)
- Tái sử dụng code

---

### 2. **Repository Pattern**

**Mô tả**: Tách biệt business logic khỏi data access logic

**Cách triển khai:**
```java
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmail(String email);
    
    @Query("SELECT s FROM Student s WHERE :keyword IS NULL OR s.email LIKE %:keyword%")
    Page<Student> findAll(PageRequest pageRequest, String keyword);
}
```

**Lợi ích:**
- Centralized data access
- Dễ dàng thay đổi database implementation
- Hỗ trợ unit testing với mock repositories

---

### 3. **Data Transfer Object (DTO) Pattern**

**Mô tả**: Sử dụng objects đặc biệt để transfer data giữa layers

**Package**: `com.project.backend.dataTranferObjects`

**Cách sử dụng:**
```java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudentLoginDTO {
    @JsonProperty("email")
    private String email;
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("picture")
    private String picture;
}
```

**Mục đích:**
- Input: Nhận dữ liệu từ client (request body)
- Validation: Validate dữ liệu đầu vào
- Security: Không expose internal entity structure
- Decoupling: Tách biệt API contract khỏi domain model

**Naming Convention:**
- `*DTO.java` - Dữ liệu input
- Ví dụ: `StudentLoginDTO`, `PrintJobCreateDTO`, `UpdateUserDTO`

---

### 4. **Response Object Pattern**

**Mô tả**: Standardized response format cho tất cả API endpoints

**Package**: `com.project.backend.responses`

**Cấu trúc:**
```
responses/
├── ResponseObject.java           (Base response wrapper)
├── students/
│   ├── StudentResponse.java
│   ├── StudentDetailResponse.java
│   └── StudentListResponse.java
├── printer/
├── printjob/
└── ...
```

**Base Response Wrapper:**
```java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResponseObject {
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("status")
    private HttpStatus status;
    
    @JsonProperty("data")
    private Object data;
}
```

**Specific Response Objects:**
```java
@Data
@Builder
public class StudentDetailResponse {
    @JsonProperty("id")
    private Integer studentId;
    
    @JsonProperty("full_name")
    private String fullName;
    
    // Factory method pattern
    public static StudentDetailResponse fromStudent(Student student) {
        return StudentDetailResponse.builder()
                .studentId(student.getStudentId())
                .fullName(student.getFullName())
                .build();
    }
}
```

**Lợi ích:**
- Consistent API response format
- Tách biệt internal entity khỏi API response
- Dễ dàng customize response data
- Support for multiple response types (detail, list, summary)

**Naming Convention:**
- `*Response.java` - Single entity response
- `*DetailResponse.java` - Detailed entity information
- `*ListResponse.java` - Paginated list response

---

### 5. **Builder Pattern**

**Mô tả**: Sử dụng Lombok's `@Builder` để tạo objects một cách fluent

**Cách sử dụng:**
```java
@Builder
@Data
public class Student {
    private String fullName;
    private String email;
    // ...
}

// Usage
Student student = Student.builder()
    .fullName("Nguyen Van A")
    .email("a@hcmut.edu.vn")
    .studentBalance(0)
    .build();
```

**Lợi ích:**
- Code dễ đọc
- Immutable objects
- Optional parameters

---

### 6. **Factory Method Pattern**

**Mô tả**: Sử dụng static methods để tạo response objects từ entities

**Cách triển khai:**
```java
public class StudentDetailResponse {
    public static StudentDetailResponse fromStudent(Student student) {
        return StudentDetailResponse.builder()
                .studentId(student.getStudentId())
                .fullName(student.getFullName())
                .email(student.getEmail())
                .build();
    }
}

// Usage in controller
@GetMapping("/detail")
public ResponseEntity<ResponseObject> getDetail() {
    Student student = studentService.getDetail();
    return ResponseEntity.ok(ResponseObject.builder()
        .data(StudentDetailResponse.fromStudent(student))
        .message("Success")
        .status(HttpStatus.OK)
        .build());
}
```

**Lợi ích:**
- Encapsulate object creation logic
- Single responsibility
- Reusable conversion logic

---

### 7. **Strategy Pattern (trong Authentication)**

**Mô tả**: Khác nhau strategy cho authentication dựa trên user role

**Cách triển khai:**
```java
@Component
public class JwtTokenFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, ...) {
        String role = jwtTokenUtil.getRole(token);
        UserDetails userDetails;
        
        switch (role) {
            case "STUDENT":
                userDetails = (Student) userDetailsService.loadUserByUsername(email);
                break;
            case "SPSO":
                userDetails = (SPSO) userDetailsService.loadUserByUsername(email);
                break;
            case "ADMIN":
                userDetails = (SPSO) userDetailsService.loadUserByUsername(email);
                break;
            default:
                throw new UsernameNotFoundException("User type not recognized");
        }
    }
}
```

---

### 8. **Filter Pattern / Chain of Responsibility**

**Mô tả**: Request đi qua chain of filters trước khi đến controller

**Cách triển khai:**
```java
@Component
public class JwtTokenFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) {
        // Authentication logic
        if (isBypassToken(request)) {
            filterChain.doFilter(request, response);
            return;
        }
        // Validate JWT token
        // Set SecurityContext
        filterChain.doFilter(request, response);
    }
}
```

**Filter chain configuration:**
```java
@Configuration
public class WebSecurityConfiguration {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) {
        return httpSecurity
            .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
```

---

### 9. **Singleton Pattern**

**Mô tả**: Spring beans mặc định là singleton

**Cách hoạt động:**
- Mỗi `@Component`, `@Service`, `@Repository`, `@Controller` là singleton
- Spring Container quản lý lifecycle
- Thread-safe by design (nếu stateless)

---

### 10. **Template Method Pattern**

**Mô tả**: Interface-Implementation pattern trong Service layer

**Cách triển khai:**
```java
// Interface định nghĩa contract
public interface IStudentService {
    StudentLoginDTO createDTO(Map<String, Object> tokenDataOAuth) throws Exception;
    String getJWTToken(StudentLoginDTO studentLoginDTO) throws Exception;
    Student getDetailFromToken(String token) throws Exception;
    Page<Student> findAll(PageRequest pageRequest, String keyword) throws Exception;
}

// Implementation cung cấp concrete behavior
@Service
public class StudentService implements IStudentService {
    // Implement all methods
}
```

**Lợi ích:**
- Programming to interface, not implementation
- Dễ dàng swap implementations
- Mockable for testing

---

## Cấu trúc Package (Package Structure)

```
com.project.backend/
│
├── Co3001SoftwareEngineeringApplication.java  (Main application)
│
├── components/                    (Reusable components)
│   ├── JwtTokenFilter.java       (JWT authentication filter)
│   └── JwtTokenUtils.java        (JWT utility methods)
│
├── configurations/                (Spring configuration classes)
│   ├── FirebaseConfig.java       (Firebase initialization)
│   ├── SecurityConfiguration.java (Security beans)
│   └── WebSecurityConfiguration.java (Security filter chain)
│
├── controllers/                   (REST API endpoints)
│   ├── StudentController.java
│   ├── PrinterController.java
│   ├── PrintJobController.java
│   ├── PaymentController.java
│   └── ...
│
├── dataTranferObjects/           (DTOs for input)
│   ├── StudentLoginDTO.java
│   ├── PrintJobCreateDTO.java
│   └── ...
│
├── exceptions/                    (Custom exceptions)
│   ├── DataNotFoundException.java
│   ├── JWTException.java
│   ├── InvalidPasswordException.java
│   └── ...
│
├── models/                        (JPA entities)
│   ├── Student.java
│   ├── SPSO.java
│   ├── Printer.java
│   ├── PrintJob.java
│   ├── Role.java
│   └── ...
│
├── repositories/                  (Data access layer)
│   ├── StudentRepository.java
│   ├── PrinterRepository.java
│   └── ...
│
├── responses/                     (Response objects)
│   ├── ResponseObject.java       (Base wrapper)
│   ├── students/
│   │   ├── StudentResponse.java
│   │   ├── StudentDetailResponse.java
│   │   └── StudentListResponse.java
│   ├── printer/
│   ├── printjob/
│   └── ...
│
├── services/                      (Business logic)
│   ├── student/
│   │   ├── IStudentService.java
│   │   └── StudentService.java
│   ├── printer/
│   ├── printjob/
│   ├── payment/
│   ├── oauth/
│   ├── firebase/
│   └── ...
│
└── utils/                         (Utility classes)
    └── ValidationUtils.java
```

---

## Security Architecture (Kiến trúc bảo mật)

### 1. **JWT-based Authentication**

**Flow:**
```
1. User login → Generate JWT token
2. Client stores JWT token
3. Subsequent requests include JWT in Authorization header
4. JwtTokenFilter validates token
5. If valid, set SecurityContext
6. Controller processes request with authenticated user
```

**Token Structure:**
```json
{
  "userId": 123,
  "role": "STUDENT",
  "sub": "student@hcmut.edu.vn",
  "exp": 1234567890
}
```

### 2. **OAuth2 Integration**

**Google OAuth Flow:**
```
1. User clicks "Login with Google"
2. Redirect to Google authorization page
3. User authorizes
4. Google redirects back with authorization code
5. Exchange code for tokens (id_token, access_token)
6. Extract user info from id_token
7. Create/update user in database
8. Generate JWT token
9. Return JWT to client
```

**Implementation:**
```java
@GetMapping("/custom-oauth-login")
public ResponseEntity<ResponseObject> OAuthLogin(HttpServletResponse response) {
    String authorizationUri = oAuthService.buildAuthorizationUri();
    response.sendRedirect(authorizationUri);
    return ResponseEntity.ok().body(/*...*/);
}

@GetMapping("/custom-oauth-callback")
public ResponseEntity<ResponseObject> OAuthCallBack(
    @RequestParam("code") String authorizationCode) {
    Map<String, Object> tokenDataOAuth = oAuthService.getOAuthGoogleToken(authorizationCode);
    StudentLoginDTO studentLoginDTO = studentService.createDTO(tokenDataOAuth);
    String jwtToken = studentService.getJWTToken(studentLoginDTO);
    // Redirect to frontend with JWT
}
```

### 3. **Role-Based Access Control (RBAC)**

**Roles:**
- `STUDENT`: Regular student users
- `SPSO`: Student Printing Service Officer
- `ADMIN`: System administrators

**Authorization:**
```java
// Method-level security
@GetMapping("/get")
@PreAuthorize("hasRole('ADMIN') or hasRole('SPSO')")
public ResponseEntity<ResponseObject> Get() {
    // Only ADMIN and SPSO can access
}

@GetMapping("/detail")
@PreAuthorize("hasRole('STUDENT')")
public ResponseEntity<ResponseObject> Detail() {
    // Only STUDENT can access
}
```

**URL-level security:**
```java
@Configuration
public class WebSecurityConfiguration {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) {
        return httpSecurity
            .authorizeHttpRequests(requests -> {
                requests
                    .requestMatchers("/api/v1/users/custom-oauth-login").permitAll()
                    .requestMatchers("/api/v1/internal/admin/login").permitAll()
                    .requestMatchers(HttpMethod.PUT, "/api/v1/internal/admin/detail/**")
                        .hasAnyRole("ADMIN", "SPSO")
                    .anyRequest().authenticated();
            })
            .build();
    }
}
```

### 4. **Password Encoding**

**Strategy:**
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

### 5. **CORS Configuration**

```java
.cors(cors -> cors.configurationSource(request -> {
    var corsConfig = new CorsConfiguration();
    corsConfig.setAllowedOrigins(List.of(
        "http://localhost:8080",
        "http://localhost:3000",
        "https://bkprinter.vercel.app"
    ));
    corsConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    corsConfig.setAllowedHeaders(List.of("*"));
    corsConfig.setAllowCredentials(true);
    return corsConfig;
}))
```

---

## Exception Handling (Xử lý Exception)

### Custom Exception Hierarchy

**Package**: `com.project.backend.exceptions`

**Các exception chính:**
```java
public class DataNotFoundException extends Exception {
    public DataNotFoundException(String message) {
        super(message);
    }
}

public class JWTException extends Exception { }
public class InvalidPasswordException extends Exception { }
public class ExpiredTokenException extends Exception { }
public class BalanceException extends Exception { }
public class InvalidAccessException extends Exception { }
public class InvalidParamException extends Exception { }
```

### Exception Handling Strategy

**Controller level:**
```java
@GetMapping("/detail")
public ResponseEntity<ResponseObject> Detail() {
    try {
        Student student = studentService.getDetailFromToken(token);
        return ResponseEntity.ok(ResponseObject.builder()
            .data(StudentDetailResponse.fromStudent(student))
            .message("Success")
            .status(HttpStatus.OK)
            .build());
    } catch (JWTException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ResponseObject.builder()
                .message(e.getMessage())
                .status(HttpStatus.UNAUTHORIZED)
                .data(null)
                .build());
    } catch (DataNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ResponseObject.builder()
                .message(e.getMessage())
                .status(HttpStatus.NOT_FOUND)
                .data(null)
                .build());
    }
}
```

**Standardized error response:**
```json
{
  "message": "Student not found",
  "status": "NOT_FOUND",
  "data": null
}
```

---

## Database Design

### JPA Entity Mapping

**Annotations:**
- `@Entity`: Đánh dấu class là JPA entity
- `@Table(name = "table_name")`: Mapping tới table
- `@Id`: Primary key
- `@GeneratedValue(strategy = GenerationType.IDENTITY)`: Auto increment
- `@Column`: Mapping tới column
- `@ManyToOne`, `@OneToMany`: Relationships
- `@JoinColumn`: Foreign key

**Example:**
```java
@Entity
@Table(name = "students")
@Getter
@Setter
@Builder
public class Student implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer studentId;
    
    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;
    
    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;
    
    @ManyToOne
    @JoinColumn(name = "role_id", foreignKey = @ForeignKey(name = "fk_role_id"))
    private Role role;
    
    @UpdateTimestamp
    @Column(name = "last_login", nullable = false)
    private LocalDateTime lastLogin;
}
```

### Repository Queries

**Built-in methods:**
- `findById(ID id)`
- `findAll()`
- `save(Entity entity)`
- `deleteById(ID id)`
- `existsById(ID id)`

**Query Methods:**
```java
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    // Method name query
    Optional<Student> findByEmail(String email);
    
    // JPQL query
    @Query("SELECT s FROM Student s WHERE :keyword IS NULL OR s.email LIKE %:keyword%")
    Page<Student> findAll(PageRequest pageRequest, String keyword);
}
```

---

## External Service Integration

### 1. **Firebase Storage Service**

**Mục đích**: Upload và quản lý files

**Configuration:**
```java
@Configuration
public class FirebaseConfig {
    @PostConstruct
    public void initialize() {
        FileInputStream serviceAccount = new FileInputStream("/etc/secrets/serviceAccountKey.json");
        FirebaseOptions options = FirebaseOptions.builder()
            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
            .setStorageBucket("testbe-28a98.appspot.com")
            .build();
        FirebaseApp.initializeApp(options);
    }
}
```

**Service:**
```java
@Service
public class FirebaseStorageService {
    public String uploadFile(MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID().toString() + "-" + file.getOriginalFilename();
        Bucket bucket = StorageClient.getInstance().bucket();
        Blob blob = bucket.create(fileName, file.getBytes(), file.getContentType());
        blob.createAcl(Acl.of(Acl.User.ofAllUsers(), Acl.Role.READER));
        return fileUrl;
    }
    
    public boolean deleteFile(String filePath) {
        Bucket bucket = StorageClient.getInstance().bucket();
        Blob blob = bucket.get(filePath);
        return blob.delete();
    }
}
```

### 2. **MoMo Payment Integration**

**Service**: `MoMoService`
**Purpose**: Process payments through MoMo gateway
**Flow**: Create payment request → Redirect to MoMo → IPN callback → Verify payment

### 3. **Google OAuth Service**

**Service**: `OAuthService`
**Purpose**: Handle Google OAuth authentication
**Methods**:
- `buildAuthorizationUri()`: Generate OAuth login URL
- `getOAuthGoogleToken()`: Exchange authorization code for tokens

---

## Best Practices được áp dụng

### 1. **Separation of Concerns**
- Mỗi layer có trách nhiệm riêng
- Controller không chứa business logic
- Service không truy cập database trực tiếp
- Repository chỉ chứa data access logic

### 2. **DRY (Don't Repeat Yourself)**
- Sử dụng `ResponseObject` cho tất cả API responses
- Factory methods để convert entities sang responses
- Utility classes cho common operations

### 3. **SOLID Principles**

**Single Responsibility:**
- Mỗi class có một trách nhiệm duy nhất
- Controller: Handle HTTP
- Service: Business logic
- Repository: Data access

**Open/Closed:**
- Sử dụng interfaces cho services
- Dễ dàng extend functionality

**Liskov Substitution:**
- Có thể thay thế implementation mà không ảnh hưởng code

**Interface Segregation:**
- Interfaces nhỏ, focused
- Không force implementation của unused methods

**Dependency Inversion:**
- Depend on abstractions (interfaces), not concretions
- Use dependency injection

### 4. **Security First**
- JWT for stateless authentication
- Password encoding với BCrypt
- Role-based access control
- CORS configuration
- Input validation

### 5. **RESTful API Design**
- Proper HTTP methods (GET, POST, PUT, DELETE)
- Meaningful resource URLs
- Standard status codes
- Consistent response format

### 6. **Clean Code**
- Meaningful names
- Small methods
- Comments where necessary
- Consistent formatting (với Lombok)

### 7. **Configuration Management**
- Externalized configuration (application.yml)
- Environment-specific configurations
- Sensitive data in environment variables

---

## Naming Conventions

### Package Naming
- **controllers**: REST endpoints
- **services**: Business logic với structure `service-name/IServiceName + ServiceName`
- **repositories**: Data access
- **models**: Domain entities
- **dataTranferObjects**: Input DTOs
- **responses**: Output response objects
- **configurations**: Spring configuration classes
- **components**: Reusable components
- **exceptions**: Custom exceptions
- **utils**: Utility classes

### Class Naming
- **Controllers**: `*Controller.java` (e.g., `StudentController`)
- **Services**: 
  - Interface: `I*Service.java` (e.g., `IStudentService`)
  - Implementation: `*Service.java` (e.g., `StudentService`)
- **Repositories**: `*Repository.java` (e.g., `StudentRepository`)
- **Models/Entities**: Noun (e.g., `Student`, `PrintJob`)
- **DTOs**: `*DTO.java` (e.g., `StudentLoginDTO`)
- **Responses**: 
  - `*Response.java` (e.g., `StudentResponse`)
  - `*DetailResponse.java` (e.g., `StudentDetailResponse`)
  - `*ListResponse.java` (e.g., `StudentListResponse`)
- **Exceptions**: `*Exception.java` (e.g., `DataNotFoundException`)
- **Configurations**: `*Configuration.java` or `*Config.java`

### Method Naming
- **Controllers**: HTTP method + resource (e.g., `Get()`, `Detail()`, `OAuthLogin()`)
- **Services**: Verb + Noun (e.g., `createDTO()`, `getJWTToken()`, `findAll()`)
- **Repositories**: 
  - `findBy*` (e.g., `findByEmail()`)
  - `save()`, `delete()`, `exists()`

---

## Configuration Files

### application.yml Structure
```yaml
server:
  port: <port>

api:
  prefix: <api-prefix>

jwt:
  expiration: <expiration-time>
  expiration-refresh-token: <refresh-token-expiration>
  secretKey: <secret-key>

spring:
  datasource:
    url: <database-url>
    username: <db-username>
    password: <db-password>
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: <create|update|validate|none>
    show-sql: <true|false>
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
  
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: <google-client-id>
            client-secret: <google-client-secret>
            scope: openid,profile,email
            redirect-uri: <callback-url>

momo:
  end_point: <momo-endpoint>
  access_key: <access-key>
  secret_key: <secret-key>
  partner_code: <partner-code>
```

---

## API Response Format

### Success Response
```json
{
  "message": "Students fetched successfully",
  "status": "OK",
  "data": {
    "students": [...],
    "currentPage": 1,
    "itemsPerPage": 10,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "message": "Student not found",
  "status": "NOT_FOUND",
  "data": null
}
```

### HTTP Status Codes
- `200 OK`: Success
- `400 BAD_REQUEST`: Invalid input
- `401 UNAUTHORIZED`: Authentication failed
- `403 FORBIDDEN`: Insufficient permissions
- `404 NOT_FOUND`: Resource not found
- `500 INTERNAL_SERVER_ERROR`: Server error

---

## Testing Strategy

### Unit Testing
- Test service layer với mock repositories
- Test repository layer với H2 in-memory database
- Test utility classes

### Integration Testing
- Test controllers với MockMvc
- Test authentication flow
- Test database integration

### Security Testing
- Test JWT generation và validation
- Test role-based access control
- Test OAuth flow

---

## Deployment Architecture

### Docker Support
- `Dockerfile` có sẵn
- Containerized deployment
- Easy scaling

### Database
- MySQL production database
- SQL scripts: `createDatabase.sql`, `createTrigger.sql`

---

## Hướng dẫn áp dụng vào dự án mới

### Bước 1: Setup Project Structure
```
your-project/
├── src/main/java/com/yourcompany/yourapp/
│   ├── YourApplication.java
│   ├── configurations/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── dataTranferObjects/
│   ├── responses/
│   ├── exceptions/
│   ├── components/
│   └── utils/
└── src/main/resources/
    └── application.yml
```

### Bước 2: Configure pom.xml
Copy dependencies từ project này:
- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- Spring Boot Starter Security
- JWT libraries
- Lombok
- MySQL connector

### Bước 3: Tạo Base Classes

**ResponseObject:**
```java
@Data
@Builder
public class ResponseObject {
    private String message;
    private HttpStatus status;
    private Object data;
}
```

**Base Exception:**
```java
public class BaseException extends Exception {
    public BaseException(String message) {
        super(message);
    }
}
```

### Bước 4: Implement Security

1. Create `SecurityConfiguration`
2. Create `WebSecurityConfiguration`
3. Create `JwtTokenUtils`
4. Create `JwtTokenFilter`
5. Implement `UserDetailsService`

### Bước 5: Implement cho mỗi Feature

**Cho mỗi domain entity (e.g., Product):**

1. **Model** (`Product.java`)
```java
@Entity
@Table(name = "products")
@Getter
@Setter
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name")
    private String name;
}
```

2. **Repository** (`ProductRepository.java`)
```java
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByName(String name);
}
```

3. **Service Interface** (`IProductService.java`)
```java
public interface IProductService {
    Product create(ProductDTO dto);
    Product findById(Long id);
    List<Product> findAll();
}
```

4. **Service Implementation** (`ProductService.java`)
```java
@Service
@RequiredArgsConstructor
public class ProductService implements IProductService {
    private final ProductRepository productRepository;
    
    @Override
    public Product create(ProductDTO dto) {
        // Business logic
    }
}
```

5. **DTO** (`ProductDTO.java`)
```java
@Data
@Builder
public class ProductDTO {
    @JsonProperty("name")
    private String name;
}
```

6. **Response** (`ProductResponse.java`)
```java
@Data
@Builder
public class ProductResponse {
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("name")
    private String name;
    
    public static ProductResponse fromProduct(Product product) {
        return ProductResponse.builder()
            .id(product.getId())
            .name(product.getName())
            .build();
    }
}
```

7. **Controller** (`ProductController.java`)
```java
@RestController
@RequestMapping("${api.prefix}/products")
@RequiredArgsConstructor
public class ProductController {
    private final IProductService productService;
    
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseObject> create(@RequestBody ProductDTO dto) {
        Product product = productService.create(dto);
        return ResponseEntity.ok(ResponseObject.builder()
            .data(ProductResponse.fromProduct(product))
            .message("Product created successfully")
            .status(HttpStatus.OK)
            .build());
    }
}
```

### Bước 6: Configure application.yml

Setup database, JWT, và other configurations

### Bước 7: Testing

Write tests cho services và controllers

---

## Common Patterns và Anti-Patterns

### ✅ DO (Best Practices)

1. **Always use DTOs for input**
```java
@PostMapping("/create")
public ResponseEntity<ResponseObject> create(@RequestBody ProductDTO dto) {
    // Use DTO, not Entity
}
```

2. **Always use Response objects for output**
```java
return ResponseEntity.ok(ResponseObject.builder()
    .data(ProductResponse.fromProduct(product))
    .build());
```

3. **Use constructor injection (with Lombok)**
```java
@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
}
```

4. **Program to interfaces**
```java
private final IProductService productService; // Good
private final ProductService productService;  // Avoid
```

5. **Use Optional for nullable returns**
```java
Optional<Product> findById(Long id);
```

6. **Use Builder pattern**
```java
Product product = Product.builder()
    .name("Product 1")
    .build();
```

7. **Validate input**
```java
@PostMapping("/create")
public ResponseEntity<ResponseObject> create(
    @Valid @RequestBody ProductDTO dto) {
    // ...
}
```

### ❌ DON'T (Anti-Patterns)

1. **Don't expose entities directly**
```java
// Bad
@GetMapping("/get")
public ResponseEntity<Product> get() {
    return ResponseEntity.ok(product);
}

// Good
@GetMapping("/get")
public ResponseEntity<ResponseObject> get() {
    return ResponseEntity.ok(ResponseObject.builder()
        .data(ProductResponse.fromProduct(product))
        .build());
}
```

2. **Don't put business logic in controllers**
```java
// Bad
@PostMapping("/create")
public ResponseEntity<?> create(@RequestBody ProductDTO dto) {
    // Complex business logic here
    if (dto.getPrice() < 0) { ... }
    // More logic
}

// Good
@PostMapping("/create")
public ResponseEntity<ResponseObject> create(@RequestBody ProductDTO dto) {
    Product product = productService.create(dto); // Logic in service
    return ResponseEntity.ok(/*...*/);
}
```

3. **Don't inject repositories into controllers**
```java
// Bad
@RestController
public class ProductController {
    private final ProductRepository productRepository; // Direct repository access
}

// Good
@RestController
public class ProductController {
    private final IProductService productService; // Use service layer
}
```

4. **Don't use field injection**
```java
// Bad
@Autowired
private ProductService productService;

// Good
@RequiredArgsConstructor
public class ProductController {
    private final IProductService productService;
}
```

5. **Don't ignore exceptions**
```java
// Bad
try {
    // code
} catch (Exception e) {
    // Empty catch block
}

// Good
try {
    // code
} catch (DataNotFoundException e) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(ResponseObject.builder()
            .message(e.getMessage())
            .status(HttpStatus.NOT_FOUND)
            .build());
}
```

---

## Checklist khi tạo feature mới

- [ ] Tạo Entity với JPA annotations
- [ ] Tạo Repository interface extend JpaRepository
- [ ] Tạo Service interface (I*Service)
- [ ] Tạo Service implementation
- [ ] Tạo DTO cho input
- [ ] Tạo Response object cho output
- [ ] Tạo Controller với appropriate endpoints
- [ ] Add security annotations (@PreAuthorize)
- [ ] Handle exceptions properly
- [ ] Use ResponseObject wrapper
- [ ] Write unit tests
- [ ] Document API endpoints

---

## Conclusion

Kiến trúc này cung cấp:
- ✅ Clear separation of concerns
- ✅ Scalable structure
- ✅ Maintainable codebase
- ✅ Secure authentication/authorization
- ✅ Consistent API responses
- ✅ Easy to test
- ✅ Follow industry best practices
- ✅ Ready for production deployment

Áp dụng architecture này sẽ giúp bạn xây dựng một backend application professional, maintainable, và scalable.

---

**Document Version**: 1.0  
**Last Updated**: October 30, 2025  
**Author**: Backend Architecture Documentation

