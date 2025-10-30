# Architecture Documentation - AI Coach Content Service

## Tổng quan dự án

Đây là một microservice Spring Boot được xây dựng theo kiến trúc **Clean Architecture (Hexagonal Architecture / Ports and Adapters)**. Dự án sử dụng Spring Boot 3.5.6, Java 17, PostgreSQL và tích hợp gRPC để quản lý nội dung học tập (courses, chapters, content units, versions).

---

## Công nghệ sử dụng

### Core Framework
- **Spring Boot 3.5.6**: Framework chính
- **Java 17**: Ngôn ngữ lập trình
- **Maven**: Dependency management và build tool

### Persistence Layer
- **Spring Data JPA**: ORM và database interaction
- **Hibernate**: JPA implementation
- **PostgreSQL**: Relational database

### Communication
- **Spring gRPC 0.11.0**: gRPC server integration
- **gRPC 1.62.2**: Remote procedure call framework
- **Protocol Buffers 3.25.3**: Serialization

### Security & Utilities
- **JWT (jjwt 0.12.3)**: Token-based authentication
- **Lombok**: Boilerplate code reduction
- **Jackson**: JSON serialization/deserialization với snake_case naming

---

## Kiến trúc tổng thể (Architecture Overview)

### Clean Architecture (Hexagonal Architecture)

Dự án được tổ chức theo **Clean Architecture** với sự phân tách rõ ràng giữa business logic và infrastructure:

```
┌─────────────────────────────────────────────────────────────┐
│                    ADAPTER LAYER                             │
│  ┌────────────────┐              ┌──────────────────┐       │
│  │  HTTP/REST     │              │  Response/DTO    │       │
│  │  (Controllers) │◄────────────►│  Builders        │       │
│  └────────────────┘              └──────────────────┘       │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ Port In (Use Cases)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   USE CASE LAYER                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Business Logic (Services)                         │     │
│  │  - Validation, Orchestration, Transactions         │     │
│  │  - Implement Use Case Interfaces                   │     │
│  └────────────────────────────────────────────────────┘     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ Commands/Criteria/Results
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DOMAIN LAYER                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Domain Models (Pure Java - No Annotations)        │     │
│  │  - Business Rules & Validation                     │     │
│  │  - Aggregate Roots                                 │     │
│  └────────────────────────────────────────────────────┘     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ Port Out (Repository Interfaces)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                         │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────┐  │
│  │ JPA Repos    │   │ Entities     │   │ Mappers        │  │
│  │ (Adapters)   │◄─►│ (Persistent) │◄─►│ Domain↔Entity  │  │
│  └──────────────┘   └──────────────┘   └────────────────┘  │
│  ┌──────────────┐   ┌─────────────────────────────────┐    │
│  │Spring Data   │   │ Specifications                  │    │
│  │Repositories  │   │ (Dynamic Queries)               │    │
│  └──────────────┘   └─────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Cấu trúc Package (Package Structure)

```
com.aicoach/
│
├── config/                           # Spring Configuration
│   ├── AICoachServiceApplication.java   # Main application class
│   └── CorsConfig.java                   # CORS configuration
│
├── models/                           # DOMAIN LAYER
│   ├── Course.java                      # Domain entity (Aggregate Root)
│   ├── Chapter.java
│   ├── ContentUnit.java
│   ├── ContentVersion.java
│   ├── Test.java
│   ├── MetadataTag.java
│   ├── PathCondition.java
│   └── UnitTag.java
│
├── usecase/                          # USE CASE LAYER
│   ├── CourseUseCase.java              # Port In - Interface
│   ├── ChapterUseCase.java
│   ├── ContentUnitUseCase.java
│   ├── ContentVersionUseCase.java
│   ├── TestUseCase.java
│   ├── MetadataTagUseCase.java
│   ├── PathConditionUseCase.java
│   ├── UnitTagUseCase.java
│   │
│   ├── service/                         # Use Case Implementations
│   │   ├── CourseService.java              # Business logic implementation
│   │   ├── ChapterService.java
│   │   ├── ContentUnitService.java
│   │   ├── ContentVersionService.java
│   │   ├── TestService.java
│   │   └── MetadataTagService.java
│   │
│   └── types/                           # Use Case Types
│       ├── CreateCourseCommand.java        # Command objects
│       ├── UpdateCourseCommand.java
│       ├── CourseSearchCriteria.java       # Query criteria
│       └── CoursePageResult.java           # Query results
│
├── repository/                       # PORT OUT (Interfaces)
│   ├── CourseRepository.java           # Repository interface (Port)
│   ├── ChapterRepository.java
│   ├── ContentUnitRepository.java
│   ├── ContentVersionRepository.java
│   ├── TestRepository.java
│   └── MetadataTagRepository.java
│   │
│   └── postgresql/                   # INFRASTRUCTURE LAYER
│       ├── JpaCourseRepository.java        # Port implementation (Adapter)
│       ├── JpaChapterRepository.java
│       ├── JpaContentUnitRepository.java
│       ├── JpaContentVersionRepository.java
│       ├── JpaTestRepository.java
│       ├── JpaMetadataTagRepository.java
│       │
│       ├── SpringDataCourseRepository.java # Spring Data JPA interface
│       ├── SpringDataChapterRepository.java
│       ├── SpringDataTestRepository.java
│       ├── ContentUnitJpaRepository.java
│       ├── ContentVersionJpaRepository.java
│       ├── MetadataTagJpaRepository.java
│       │
│       ├── entity/                         # JPA Entities
│       │   ├── CourseEntity.java              # Persistent entity
│       │   ├── ChapterEntity.java
│       │   ├── ContentUnitEntity.java
│       │   ├── ContentVersionEntity.java
│       │   ├── TestEntity.java
│       │   └── MetadataTagEntity.java
│       │
│       ├── mapper/                         # Domain ↔ Entity Mappers
│       │   ├── CourseMapper.java
│       │   ├── ChapterMapper.java
│       │   └── TestMapper.java
│       │
│       └── specification/                  # Specification Pattern
│           ├── CourseSpecification.java       # Dynamic query builder
│           ├── ContentUnitSpecification.java
│           └── ContentVersionSpecification.java
│
├── adapter/                          # ADAPTER LAYER
│   └── http/                            # HTTP Adapter (REST)
│       ├── CourseController.java           # REST endpoint
│       ├── ChapterController.java
│       ├── ContentUnitController.java
│       ├── ContentVersionController.java
│       ├── TestController.java
│       └── UserController.java
│       │
│       ├── dto/                            # Data Transfer Objects
│       │   ├── ApiResponse.java               # Standard response wrapper
│       │   ├── CreateCourseRequest.java       # Request DTOs
│       │   ├── UpdateCourseRequest.java
│       │   ├── CourseResponse.java            # Response DTOs
│       │   ├── CoursePageResponse.java
│       │   └── ErrorResponse.java
│       │
│       └── response/                       # Response Builders
│           ├── CommandBuilder.java            # DTO → Command converter
│           └── CourseResponseBuilder.java     # Domain → Response converter
│
└── mappers/                          # MAPPER LAYER
    ├── ContentUnitMapper.java          # Domain ↔ Entity mapper
    ├── ContentVersionMapper.java
    └── MetadataTagMapper.java
```

---

## Các tầng chính (Main Layers)

### 1. Domain Layer (Core Business Logic)

**Package**: `com.aicoach.models`

**Đặc điểm:**
- **Pure Java objects** - Không phụ thuộc vào framework
- **No JPA annotations** - Không có `@Entity`, `@Column`
- **Business logic & validation** - Chứa logic nghiệp vụ
- **Aggregate Roots** - Đại diện cho domain entities

**Ví dụ - Course.java:**
```java
public class Course {
    private UUID courseId;
    private String title;
    private String description;
    private UUID instructorId;
    private StructureType structureType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Business validation methods
    public boolean isValid() {
        return hasValidTitle() && hasValidDescription() &&
                hasValidInstructorId() && hasValidStructureType();
    }

    public void updateTitle(String newTitle) {
        if (newTitle == null || newTitle.trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be null or empty");
        }
        this.title = newTitle;
        this.updatedAt = LocalDateTime.now();
    }

    // Enum cho Structure Type
    public enum StructureType {
        LINEAR, ADAPTIVE
    }
}
```

**Lợi ích:**
- Độc lập với framework và database
- Dễ dàng test (không cần Spring context)
- Business logic tập trung
- Có thể tái sử dụng trong nhiều context khác nhau

---

### 2. Use Case Layer (Application Business Rules)

**Package**: `com.aicoach.usecase`

**Cấu trúc:**
- **Interface** (Port In): `CourseUseCase.java`
- **Implementation**: `service/CourseService.java`
- **Types**: `types/CreateCourseCommand.java`, `CourseSearchCriteria.java`

**A. Use Case Interface (Port In):**
```java
public interface CourseUseCase {
    // Create
    Course create(CreateCourseCommand command);
    
    // Read
    Optional<Course> detail(UUID courseId);
    CoursePageResult list(CourseSearchCriteria criteria);
    
    // Update
    Optional<Course> update(UUID courseId, UpdateCourseCommand command);
    
    // Delete
    int deletes(List<UUID> courseIds);
    
    // Existence check
    boolean existsById(UUID courseId);
    boolean existsByTitle(String title);
}
```

**B. Service Implementation:**
```java
@Service
@Transactional
public class CourseService implements CourseUseCase {
    
    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Override
    public Course create(CreateCourseCommand command) {
        // 1. Business validation
        if (command.getTitle() == null || command.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Course title cannot be null or empty");
        }

        // 2. Check duplicate
        if (courseRepository.existsByTitle(command.getTitle())) {
            throw new IllegalArgumentException("Course with this title already exists");
        }

        // 3. Create domain entity
        Course course = new Course(
            command.getTitle(), 
            command.getDescription(), 
            command.getInstructorId(), 
            command.getStructureType()
        );

        // 4. Domain validation
        if (!course.isValid()) {
            throw new IllegalArgumentException("Invalid course data");
        }

        // 5. Save via repository (Port Out)
        return courseRepository.save(course);
    }
}
```

**C. Command Objects:**
```java
// Immutable command object
public class CreateCourseCommand {
    private final String title;
    private final String description;
    private final UUID instructorId;
    private final Course.StructureType structureType;

    public CreateCourseCommand(String title, String description, 
                               UUID instructorId, Course.StructureType structureType) {
        this.title = title;
        this.description = description;
        this.instructorId = instructorId;
        this.structureType = structureType;
    }
    // Getters only (immutable)
}
```

**Đặc điểm:**
- Chứa **application business logic**
- Orchestrate domain objects
- Transaction management (`@Transactional`)
- Sử dụng **Repository interfaces** (Port Out) để truy cập database
- Dependency injection thông qua constructor
- Command và Query separation (CQRS-like)

---

### 3. Repository Layer (Port Out Interface)

**Package**: `com.aicoach.repository`

**Repository Interface (Port Out):**
```java
public interface CourseRepository {
    Course save(Course course);
    Optional<Course> findById(UUID courseId);
    CoursePageResult search(CourseSearchCriteria criteria);
    void deleteByIds(List<UUID> courseIds);
    boolean existsById(UUID courseId);
    boolean existsByTitle(String title);
}
```

**Đặc điểm:**
- **Pure interface** - không có implementation details
- Làm việc với **Domain objects** (không phải Entities)
- Định nghĩa contract giữa Use Case và Infrastructure
- Cho phép swap implementations (PostgreSQL → MongoDB, etc.)

---

### 4. Infrastructure Layer (Adapter Implementation)

**Package**: `com.aicoach.repository.postgresql`

**A. JPA Repository Implementation (Adapter):**
```java
@Repository
public class JpaCourseRepository implements CourseRepository {

    private final SpringDataCourseRepository springDataCourseRepository;

    public JpaCourseRepository(SpringDataCourseRepository springDataCourseRepository) {
        this.springDataCourseRepository = springDataCourseRepository;
    }

    @Override
    public Course save(Course course) {
        // 1. Convert Domain → Entity
        CourseEntity entity = CourseMapper.toEntity(course);
        
        // 2. Save via Spring Data JPA
        CourseEntity savedEntity = springDataCourseRepository.save(entity);
        
        // 3. Convert Entity → Domain
        return CourseMapper.toDomain(savedEntity);
    }

    @Override
    public CoursePageResult search(CourseSearchCriteria criteria) {
        Pageable pageable = PageRequest.of(criteria.getPage(), criteria.getSize());
        
        // Dynamic query using Specification Pattern
        Specification<CourseEntity> spec = CourseSpecification.createSpecification(criteria);
        Page<CourseEntity> page = springDataCourseRepository.findAll(spec, pageable);
        
        // Convert Entities → Domains
        List<Course> courses = page.getContent().stream()
            .map(CourseMapper::toDomain)
            .collect(Collectors.toList());
        
        return new CoursePageResult(
            courses,
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages()
        );
    }
}
```

**B. Spring Data JPA Interface:**
```java
@Repository
public interface SpringDataCourseRepository 
        extends JpaRepository<CourseEntity, UUID>, 
                JpaSpecificationExecutor<CourseEntity> {
    boolean existsByTitle(String title);
}
```

**C. JPA Entity:**
```java
@Entity
@Table(name = "courses")
public class CourseEntity {

    @Id
    @Column(name = "course_id", columnDefinition = "UUID")
    private UUID courseId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "instructor_id", nullable = false, columnDefinition = "UUID")
    private UUID instructorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "structure_type", nullable = false, length = 20)
    private StructureType structureType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
}
```

**D. Mapper (Domain ↔ Entity):**
```java
public class CourseMapper {
    
    public static CourseEntity toEntity(Course domain) {
        return new CourseEntity(
            domain.getCourseId(),
            domain.getTitle(),
            domain.getDescription(),
            domain.getInstructorId(),
            convertToEntityStructureType(domain.getStructureType()),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }
    
    public static Course toDomain(CourseEntity entity) {
        return new Course(
            entity.getCourseId(),
            entity.getTitle(),
            entity.getDescription(),
            entity.getInstructorId(),
            convertToDomainStructureType(entity.getStructureType()),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
```

**E. Specification Pattern (Dynamic Queries):**
```java
public class CourseSpecification {

    public static Specification<CourseEntity> createSpecification(CourseSearchCriteria criteria) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Search by title (contains)
            if (StringUtils.hasText(criteria.getTitle())) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("title")), 
                    "%" + criteria.getTitle().toLowerCase() + "%"
                ));
            }

            // Search by instructor ID
            if (criteria.getInstructorId() != null) {
                predicates.add(criteriaBuilder.equal(
                    root.get("instructorId"), 
                    criteria.getInstructorId()
                ));
            }

            // Search by structure type
            if (criteria.getStructureType() != null) {
                predicates.add(criteriaBuilder.equal(
                    root.get("structureType"), 
                    convertToEntityStructureType(criteria.getStructureType())
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
```

**Đặc điểm Infrastructure Layer:**
- Implement **Port Out interfaces** (Repository)
- Sử dụng **JPA Entities** với annotations
- **Mapper pattern** để convert Domain ↔ Entity
- **Specification pattern** cho dynamic queries
- Spring Data JPA để giảm boilerplate code

---

### 5. Adapter Layer (HTTP/REST)

**Package**: `com.aicoach.adapter.http`

**A. REST Controller:**
```java
@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseUseCase courseUseCase;

    public CourseController(CourseUseCase courseUseCase) {
        this.courseUseCase = courseUseCase;
    }

    /**
     * POST /api/courses - Tạo course mới
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CourseResponse>> create(
            @RequestBody CreateCourseRequest request) {
        
        // 1. Convert Request DTO → Command
        Course course = courseUseCase.create(
            CommandBuilder.toCreateCourseCommand(request)
        );
        
        // 2. Convert Domain → Response DTO
        CourseResponse response = CourseResponseBuilder.toResponse(course);
        
        // 3. Wrap in standard ApiResponse
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Course created successfully", response));
    }

    /**
     * GET /api/courses/{courseId} - Lấy course theo ID
     */
    @GetMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseResponse>> detail(
            @PathVariable UUID courseId) {
        
        return courseUseCase.detail(courseId)
                .map(course -> ResponseEntity.ok(
                        ApiResponse.success(CourseResponseBuilder.toResponse(course))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(404, "Course not found")));
    }

    /**
     * GET /api/courses - Lấy danh sách courses với search và pagination
     */
    @GetMapping
    public ResponseEntity<ApiResponse<CoursePageResult>> list(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) UUID instructorId,
            @RequestParam(required = false) Course.StructureType structureType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        CourseSearchCriteria criteria = new CourseSearchCriteria(
            title, instructorId, structureType, page, size
        );
        CoursePageResult result = courseUseCase.list(criteria);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * PUT /api/courses/{courseId} - Cập nhật course
     */
    @PutMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseResponse>> update(
            @PathVariable UUID courseId,
            @RequestBody UpdateCourseRequest request) {
        
        return courseUseCase.update(courseId, 
                CommandBuilder.toUpdateCourseCommand(request))
                .map(course -> ResponseEntity.ok(
                        ApiResponse.success("Course updated successfully", 
                            CourseResponseBuilder.toResponse(course))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(404, "Course not found")));
    }

    /**
     * DELETE /api/courses - Xóa nhiều courses
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<String>> deletes(
            @RequestBody List<UUID> courseIds) {
        
        int deletedCount = courseUseCase.deletes(courseIds);
        return ResponseEntity.ok(ApiResponse.success(
                "Successfully deleted " + deletedCount + " course(s)"));
    }

    /**
     * Exception Handler - Trả về chuẩn ApiResponse
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(
            IllegalArgumentException e) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(400, e.getMessage()));
    }
}
```

**B. API Response Wrapper (Standard Format):**
```java
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    
    private int errorCode;      // 0 = success, non-zero = error
    private String message;
    private T data;
    private Object errors;

    // Success response với data
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(0, "Success", data, null);
    }

    // Success response với custom message
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(0, message, data, null);
    }

    // Error response
    public static <T> ApiResponse<T> error(int errorCode, String message) {
        return new ApiResponse<>(errorCode, message, null, null);
    }
    
    // Error response với validation errors
    public static <T> ApiResponse<T> error(int errorCode, String message, Object errors) {
        return new ApiResponse<>(errorCode, message, null, errors);
    }
}
```

**C. Request DTOs:**
```java
public class CreateCourseRequest {
    private String title;
    private String description;
    private UUID instructorId;
    private String structureType; // "LINEAR" or "ADAPTIVE"

    // Getters and Setters
}
```

**D. Response DTOs:**
```java
public class CourseResponse {
    private UUID courseId;
    private String title;
    private String description;
    private UUID instructorId;
    private String structureType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters and Setters
}
```

**E. Builders (Converters):**
```java
// Request DTO → Command
public class CommandBuilder {
    public static CreateCourseCommand toCreateCourseCommand(CreateCourseRequest request) {
        return new CreateCourseCommand(
            request.getTitle(),
            request.getDescription(),
            request.getInstructorId(),
            Course.StructureType.valueOf(request.getStructureType())
        );
    }
}

// Domain → Response DTO
public class CourseResponseBuilder {
    public static CourseResponse toResponse(Course course) {
        CourseResponse response = new CourseResponse();
        response.setCourseId(course.getCourseId());
        response.setTitle(course.getTitle());
        response.setDescription(course.getDescription());
        response.setInstructorId(course.getInstructorId());
        response.setStructureType(course.getStructureType().toString());
        response.setCreatedAt(course.getCreatedAt());
        response.setUpdatedAt(course.getUpdatedAt());
        return response;
    }
}
```

**Đặc điểm Adapter Layer:**
- Handle HTTP requests/responses
- Convert DTOs ↔ Commands/Domain objects
- Standard response format (`ApiResponse`)
- Exception handling với standard error responses
- Không chứa business logic

---

## Design Patterns được sử dụng

### 1. **Clean Architecture / Hexagonal Architecture (Ports and Adapters)**

**Mô tả**: Kiến trúc chính của toàn bộ hệ thống

**Layers:**
- **Domain Layer**: Pure business logic (models)
- **Use Case Layer**: Application business rules (usecase)
- **Infrastructure Layer**: External concerns (repository/postgresql)
- **Adapter Layer**: Interface adapters (adapter/http)

**Ports:**
- **Port In**: Use Case interfaces (e.g., `CourseUseCase`)
- **Port Out**: Repository interfaces (e.g., `CourseRepository`)

**Adapters:**
- **Driving Adapters**: Controllers (HTTP, gRPC)
- **Driven Adapters**: Repository implementations (JPA)

**Flow:**
```
HTTP Request → Controller (Adapter In)
           → Use Case (Port In)
           → Domain Logic
           → Repository (Port Out)
           → JPA Repository (Adapter Out)
           → Database
```

**Lợi ích:**
- Separation of concerns rõ ràng
- Business logic độc lập với framework
- Dễ dàng test (mock adapters)
- Có thể swap implementations (PostgreSQL → MongoDB)
- Framework agnostic domain layer

---

### 2. **Dependency Injection (DI) Pattern**

**Mô tả**: Spring Framework core pattern, inject dependencies thông qua constructor

**Cách sử dụng:**
```java
@Service
public class CourseService implements CourseUseCase {
    private final CourseRepository courseRepository;

    // Constructor injection (recommended)
    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }
}

@RestController
public class CourseController {
    private final CourseUseCase courseUseCase;

    // Inject interface, not implementation
    public CourseController(CourseUseCase courseUseCase) {
        this.courseUseCase = courseUseCase;
    }
}
```

**Lợi ích:**
- Loose coupling
- Testability (mock dependencies)
- Immutable dependencies (final fields)

---

### 3. **Repository Pattern**

**Mô tả**: Tách biệt business logic khỏi data access logic

**Cách triển khai:**
```java
// Port Out Interface (domain layer)
public interface CourseRepository {
    Course save(Course course);
    Optional<Course> findById(UUID courseId);
}

// Adapter Implementation (infrastructure layer)
@Repository
public class JpaCourseRepository implements CourseRepository {
    private final SpringDataCourseRepository springDataRepository;
    
    @Override
    public Course save(Course course) {
        CourseEntity entity = CourseMapper.toEntity(course);
        CourseEntity saved = springDataRepository.save(entity);
        return CourseMapper.toDomain(saved);
    }
}
```

**Lợi ích:**
- Centralized data access
- Testable (mock repository)
- Database agnostic (domain layer)

---

### 4. **Command Pattern (Command Objects)**

**Mô tả**: Encapsulate request parameters trong immutable command objects

**Package**: `com.aicoach.usecase.types`

**Cách sử dụng:**
```java
// Command object (immutable)
public class CreateCourseCommand {
    private final String title;
    private final String description;
    private final UUID instructorId;
    private final Course.StructureType structureType;

    public CreateCourseCommand(String title, String description, 
                               UUID instructorId, Course.StructureType structureType) {
        this.title = title;
        this.description = description;
        this.instructorId = instructorId;
        this.structureType = structureType;
    }
    // Getters only
}

// Use Case
Course create(CreateCourseCommand command);
```

**Lợi ích:**
- Immutable requests
- Type-safe parameters
- Reusable across layers
- Clear intent

---

### 5. **Specification Pattern**

**Mô tả**: Dynamic query building với type-safe predicates

**Package**: `com.aicoach.repository.postgresql.specification`

**Cách triển khai:**
```java
public class CourseSpecification {

    public static Specification<CourseEntity> createSpecification(
            CourseSearchCriteria criteria) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Dynamic predicates based on criteria
            if (StringUtils.hasText(criteria.getTitle())) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("title")), 
                    "%" + criteria.getTitle().toLowerCase() + "%"
                ));
            }

            if (criteria.getInstructorId() != null) {
                predicates.add(criteriaBuilder.equal(
                    root.get("instructorId"), 
                    criteria.getInstructorId()
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}

// Usage
Specification<CourseEntity> spec = CourseSpecification.createSpecification(criteria);
Page<CourseEntity> page = springDataRepository.findAll(spec, pageable);
```

**Lợi ích:**
- Dynamic queries
- Type-safe
- Reusable criteria
- Avoid SQL injection

---

### 6. **Mapper Pattern**

**Mô tả**: Convert giữa các object types (Domain ↔ Entity, DTO ↔ Command)

**A. Domain ↔ Entity Mapper:**
```java
// Infrastructure mapper
public class CourseMapper {
    
    public static CourseEntity toEntity(Course domain) {
        return new CourseEntity(
            domain.getCourseId(),
            domain.getTitle(),
            // ... other fields
        );
    }
    
    public static Course toDomain(CourseEntity entity) {
        return new Course(
            entity.getCourseId(),
            entity.getTitle(),
            // ... other fields
        );
    }
}
```

**B. DTO ↔ Domain Mapper:**
```java
@Component
public class ContentUnitMapper {
    
    public ContentUnitEntity toEntity(ContentUnit domain) {
        return new ContentUnitEntity(
            domain.getUnitId(),
            domain.getChapterId(),
            domain.getUnitType(),
            domain.getMetadataConfig(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }
    
    public ContentUnit toDomain(ContentUnitEntity entity) {
        return new ContentUnit(
            entity.getUnitId(),
            entity.getChapterId(),
            entity.getUnitType(),
            entity.getMetadataConfig(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
```

**Lợi ích:**
- Clear separation between layers
- Centralized conversion logic
- Easy to maintain
- Type safety

---

### 7. **DTO Pattern (Data Transfer Object)**

**Mô tả**: Sử dụng objects đặc biệt để transfer data giữa layers

**Package**: `com.aicoach.adapter.http.dto`

**Types:**
- **Request DTOs**: Input từ client (`CreateCourseRequest`)
- **Response DTOs**: Output cho client (`CourseResponse`)
- **Command Objects**: Input cho use cases (`CreateCourseCommand`)
- **Criteria Objects**: Query parameters (`CourseSearchCriteria`)
- **Result Objects**: Query results (`CoursePageResult`)

**Ví dụ:**
```java
// Request DTO
public class CreateCourseRequest {
    private String title;
    private String description;
    private UUID instructorId;
    private String structureType;
    // Getters and Setters
}

// Response DTO
public class CourseResponse {
    private UUID courseId;
    private String title;
    private String description;
    private UUID instructorId;
    private String structureType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // Getters and Setters
}
```

**Lợi ích:**
- Decouple API contract from domain model
- Security (don't expose internal structure)
- Flexibility (API can change independently)

---

### 8. **Builder Pattern**

**Mô tả**: Fluent API để tạo objects

**Cách sử dụng:**
```java
// Static factory methods (Builder-like)
public class ApiResponse<T> {
    
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(0, "Success", data, null);
    }

    public static <T> ApiResponse<T> error(int errorCode, String message) {
        return new ApiResponse<>(errorCode, message, null, null);
    }
}

// Usage
return ResponseEntity.ok(ApiResponse.success("Course created", courseResponse));
```

**Lợi ích:**
- Readable code
- Consistent object creation
- Optional parameters

---

### 9. **Adapter Pattern**

**Mô tả**: Convert interface của một class sang interface khác

**Cách triển khai:**
```java
// Port Interface (expected by use case)
public interface CourseRepository {
    Course save(Course course);
}

// Adapter Implementation (adapts Spring Data JPA)
@Repository
public class JpaCourseRepository implements CourseRepository {
    
    private final SpringDataCourseRepository springDataRepository;
    
    @Override
    public Course save(Course course) {
        // Adapt Spring Data JPA to our interface
        CourseEntity entity = CourseMapper.toEntity(course);
        CourseEntity saved = springDataRepository.save(entity);
        return CourseMapper.toDomain(saved);
    }
}
```

**Lợi ích:**
- Integrate external libraries
- Swap implementations easily
- Maintain clean interfaces

---

### 10. **Template Method Pattern**

**Mô tả**: Define interface, implement in concrete class

**Cách triển khai:**
```java
// Interface định nghĩa contract
public interface CourseUseCase {
    Course create(CreateCourseCommand command);
    Optional<Course> detail(UUID courseId);
    CoursePageResult list(CourseSearchCriteria criteria);
}

// Implementation cung cấp concrete behavior
@Service
public class CourseService implements CourseUseCase {
    // Implement all methods
}
```

**Lợi ích:**
- Programming to interface
- Swap implementations
- Mockable for testing

---

### 11. **Singleton Pattern**

**Mô tả**: Spring beans mặc định là singleton

**Cách hoạt động:**
- `@Service`, `@Repository`, `@Controller`, `@Component` là singleton
- Spring Container quản lý lifecycle
- Thread-safe by design (nếu stateless)

---

## API Response Format

### Standard Response Structure

**Success Response:**
```json
{
  "error_code": 0,
  "message": "Course created successfully",
  "data": {
    "course_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Introduction to AI",
    "description": "Learn AI fundamentals",
    "instructor_id": "660e8400-e29b-41d4-a716-446655440000",
    "structure_type": "LINEAR",
    "created_at": "2025-10-30T10:30:00",
    "updated_at": "2025-10-30T10:30:00"
  }
}
```

**Paginated Response:**
```json
{
  "error_code": 0,
  "message": "Success",
  "data": {
    "courses": [...],
    "page": 0,
    "size": 20,
    "total_elements": 100,
    "total_pages": 5
  }
}
```

**Error Response:**
```json
{
  "error_code": 404,
  "message": "Course not found",
  "data": null
}
```

**Validation Error Response:**
```json
{
  "error_code": 400,
  "message": "Validation failed",
  "data": null,
  "errors": {
    "title": "Title cannot be empty",
    "instructor_id": "Instructor ID is required"
  }
}
```

### HTTP Status Codes

- `200 OK`: Success
- `201 CREATED`: Resource created successfully
- `400 BAD_REQUEST`: Invalid input or validation error
- `404 NOT_FOUND`: Resource not found
- `500 INTERNAL_SERVER_ERROR`: Server error

---

## Database Design

### JPA Entity Mapping

**Annotations:**
- `@Entity`: Đánh dấu class là JPA entity
- `@Table(name = "...")`: Mapping tới database table
- `@Id`: Primary key
- `@Column`: Column mapping với constraints
- `@Enumerated(EnumType.STRING)`: Enum mapping
- `@PrePersist`, `@PreUpdate`: Lifecycle callbacks

**Naming Convention:**
- Java: `camelCase` (courseId, instructorId)
- Database: `snake_case` (course_id, instructor_id)
- Jackson config: `SNAKE_CASE` trong `application.yml`

---

## Configuration

### application.yml

```yaml
spring:
  application:
    name: "AI Coach"
  
  # Database Configuration
  datasource:
    url: jdbc:postgresql://localhost:5432/co3065
    username: admin
    password: admin123
    driver-class-name: org.postgresql.Driver

  # JPA Configuration
  jpa:
    hibernate:
      ddl-auto: validate              # validate, update, create, create-drop
    show-sql: true                    # Log SQL queries
    properties:
      hibernate:
        format_sql: true              # Format SQL queries
        dialect: org.hibernate.dialect.PostgreSQLDialect

  # Jackson Configuration
  jackson:
    property-naming-strategy: SNAKE_CASE    # JSON snake_case
    default-property-inclusion: NON_NULL    # Exclude null fields

# Server Configuration
server:
  port: 8090

# Logging Configuration
logging:
  level:
    com.aicoach: DEBUG
    org.springframework.web: DEBUG
    org.hibernate.SQL: DEBUG
```

### CORS Configuration

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

---

## Best Practices được áp dụng

### 1. **Separation of Concerns**
- Mỗi layer có trách nhiệm riêng biệt
- Domain layer không phụ thuộc vào infrastructure
- Use case không biết về HTTP hay database
- Infrastructure có thể thay đổi mà không ảnh hưởng domain

### 2. **Dependency Inversion Principle (DIP)**
- Use case depend on **repository interface** (abstraction)
- Infrastructure implement interface đó
- High-level modules không depend on low-level modules

### 3. **Interface Segregation**
- Use Case interfaces nhỏ, focused
- Repository interfaces chỉ expose methods cần thiết
- Không force implementation của unused methods

### 4. **Single Responsibility Principle (SRP)**
- Controller: Handle HTTP only
- Service: Business logic only
- Repository: Data access only
- Mapper: Conversion only

### 5. **Open/Closed Principle**
- Open for extension: Có thể add new adapters
- Closed for modification: Domain logic không thay đổi

### 6. **Command Query Separation (CQS-like)**
- Command objects cho mutations (Create, Update, Delete)
- Criteria objects cho queries (Search)
- Result objects cho query results (PageResult)

### 7. **Immutability**
- Command objects là immutable (final fields, no setters)
- Domain objects có controlled mutations (update methods)

### 8. **Validation Layers**
- Input validation: Controller/DTO level
- Business validation: Use Case level
- Domain validation: Domain model level

### 9. **Error Handling**
- Standardized error responses (ApiResponse)
- Exception handlers trong controllers
- Business exceptions throw từ use case/domain

### 10. **Transaction Management**
- `@Transactional` trên service methods
- Read-only transactions cho queries
- Proper transaction boundaries

---

## Testing Strategy

### Unit Testing

**Domain Layer:**
```java
@Test
void should_UpdateTitle_When_ValidTitle() {
    Course course = new Course("Old Title", "Description", 
                               instructorId, StructureType.LINEAR);
    
    course.updateTitle("New Title");
    
    assertEquals("New Title", course.getTitle());
}
```

**Use Case Layer:**
```java
@Test
void should_CreateCourse_When_ValidCommand() {
    // Given
    CreateCourseCommand command = new CreateCourseCommand(...);
    when(courseRepository.existsByTitle(any())).thenReturn(false);
    when(courseRepository.save(any())).thenReturn(course);
    
    // When
    Course result = courseService.create(command);
    
    // Then
    assertNotNull(result);
    verify(courseRepository).save(any());
}
```

**Infrastructure Layer:**
```java
@DataJpaTest
class JpaCourseRepositoryTest {
    
    @Test
    void should_SaveAndRetrieveCourse() {
        Course course = new Course(...);
        
        Course saved = jpaRepository.save(course);
        Optional<Course> found = jpaRepository.findById(saved.getCourseId());
        
        assertTrue(found.isPresent());
        assertEquals(course.getTitle(), found.get().getTitle());
    }
}
```

### Integration Testing

**Controller Layer:**
```java
@SpringBootTest
@AutoConfigureMockMvc
class CourseControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void should_CreateCourse_When_ValidRequest() throws Exception {
        String requestBody = """
            {
                "title": "Test Course",
                "description": "Test Description",
                "instructor_id": "550e8400-e29b-41d4-a716-446655440000",
                "structure_type": "LINEAR"
            }
            """;
        
        mockMvc.perform(post("/api/courses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.error_code").value(0))
                .andExpect(jsonPath("$.data.title").value("Test Course"));
    }
}
```

---

## Deployment Architecture

### Docker Support

**Dockerfile.dev:**
```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8090
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**docker-compose.dev.yml:**
```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: co3065
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "8090:8090"
    depends_on:
      - postgres
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/co3065
      SPRING_DATASOURCE_USERNAME: admin
      SPRING_DATASOURCE_PASSWORD: admin123

volumes:
  postgres_data:
```

---

## Hướng dẫn áp dụng vào dự án mới

### Step 1: Xác định Domain Model

```java
// Pure Java - No annotations
public class Product {
    private UUID productId;
    private String name;
    private BigDecimal price;
    
    // Constructor, getters, business methods
    public boolean isValid() {
        return name != null && price.compareTo(BigDecimal.ZERO) > 0;
    }
}
```

### Step 2: Tạo Repository Interface (Port Out)

```java
public interface ProductRepository {
    Product save(Product product);
    Optional<Product> findById(UUID productId);
    List<Product> findAll();
}
```

### Step 3: Tạo Use Case Interface (Port In)

```java
public interface ProductUseCase {
    Product create(CreateProductCommand command);
    Optional<Product> detail(UUID productId);
    List<Product> list();
}
```

### Step 4: Implement Use Case (Service)

```java
@Service
@Transactional
public class ProductService implements ProductUseCase {
    
    private final ProductRepository productRepository;
    
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }
    
    @Override
    public Product create(CreateProductCommand command) {
        // Business validation
        // Create domain object
        // Save via repository
        Product product = new Product(command.getName(), command.getPrice());
        if (!product.isValid()) {
            throw new IllegalArgumentException("Invalid product");
        }
        return productRepository.save(product);
    }
}
```

### Step 5: Implement Repository (Adapter Out)

```java
@Repository
public class JpaProductRepository implements ProductRepository {
    
    private final SpringDataProductRepository springDataRepository;
    
    @Override
    public Product save(Product product) {
        ProductEntity entity = ProductMapper.toEntity(product);
        ProductEntity saved = springDataRepository.save(entity);
        return ProductMapper.toDomain(saved);
    }
}

// Spring Data JPA interface
public interface SpringDataProductRepository 
        extends JpaRepository<ProductEntity, UUID> {
}

// JPA Entity
@Entity
@Table(name = "products")
public class ProductEntity {
    @Id
    private UUID productId;
    private String name;
    private BigDecimal price;
    // Getters and Setters
}
```

### Step 6: Tạo Controller (Adapter In)

```java
@RestController
@RequestMapping("/api/products")
public class ProductController {
    
    private final ProductUseCase productUseCase;
    
    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> create(
            @RequestBody CreateProductRequest request) {
        
        Product product = productUseCase.create(
            CommandBuilder.toCreateProductCommand(request)
        );
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created", 
                      ProductResponseBuilder.toResponse(product)));
    }
}
```

---

## Common Anti-Patterns và Cách tránh

### ❌ DON'T

**1. Domain model phụ thuộc vào framework:**
```java
// BAD - Domain with JPA annotations
@Entity
public class Course {
    @Id
    private UUID courseId;
}
```

**2. Use case gọi trực tiếp Spring Data JPA:**
```java
// BAD - Use case depend on infrastructure
@Service
public class CourseService {
    private final SpringDataCourseRepository springDataRepository; // Wrong!
}
```

**3. Controller chứa business logic:**
```java
// BAD - Business logic in controller
@PostMapping
public ResponseEntity<?> create(@RequestBody CreateCourseRequest request) {
    if (request.getTitle() == null) { // Validation logic
        return ResponseEntity.badRequest().build();
    }
    // More business logic...
}
```

**4. Expose domain objects qua API:**
```java
// BAD - Expose domain directly
@GetMapping("/{id}")
public ResponseEntity<Course> get(@PathVariable UUID id) {
    return ResponseEntity.ok(course); // Exposes domain!
}
```

### ✅ DO

**1. Pure domain model:**
```java
// GOOD - Pure Java
public class Course {
    private UUID courseId;
    // No annotations, pure business logic
}
```

**2. Use case depend on interface:**
```java
// GOOD - Depend on abstraction
@Service
public class CourseService implements CourseUseCase {
    private final CourseRepository courseRepository; // Interface!
}
```

**3. Business logic trong use case:**
```java
// GOOD - Business logic in service
@Service
public class CourseService {
    public Course create(CreateCourseCommand command) {
        // All business logic here
    }
}
```

**4. Use DTOs cho API:**
```java
// GOOD - Use DTOs
@GetMapping("/{id}")
public ResponseEntity<ApiResponse<CourseResponse>> get(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.success(
        CourseResponseBuilder.toResponse(course)
    ));
}
```

---

## Checklist khi tạo feature mới

- [ ] Tạo Domain Model (pure Java, no annotations)
- [ ] Tạo Repository Interface (port out)
- [ ] Tạo Use Case Interface (port in)
- [ ] Tạo Service Implementation (business logic)
- [ ] Tạo Command/Criteria objects
- [ ] Tạo JPA Entity với annotations
- [ ] Implement Repository (JPA adapter)
- [ ] Tạo Mapper (Domain ↔ Entity)
- [ ] Tạo Specification (nếu cần dynamic queries)
- [ ] Tạo Request/Response DTOs
- [ ] Tạo Controller (HTTP adapter)
- [ ] Tạo Response Builder
- [ ] Add exception handling
- [ ] Write unit tests
- [ ] Write integration tests

---

## Domain Models (Entities)

Dự án quản lý các domain sau:

### Course
- **Aggregate Root**: Khóa học
- **Fields**: courseId, title, description, instructorId, structureType (LINEAR/ADAPTIVE)
- **Business Logic**: Validation, update methods

### Chapter
- **Aggregate**: Chương học thuộc course
- **Fields**: chapterId, courseId, title, orderIndex, prerequisiteChapterIds

### ContentUnit
- **Aggregate**: Unit nội dung thuộc chapter
- **Fields**: unitId, chapterId, unitType, metadataConfig
- **Types**: LESSON, QUIZ, ASSIGNMENT

### ContentVersion
- **Entity**: Phiên bản nội dung
- **Fields**: versionId, unitId, versionNumber, content, status

### Test
- **Entity**: Bài kiểm tra
- **Fields**: testId, title, questions, duration

### MetadataTag
- **Value Object**: Tag metadata
- **Fields**: tagId, tagName, tagType

### PathCondition
- **Entity**: Điều kiện path trong adaptive learning

### UnitTag
- **Association**: Many-to-many relationship giữa ContentUnit và MetadataTag

---

## Tổng kết

### Ưu điểm của kiến trúc này:

✅ **Clean Architecture**: Tách biệt rõ ràng business logic và infrastructure  
✅ **Testability**: Domain logic dễ test (không cần Spring context)  
✅ **Flexibility**: Dễ dàng swap implementations (database, framework)  
✅ **Maintainability**: Code rõ ràng, dễ maintain  
✅ **Scalability**: Structure hỗ trợ scale tốt  
✅ **Domain-Driven Design**: Focus vào business logic  
✅ **SOLID Principles**: Tuân thủ các nguyên tắc SOLID  
✅ **Best Practices**: Follow industry standards  

### Khi nào nên dùng kiến trúc này:

- Dự án phức tạp với nhiều business rules
- Dự án dài hạn cần maintainability
- Team lớn cần clear boundaries
- Hệ thống cần flexibility (swap database, framework)
- Domain logic quan trọng và cần độc lập

### Khi nào không nên dùng:

- Dự án nhỏ, đơn giản (CRUD only)
- Prototype/MVP nhanh
- Team nhỏ, short-term project
- Simple business logic

---

**Document Version**: 1.0  
**Last Updated**: October 30, 2025  
**Author**: AI Coach Architecture Team  
**Based on**: Clean Architecture by Robert C. Martin (Uncle Bob)

