# Module Development Guide

> **AI Coach Project - Developer Onboarding Guide**
> Learn how to create new modules following the established architecture patterns

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Creating a New Module - Step by Step](#creating-a-new-module---step-by-step)
4. [Common Patterns](#common-patterns)
5. [Testing Your Module](#testing-your-module)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

This project follows **Hexagonal Architecture** (Ports & Adapters pattern) with clear separation of concerns:

```
External World (HTTP, DB, MinIO, RabbitMQ)
         ↓
    Adapters (Controllers, Repositories)
         ↓
    Ports (Use Case Interfaces)
         ↓
Core Domain (Business Logic, Models)
```

### Key Principles

1. **Business logic is independent** - Core use cases don't depend on frameworks
2. **Ports define contracts** - Interfaces for input/output operations
3. **Adapters implement ports** - Concrete implementations (REST, JPA, MinIO, etc.)
4. **Dependency injection** - Spring wires everything together

### Directory Structure Convention

```
src/main/java/com/aicoach/
├── cmd/                  # Application entry points
├── adapter/              # Input adapters (Controllers)
├── usecase/              # Business logic (Ports + Services)
├── models/               # Domain models
├── repository/           # Output adapters (Storage, DB)
├── messaging/            # Message producers/consumers
└── config/               # Spring configuration
```

---

## Development Environment Setup

### Prerequisites

- Docker & Docker Compose
- Java 17
- Maven 3.9+
- IDE with Lombok support (IntelliJ IDEA recommended)

### Quick Start

```bash
# 1. Start all infrastructure services
make dev-up

# 2. Enter development container
make dev-shell

# 3. Inside container, run API service
make run-api

# 4. In another terminal, run consumer service
make run-consumer
```

### Verify Setup

```bash
# Check API is running
curl http://localhost:8090/api/cv/supported-types

# Check Swagger UI
open http://localhost:8090/swagger-ui.html

# Check RabbitMQ
open http://localhost:15672  # admin/admin123
```

---

## Creating a New Module - Step by Step

Let's create a **Skill Analysis Module** that analyzes CV text and extracts skills.

### Example Module Structure

```
com.aicoach/
├── adapter/http/
│   ├── SkillAnalysisController.java      # REST endpoints
│   └── dto/
│       └── SkillAnalysisResponse.java    # Response DTO
├── usecase/
│   ├── SkillAnalysisUseCase.java         # Port (interface)
│   └── service/
│       └── SkillAnalysisService.java     # Business logic
├── models/
│   ├── SkillAnalysis.java                # Domain model
│   └── SkillAnalysisTask.java            # Message model
├── repository/
│   ├── SkillRepository.java              # Port (interface)
│   └── postgresql/
│       ├── SkillAnalysisRepository.java  # JPA repository
│       └── entity/
│           └── SkillAnalysisEntity.java  # DB entity
├── messaging/
│   ├── SkillAnalysisProducer.java
│   └── SkillAnalysisConsumer.java
└── config/
    └── SkillAnalysisConfig.java
```

---

### Step 1: Create Domain Model

**Location**: `src/main/java/com/aicoach/models/SkillAnalysis.java`

```java
package com.aicoach.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Domain model representing skill analysis result
 * This is framework-agnostic and contains business logic
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillAnalysis {
    private UUID id;
    private UUID fileId;
    private List<String> technicalSkills;
    private List<String> softSkills;
    private List<String> languages;
    private Integer yearsOfExperience;
    private LocalDateTime analyzedAt;

    /**
     * Business logic: Calculate skill score
     */
    public int calculateSkillScore() {
        int score = 0;
        score += technicalSkills.size() * 2;
        score += softSkills.size();
        score += languages.size();
        score += Math.min(yearsOfExperience, 20);
        return score;
    }

    /**
     * Business logic: Check if candidate is experienced
     */
    public boolean isExperienced() {
        return yearsOfExperience >= 3;
    }
}
```

**Key Points**:
- Use Lombok annotations (`@Data`, `@Builder`) to reduce boilerplate
- Domain models should be **pure Java** (no Spring/JPA annotations)
- Put business logic methods inside domain models
- Use `java.time` API for dates

---

### Step 2: Define Use Case Port (Interface)

**Location**: `src/main/java/com/aicoach/usecase/SkillAnalysisUseCase.java`

```java
package com.aicoach.usecase;

import com.aicoach.models.SkillAnalysis;

import java.util.UUID;

/**
 * Port: Business logic interface for skill analysis
 *
 * This interface defines what operations are available,
 * but not HOW they are implemented (implementation details).
 */
public interface SkillAnalysisUseCase {

    /**
     * Analyze CV text and extract skills
     *
     * @param fileId The uploaded file ID
     * @return Skill analysis result
     */
    SkillAnalysis analyzeSkills(UUID fileId);

    /**
     * Get skill analysis by ID
     *
     * @param analysisId The analysis ID
     * @return Skill analysis result or null if not found
     */
    SkillAnalysis getAnalysisById(UUID analysisId);

    /**
     * Publish skill analysis task to message queue
     *
     * @param fileId The file to analyze
     */
    void publishAnalysisTask(UUID fileId);
}
```

**Key Points**:
- Interfaces define **contracts** (what, not how)
- Use domain models as input/output (not DTOs or entities)
- Keep interfaces focused (single responsibility)
- Document expected behavior with Javadoc

---

### Step 3: Implement Use Case Service

**Location**: `src/main/java/com/aicoach/usecase/service/SkillAnalysisService.java`

```java
package com.aicoach.usecase.service;

import com.aicoach.messaging.SkillAnalysisProducer;
import com.aicoach.models.SkillAnalysis;
import com.aicoach.models.SkillAnalysisTask;
import com.aicoach.repository.SkillRepository;
import com.aicoach.repository.postgresql.ExtractionResultRepository;
import com.aicoach.repository.postgresql.entity.ExtractionResultEntity;
import com.aicoach.usecase.SkillAnalysisUseCase;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service: Implements skill analysis business logic
 *
 * This is where the actual work happens. The service:
 * 1. Orchestrates different components (repositories, producers)
 * 2. Implements business logic
 * 3. Handles transactions
 */
@Service
@Transactional
@Slf4j
public class SkillAnalysisService implements SkillAnalysisUseCase {

    private final SkillRepository skillRepository;
    private final ExtractionResultRepository extractionResultRepository;
    private final SkillAnalysisProducer skillAnalysisProducer;

    // Known technical skills (in real app, load from database)
    private static final List<String> KNOWN_TECH_SKILLS = List.of(
        "Java", "Spring", "Docker", "Kubernetes", "PostgreSQL",
        "Python", "React", "Node.js", "AWS", "Azure"
    );

    /**
     * Constructor injection (Spring autowires dependencies)
     */
    public SkillAnalysisService(
            SkillRepository skillRepository,
            ExtractionResultRepository extractionResultRepository,
            SkillAnalysisProducer skillAnalysisProducer) {
        this.skillRepository = skillRepository;
        this.extractionResultRepository = extractionResultRepository;
        this.skillAnalysisProducer = skillAnalysisProducer;
    }

    @Override
    public SkillAnalysis analyzeSkills(UUID fileId) {
        log.info("Analyzing skills for file: {}", fileId);

        // 1. Retrieve extracted text from database
        ExtractionResultEntity extraction = extractionResultRepository
            .findByFileId(fileId)
            .orElseThrow(() -> new RuntimeException("Extraction not found for file: " + fileId));

        String cvText = extraction.getRawText();

        // 2. Extract skills using NLP/regex (simplified example)
        List<String> technicalSkills = extractTechnicalSkills(cvText);
        List<String> softSkills = extractSoftSkills(cvText);
        List<String> languages = extractLanguages(cvText);
        Integer experience = extractYearsOfExperience(cvText);

        // 3. Build domain model
        SkillAnalysis analysis = SkillAnalysis.builder()
            .id(UUID.randomUUID())
            .fileId(fileId)
            .technicalSkills(technicalSkills)
            .softSkills(softSkills)
            .languages(languages)
            .yearsOfExperience(experience)
            .analyzedAt(LocalDateTime.now())
            .build();

        // 4. Persist to database via repository
        skillRepository.save(analysis);

        log.info("Skill analysis completed. Score: {}", analysis.calculateSkillScore());

        return analysis;
    }

    @Override
    public SkillAnalysis getAnalysisById(UUID analysisId) {
        return skillRepository.findById(analysisId);
    }

    @Override
    public void publishAnalysisTask(UUID fileId) {
        log.info("Publishing skill analysis task for file: {}", fileId);

        SkillAnalysisTask task = SkillAnalysisTask.builder()
            .taskId(UUID.randomUUID().toString())
            .fileId(fileId)
            .createdAt(LocalDateTime.now())
            .build();

        skillAnalysisProducer.sendTask(task);
    }

    // ===== Private helper methods (business logic) =====

    private List<String> extractTechnicalSkills(String text) {
        List<String> found = new ArrayList<>();
        String lowerText = text.toLowerCase();

        for (String skill : KNOWN_TECH_SKILLS) {
            if (lowerText.contains(skill.toLowerCase())) {
                found.add(skill);
            }
        }

        return found;
    }

    private List<String> extractSoftSkills(String text) {
        // Simplified: Look for common soft skill keywords
        List<String> skills = new ArrayList<>();
        if (text.contains("leadership")) skills.add("Leadership");
        if (text.contains("teamwork")) skills.add("Teamwork");
        if (text.contains("communication")) skills.add("Communication");
        return skills;
    }

    private List<String> extractLanguages(String text) {
        List<String> languages = new ArrayList<>();
        if (text.matches("(?i).*\\benglish\\b.*")) languages.add("English");
        if (text.matches("(?i).*\\bvietnamese\\b.*")) languages.add("Vietnamese");
        if (text.matches("(?i).*\\bjapanese\\b.*")) languages.add("Japanese");
        return languages;
    }

    private Integer extractYearsOfExperience(String text) {
        // Extract "X years of experience" pattern
        Pattern pattern = Pattern.compile("(\\d+)\\s+years?\\s+(?:of\\s+)?experience", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);

        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }

        return 0;
    }
}
```

**Key Points**:
- Annotate with `@Service` to register as Spring bean
- Use `@Transactional` for database operations
- Constructor injection (no `@Autowired` needed)
- Log important operations with `@Slf4j`
- Keep business logic in service classes
- Extract private helper methods for readability

---

### Step 4: Create Database Entity

**Location**: `src/main/java/com/aicoach/repository/postgresql/entity/SkillAnalysisEntity.java`

```java
package com.aicoach.repository.postgresql.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * JPA Entity for skill_analysis table
 *
 * Entities are the database representation of domain models.
 * They should be kept in the repository layer.
 */
@Entity
@Table(name = "skill_analysis")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillAnalysisEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "file_id", nullable = false)
    private UUID fileId;

    @Column(name = "technical_skills", columnDefinition = "TEXT")
    private String technicalSkills;  // JSON array as string

    @Column(name = "soft_skills", columnDefinition = "TEXT")
    private String softSkills;  // JSON array as string

    @Column(name = "languages", columnDefinition = "TEXT")
    private String languages;  // JSON array as string

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "analyzed_at", nullable = false)
    private LocalDateTime analyzedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    /**
     * JPA lifecycle callback: Set timestamps before persist
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    /**
     * JPA lifecycle callback: Update timestamp before update
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

**Key Points**:
- Use JPA annotations (`@Entity`, `@Table`, `@Column`)
- Always include audit fields (`created_at`, `updated_at`)
- Support soft delete with `deleted_at` field
- Use `@PrePersist` and `@PreUpdate` for timestamps
- Store JSON arrays as TEXT (parse in mapper)

---

### Step 5: Create JPA Repository

**Location**: `src/main/java/com/aicoach/repository/postgresql/SkillAnalysisRepository.java`

```java
package com.aicoach.repository.postgresql;

import com.aicoach.repository.postgresql.entity.SkillAnalysisEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * JPA Repository for skill_analysis table
 *
 * Spring Data JPA automatically implements this interface.
 * Just define method signatures and Spring generates implementations.
 */
@Repository
public interface SkillAnalysisRepository extends JpaRepository<SkillAnalysisEntity, UUID> {

    /**
     * Find skill analysis by file ID (Spring query derivation)
     */
    Optional<SkillAnalysisEntity> findByFileId(UUID fileId);

    /**
     * Find all analyses excluding soft deleted records
     */
    List<SkillAnalysisEntity> findByDeletedAtIsNull();

    /**
     * Find analyses by minimum years of experience
     */
    List<SkillAnalysisEntity> findByYearsOfExperienceGreaterThanEqualAndDeletedAtIsNull(
        Integer minYears
    );

    /**
     * Custom JPQL query: Find top skilled candidates
     */
    @Query("SELECT s FROM SkillAnalysisEntity s " +
           "WHERE s.deletedAt IS NULL " +
           "ORDER BY s.yearsOfExperience DESC, SIZE(s.technicalSkills) DESC")
    List<SkillAnalysisEntity> findTopCandidates();

    /**
     * Native SQL query: Count analyses by file ID
     */
    @Query(value = "SELECT COUNT(*) FROM skill_analysis WHERE file_id = :fileId AND deleted_at IS NULL",
           nativeQuery = true)
    Long countByFileId(@Param("fileId") UUID fileId);
}
```

**Key Points**:
- Extend `JpaRepository<Entity, ID>` for CRUD operations
- Use method naming conventions for automatic query generation
- Use `@Query` for complex queries (JPQL or native SQL)
- Always filter out soft-deleted records (`deletedAt IS NULL`)

---

### Step 6: Create Repository Port & Adapter

**Port (Interface)**: `src/main/java/com/aicoach/repository/SkillRepository.java`

```java
package com.aicoach.repository;

import com.aicoach.models.SkillAnalysis;

import java.util.List;
import java.util.UUID;

/**
 * Port: Repository interface for skill analysis
 *
 * This is the contract that the domain layer expects.
 * It uses domain models, NOT entities.
 */
public interface SkillRepository {

    void save(SkillAnalysis analysis);

    SkillAnalysis findById(UUID id);

    List<SkillAnalysis> findByFileId(UUID fileId);

    List<SkillAnalysis> findAll();
}
```

**Adapter (Implementation)**: `src/main/java/com/aicoach/repository/postgresql/SkillRepositoryImpl.java`

```java
package com.aicoach.repository.postgresql;

import com.aicoach.models.SkillAnalysis;
import com.aicoach.repository.SkillRepository;
import com.aicoach.repository.postgresql.entity.SkillAnalysisEntity;
import com.aicoach.repository.postgresql.mapper.SkillAnalysisMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adapter: PostgreSQL implementation of SkillRepository
 *
 * This adapter:
 * 1. Wraps JPA repository
 * 2. Converts between domain models and entities
 * 3. Implements the port interface
 */
@Component
@Slf4j
public class SkillRepositoryImpl implements SkillRepository {

    private final SkillAnalysisRepository jpaRepository;
    private final SkillAnalysisMapper mapper;

    public SkillRepositoryImpl(
            SkillAnalysisRepository jpaRepository,
            SkillAnalysisMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(SkillAnalysis analysis) {
        log.debug("Saving skill analysis: {}", analysis.getId());

        // Convert domain model → entity
        SkillAnalysisEntity entity = mapper.toEntity(analysis);

        // Save via JPA
        jpaRepository.save(entity);
    }

    @Override
    public SkillAnalysis findById(UUID id) {
        return jpaRepository.findById(id)
            .map(mapper::toDomain)  // Convert entity → domain model
            .orElse(null);
    }

    @Override
    public List<SkillAnalysis> findByFileId(UUID fileId) {
        return jpaRepository.findByFileId(fileId)
            .stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public List<SkillAnalysis> findAll() {
        return jpaRepository.findByDeletedAtIsNull()
            .stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }
}
```

**Mapper**: `src/main/java/com/aicoach/repository/postgresql/mapper/SkillAnalysisMapper.java`

```java
package com.aicoach.repository.postgresql.mapper;

import com.aicoach.models.SkillAnalysis;
import com.aicoach.repository.postgresql.entity.SkillAnalysisEntity;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Mapper: Convert between domain models and entities
 *
 * Handles JSON serialization for list fields.
 */
@Component
public class SkillAnalysisMapper {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Domain model → Entity
     */
    public SkillAnalysisEntity toEntity(SkillAnalysis domain) {
        return SkillAnalysisEntity.builder()
            .id(domain.getId())
            .fileId(domain.getFileId())
            .technicalSkills(toJson(domain.getTechnicalSkills()))
            .softSkills(toJson(domain.getSoftSkills()))
            .languages(toJson(domain.getLanguages()))
            .yearsOfExperience(domain.getYearsOfExperience())
            .analyzedAt(domain.getAnalyzedAt())
            .build();
    }

    /**
     * Entity → Domain model
     */
    public SkillAnalysis toDomain(SkillAnalysisEntity entity) {
        return SkillAnalysis.builder()
            .id(entity.getId())
            .fileId(entity.getFileId())
            .technicalSkills(fromJson(entity.getTechnicalSkills()))
            .softSkills(fromJson(entity.getSoftSkills()))
            .languages(fromJson(entity.getLanguages()))
            .yearsOfExperience(entity.getYearsOfExperience())
            .analyzedAt(entity.getAnalyzedAt())
            .build();
    }

    // Helper methods for JSON conversion

    private String toJson(List<String> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize list to JSON", e);
        }
    }

    private List<String> fromJson(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to deserialize JSON to list", e);
        }
    }
}
```

**Key Points**:
- **Port** (interface) uses domain models
- **Adapter** (implementation) wraps JPA repository
- **Mapper** converts between domain models and entities
- Keep entities isolated in repository layer

---

### Step 7: Create REST Controller & DTOs

**DTO (Response)**: `src/main/java/com/aicoach/adapter/http/dto/SkillAnalysisResponse.java`

```java
package com.aicoach.adapter.http.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO: Data Transfer Object for HTTP responses
 *
 * DTOs are different from domain models:
 * - DTOs are for API contracts (JSON serialization)
 * - Domain models are for business logic
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillAnalysisResponse {
    private UUID analysisId;
    private UUID fileId;
    private List<String> technicalSkills;
    private List<String> softSkills;
    private List<String> languages;
    private Integer yearsOfExperience;
    private Integer skillScore;
    private boolean experienced;
    private LocalDateTime analyzedAt;
}
```

**Controller**: `src/main/java/com/aicoach/adapter/http/SkillAnalysisController.java`

```java
package com.aicoach.adapter.http;

import com.aicoach.adapter.http.dto.ApiResponse;
import com.aicoach.adapter.http.dto.SkillAnalysisResponse;
import com.aicoach.models.SkillAnalysis;
import com.aicoach.usecase.SkillAnalysisUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller: REST API endpoints for skill analysis
 *
 * Responsibilities:
 * 1. Handle HTTP requests/responses
 * 2. Validate input
 * 3. Call use case methods
 * 4. Convert domain models to DTOs
 * 5. Return appropriate HTTP status codes
 */
@RestController
@RequestMapping("/api/skills")
@Tag(name = "Skill Analysis", description = "CV skill extraction and analysis APIs")
@Slf4j
public class SkillAnalysisController {

    private final SkillAnalysisUseCase skillAnalysisUseCase;

    public SkillAnalysisController(SkillAnalysisUseCase skillAnalysisUseCase) {
        this.skillAnalysisUseCase = skillAnalysisUseCase;
    }

    /**
     * POST /api/skills/analyze/{fileId}
     * Analyze skills synchronously
     */
    @PostMapping("/analyze/{fileId}")
    @Operation(summary = "Analyze CV skills",
               description = "Extract and analyze skills from uploaded CV file")
    public ResponseEntity<ApiResponse<SkillAnalysisResponse>> analyzeSkills(
            @PathVariable("fileId") UUID fileId) {

        log.info("Received skill analysis request for file: {}", fileId);

        try {
            // Call use case
            SkillAnalysis analysis = skillAnalysisUseCase.analyzeSkills(fileId);

            // Convert domain model → DTO
            SkillAnalysisResponse response = toDto(analysis);

            // Return success response
            return ResponseEntity.ok(
                ApiResponse.success("Analysis completed successfully", response)
            );

        } catch (Exception e) {
            log.error("Failed to analyze skills for file: {}", fileId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500, "Skill analysis failed: " + e.getMessage()));
        }
    }

    /**
     * POST /api/skills/analyze-async/{fileId}
     * Publish analysis task to queue (async)
     */
    @PostMapping("/analyze-async/{fileId}")
    @Operation(summary = "Analyze CV skills asynchronously",
               description = "Publish skill analysis task to message queue for background processing")
    public ResponseEntity<ApiResponse<Void>> analyzeSkillsAsync(
            @PathVariable("fileId") UUID fileId) {

        log.info("Received async skill analysis request for file: {}", fileId);

        try {
            skillAnalysisUseCase.publishAnalysisTask(fileId);

            return ResponseEntity.accepted()
                .body(ApiResponse.success("Analysis task accepted", null));

        } catch (Exception e) {
            log.error("Failed to publish analysis task for file: {}", fileId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500, "Failed to publish task: " + e.getMessage()));
        }
    }

    /**
     * GET /api/skills/analysis/{analysisId}
     * Retrieve analysis by ID
     */
    @GetMapping("/analysis/{analysisId}")
    @Operation(summary = "Get skill analysis by ID")
    public ResponseEntity<ApiResponse<SkillAnalysisResponse>> getAnalysis(
            @PathVariable("analysisId") UUID analysisId) {

        log.info("Retrieving skill analysis: {}", analysisId);

        SkillAnalysis analysis = skillAnalysisUseCase.getAnalysisById(analysisId);

        if (analysis == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(404, "Analysis not found"));
        }

        SkillAnalysisResponse response = toDto(analysis);
        return ResponseEntity.ok(ApiResponse.success("Analysis retrieved", response));
    }

    // ===== Private helper methods =====

    private SkillAnalysisResponse toDto(SkillAnalysis domain) {
        return SkillAnalysisResponse.builder()
            .analysisId(domain.getId())
            .fileId(domain.getFileId())
            .technicalSkills(domain.getTechnicalSkills())
            .softSkills(domain.getSoftSkills())
            .languages(domain.getLanguages())
            .yearsOfExperience(domain.getYearsOfExperience())
            .skillScore(domain.calculateSkillScore())
            .experienced(domain.isExperienced())
            .analyzedAt(domain.getAnalyzedAt())
            .build();
    }
}
```

**Key Points**:
- Annotate with `@RestController` and `@RequestMapping`
- Use `@Operation` for Swagger documentation
- Convert domain models to DTOs before returning
- Use `ApiResponse` wrapper for consistent response format
- Return appropriate HTTP status codes
- Log all important operations

---

### Step 8: Create Message Model

**Location**: `src/main/java/com/aicoach/models/SkillAnalysisTask.java`

```java
package com.aicoach.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Message model for RabbitMQ
 *
 * Represents a skill analysis task to be processed asynchronously.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillAnalysisTask implements Serializable {
    private static final long serialVersionUID = 1L;

    private String taskId;
    private UUID fileId;
    private LocalDateTime createdAt;
    private Integer retryCount;

    public void incrementRetry() {
        this.retryCount = (this.retryCount == null) ? 1 : this.retryCount + 1;
    }
}
```

---

### Step 9: Create Message Producer

**Location**: `src/main/java/com/aicoach/messaging/SkillAnalysisProducer.java`

```java
package com.aicoach.messaging;

import com.aicoach.models.SkillAnalysisTask;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

/**
 * Producer: Publishes skill analysis tasks to RabbitMQ
 */
@Component
@Slf4j
public class SkillAnalysisProducer {

    private final RabbitTemplate rabbitTemplate;

    // Exchange and routing key (configured in RabbitMQConfig)
    private static final String EXCHANGE = "skill.analysis.exchange";
    private static final String ROUTING_KEY = "skill.analysis";

    public SkillAnalysisProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    /**
     * Send skill analysis task to queue
     */
    public void sendTask(SkillAnalysisTask task) {
        log.info("Publishing skill analysis task: {}", task.getTaskId());

        try {
            rabbitTemplate.convertAndSend(EXCHANGE, ROUTING_KEY, task);
            log.info("Task published successfully: {}", task.getTaskId());

        } catch (Exception e) {
            log.error("Failed to publish task: {}", task.getTaskId(), e);
            throw new RuntimeException("Failed to publish task to queue", e);
        }
    }
}
```

---

### Step 10: Create Message Consumer

**Location**: `src/main/java/com/aicoach/messaging/SkillAnalysisConsumer.java`

```java
package com.aicoach.messaging;

import com.aicoach.models.SkillAnalysis;
import com.aicoach.models.SkillAnalysisTask;
import com.aicoach.usecase.SkillAnalysisUseCase;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Consumer: Listens to skill analysis queue and processes tasks
 *
 * IMPORTANT: Only active in 'consumer' profile!
 */
@Component
@Profile("consumer")  // Only load in consumer profile
@Slf4j
public class SkillAnalysisConsumer {

    private final SkillAnalysisUseCase skillAnalysisUseCase;

    private static final int MAX_RETRIES = 3;

    public SkillAnalysisConsumer(SkillAnalysisUseCase skillAnalysisUseCase) {
        this.skillAnalysisUseCase = skillAnalysisUseCase;
    }

    /**
     * Process skill analysis tasks from queue
     */
    @RabbitListener(queues = "skill.analysis.queue")
    public void processTask(SkillAnalysisTask task) {
        log.info("Received skill analysis task: {}", task.getTaskId());

        try {
            // Perform skill analysis
            SkillAnalysis result = skillAnalysisUseCase.analyzeSkills(task.getFileId());

            log.info("Skill analysis completed: {} (Score: {})",
                result.getId(), result.calculateSkillScore());

        } catch (Exception e) {
            log.error("Failed to process skill analysis task: {}", task.getTaskId(), e);

            // Retry logic
            task.incrementRetry();

            if (task.getRetryCount() < MAX_RETRIES) {
                log.warn("Retrying task {} (attempt {})", task.getTaskId(), task.getRetryCount());
                throw new RuntimeException("Retry task", e);  // Re-queue message
            } else {
                log.error("Task {} exceeded max retries, sending to DLQ", task.getTaskId());
                // Message will go to Dead Letter Queue
            }
        }
    }
}
```

**Key Points**:
- Use `@RabbitListener(queues = "...")` to consume messages
- Add `@Profile("consumer")` to only load in consumer service
- Implement retry logic with maximum retry count
- Throw exception to re-queue message (if retries remain)

---

### Step 11: Configure RabbitMQ Queues

**Location**: Add to `src/main/java/com/aicoach/config/RabbitMQConfig.java`

```java
// Add these beans to existing RabbitMQConfig class

@Bean
public DirectExchange skillAnalysisExchange() {
    return new DirectExchange("skill.analysis.exchange", true, false);
}

@Bean
public Queue skillAnalysisQueue() {
    return QueueBuilder.durable("skill.analysis.queue")
        .withArgument("x-message-ttl", 300000)  // 5 minutes
        .withArgument("x-dead-letter-exchange", "skill.analysis.dlx")
        .build();
}

@Bean
public Queue skillAnalysisDLQ() {
    return QueueBuilder.durable("skill.analysis.dlq").build();
}

@Bean
public DirectExchange skillAnalysisDLX() {
    return new DirectExchange("skill.analysis.dlx", true, false);
}

@Bean
public Binding skillAnalysisBinding() {
    return BindingBuilder
        .bind(skillAnalysisQueue())
        .to(skillAnalysisExchange())
        .with("skill.analysis");
}

@Bean
public Binding skillAnalysisDLQBinding() {
    return BindingBuilder
        .bind(skillAnalysisDLQ())
        .to(skillAnalysisDLX())
        .with("skill.analysis");
}
```

**Key Points**:
- Create exchange, queue, and Dead Letter Queue (DLQ)
- Set message TTL (time-to-live)
- Configure DLX (Dead Letter Exchange) for failed messages
- Create bindings to connect exchanges and queues

---

### Step 12: Create Database Migration

**Location**: `src/main/resources/sql/V3__create_skill_analysis_table.sql`

```sql
-- Migration: Create skill_analysis table

CREATE TABLE IF NOT EXISTS skill_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL,
    technical_skills TEXT,
    soft_skills TEXT,
    languages TEXT,
    years_of_experience INTEGER,
    analyzed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_skill_analysis_file
        FOREIGN KEY (file_id)
        REFERENCES uploaded_file(file_id)
        ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_skill_analysis_file_id ON skill_analysis(file_id);
CREATE INDEX idx_skill_analysis_deleted_at ON skill_analysis(deleted_at);
CREATE INDEX idx_skill_analysis_years_exp ON skill_analysis(years_of_experience);

-- Add comment for documentation
COMMENT ON TABLE skill_analysis IS 'Stores CV skill analysis results';
COMMENT ON COLUMN skill_analysis.technical_skills IS 'JSON array of technical skills';
COMMENT ON COLUMN skill_analysis.soft_skills IS 'JSON array of soft skills';
```

**Key Points**:
- Use Flyway naming convention: `V{version}__{description}.sql`
- Always use `CREATE TABLE IF NOT EXISTS`
- Add foreign key constraints
- Create indexes for frequently queried columns
- Add comments for documentation

---

### Step 13: Test Your Module

See [Testing Your Module](#testing-your-module) section below for complete testing guide.

---

## Common Patterns

### Pattern 1: Adding a New File Extractor

**Example**: Add support for `.txt` files

1. **Create extractor class**:
```java
@Component
public class TxtExtractor implements FileExtractor {
    @Override
    public String extractText(InputStream inputStream, String fileName) throws Exception {
        return new BufferedReader(new InputStreamReader(inputStream))
            .lines()
            .collect(Collectors.joining("\n"));
    }

    @Override
    public boolean supports(String fileName) {
        return fileName != null && fileName.toLowerCase().endsWith(".txt");
    }
}
```

2. **Update FileConstants**:
```java
public static final Set<String> ALLOWED_EXTENSIONS = new HashSet<>(
    Arrays.asList("pdf", "docx", "doc", "txt")
);
```

3. **Spring auto-discovers via `@Component`** - No manual registration needed!

---

### Pattern 2: Adding Global Exception Handling

**Location**: `src/main/java/com/aicoach/adapter/http/GlobalExceptionHandler.java`

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(EntityNotFoundException ex) {
        log.warn("Entity not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(404, ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneral(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error(500, "Internal server error"));
    }
}
```

---

### Pattern 3: Adding Configuration Properties

**Step 1**: Create properties class
```java
@Component
@ConfigurationProperties(prefix = "skill.analysis")
@Data
public class SkillAnalysisProperties {
    private List<String> technicalSkills = new ArrayList<>();
    private Integer minExperience = 0;
    private boolean enableCache = true;
}
```

**Step 2**: Add to `application.yml`
```yaml
skill:
  analysis:
    technical-skills:
      - Java
      - Spring
      - Docker
    min-experience: 1
    enable-cache: true
```

**Step 3**: Inject and use
```java
@Service
public class SkillAnalysisService {
    private final SkillAnalysisProperties properties;

    public SkillAnalysisService(SkillAnalysisProperties properties) {
        this.properties = properties;
    }
}
```

---

### Pattern 4: Adding Validation

Use Bean Validation (JSR-380):

```java
@Data
public class AnalyzeRequest {
    @NotNull(message = "File ID is required")
    private UUID fileId;

    @Min(value = 0, message = "Min experience must be >= 0")
    private Integer minExperience;
}

@PostMapping("/analyze")
public ResponseEntity<?> analyze(@Valid @RequestBody AnalyzeRequest request) {
    // @Valid triggers validation automatically
}
```

---

### Pattern 5: Adding Scheduled Tasks

```java
@Component
@Slf4j
public class SkillAnalysisScheduler {

    @Scheduled(cron = "0 0 2 * * *")  // Run at 2 AM daily
    public void cleanupOldAnalyses() {
        log.info("Running cleanup task...");
        // Cleanup logic
    }
}

// Enable scheduling in main application class
@EnableScheduling
@SpringBootApplication
public class AICoachServiceApplication {
}
```

---

## Testing Your Module

### Unit Testing

**Location**: `src/test/java/com/aicoach/usecase/service/SkillAnalysisServiceTest.java`

```java
@ExtendWith(MockitoExtension.class)
class SkillAnalysisServiceTest {

    @Mock
    private SkillRepository skillRepository;

    @Mock
    private ExtractionResultRepository extractionResultRepository;

    @Mock
    private SkillAnalysisProducer skillAnalysisProducer;

    @InjectMocks
    private SkillAnalysisService skillAnalysisService;

    @Test
    void testAnalyzeSkills_Success() {
        // Given
        UUID fileId = UUID.randomUUID();
        ExtractionResultEntity extraction = new ExtractionResultEntity();
        extraction.setRawText("Java Spring Docker 5 years of experience");

        when(extractionResultRepository.findByFileId(fileId))
            .thenReturn(Optional.of(extraction));

        // When
        SkillAnalysis result = skillAnalysisService.analyzeSkills(fileId);

        // Then
        assertNotNull(result);
        assertTrue(result.getTechnicalSkills().contains("Java"));
        assertEquals(5, result.getYearsOfExperience());
        verify(skillRepository).save(any(SkillAnalysis.class));
    }
}
```

**Run tests**:
```bash
mvn test
# OR
make run-tests
```

---

### Integration Testing

```java
@SpringBootTest
@AutoConfigureMockMvc
class SkillAnalysisControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testAnalyzeSkills_EndToEnd() throws Exception {
        UUID fileId = UUID.randomUUID();

        mockMvc.perform(post("/api/skills/analyze/" + fileId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.error_code").value(0))
            .andExpect(jsonPath("$.data.analysisId").exists());
    }
}
```

---

### Manual API Testing

**Using cURL**:
```bash
# Upload file
curl -X POST http://localhost:8090/api/cv/upload \
  -F "file=@sample_cv.pdf"

# Analyze skills
curl -X POST http://localhost:8090/api/skills/analyze/{fileId}

# Get analysis result
curl http://localhost:8090/api/skills/analysis/{analysisId}
```

**Using Swagger UI**:
```
http://localhost:8090/swagger-ui.html
```

---

### Testing Message Consumers

**Monitor RabbitMQ**:
```
http://localhost:15672
Login: admin/admin123
```

**Check queue stats**:
- Queue depth
- Message rate
- Consumer count
- Failed messages (DLQ)

---

## Best Practices

### 1. Layering & Dependency Direction

```
┌─────────────────────────┐
│   Adapter Layer         │  ← Depends on Use Case
│   (Controllers, Repos)  │
└───────────┬─────────────┘
            │
            ↓
┌─────────────────────────┐
│   Use Case Layer        │  ← Depends on Models
│   (Services)            │
└───────────┬─────────────┘
            │
            ↓
┌─────────────────────────┐
│   Domain Layer          │  ← NO dependencies
│   (Models)              │
└─────────────────────────┘
```

**Rule**: Dependencies always point inward (toward domain).

---

### 2. Error Handling

Always handle exceptions properly:

```java
try {
    // Operation
} catch (SpecificException e) {
    log.error("Specific error occurred", e);
    throw new BusinessException("User-friendly message", e);
} catch (Exception e) {
    log.error("Unexpected error", e);
    throw new SystemException("System error", e);
}
```

---

### 3. Logging Best Practices

```java
// Good - Structured logging
log.info("Processing file: fileId={}, size={}", fileId, fileSize);
log.error("Failed to process file: fileId={}", fileId, exception);

// Bad - String concatenation
log.info("Processing file: " + fileId + ", size: " + fileSize);
```

---

### 4. Transaction Management

Use `@Transactional` for operations that modify data:

```java
@Service
@Transactional  // All methods are transactional
public class SkillAnalysisService {

    @Transactional(readOnly = true)  // Optimization for reads
    public SkillAnalysis findById(UUID id) {
        return skillRepository.findById(id);
    }
}
```

---

### 5. Soft Delete Pattern

Always implement soft delete:

```java
// Don't physically delete
public void delete(UUID id) {
    SkillAnalysisEntity entity = repository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Not found"));

    entity.setDeletedAt(LocalDateTime.now());
    repository.save(entity);
}
```

---

### 6. API Versioning

If you need to version APIs:

```java
@RestController
@RequestMapping("/api/v1/skills")
public class SkillAnalysisControllerV1 {
}

@RestController
@RequestMapping("/api/v2/skills")
public class SkillAnalysisControllerV2 {
}
```

---

### 7. Configuration Externalization

Never hardcode configuration:

```java
// Bad
private static final String QUEUE_NAME = "skill.analysis.queue";

// Good
@Value("${rabbitmq.queue.skill-analysis}")
private String queueName;
```

---

### 8. Use DTOs for API Contracts

```
Controller receives/returns DTOs
        ↓
    Convert to/from Domain Models
        ↓
Service works with Domain Models
```

Never expose entities or domain models directly in APIs!

---

## Troubleshooting

### Issue: Bean Could Not Be Found

**Error**:
```
Field xxxService in ... required a bean of type '...' that could not be found.
```

**Solutions**:
1. Check `@Component`, `@Service`, or `@Repository` annotation
2. Verify component scan base package
3. Check for circular dependencies
4. Ensure interface is bound to implementation

---

### Issue: JPA Entity Not Found

**Error**:
```
Not a managed type: class ...Entity
```

**Solution**: Add `@EntityScan` in main application class:
```java
@EntityScan(basePackages = "com.aicoach.repository.postgresql.entity")
```

---

### Issue: RabbitMQ Connection Refused

**Error**:
```
Connection refused: localhost:5672
```

**Solutions**:
1. Check RabbitMQ is running: `docker ps`
2. Verify connection settings in `application.yml`
3. Check firewall/network settings

---

### Issue: Consumer Not Processing Messages

**Checklist**:
1. Is consumer service running with `consumer` profile?
2. Check `@Profile("consumer")` annotation on consumer class
3. Verify queue name in `@RabbitListener` matches configuration
4. Check RabbitMQ management UI for consumer connections

---

### Issue: Database Migration Fails

**Error**:
```
Flyway migration failed
```

**Solutions**:
1. Check SQL syntax
2. Verify table/column names
3. Ensure migrations run in order (V1, V2, V3...)
4. Check if table already exists

---

### Issue: File Upload Fails

**Common causes**:
1. File size exceeds limit (default 1MB in Spring)
2. MinIO bucket doesn't exist
3. File type not allowed

**Solution for size limit**:
```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB
```

---

## Quick Checklist for New Module

- [ ] Create domain model in `models/`
- [ ] Define use case interface in `usecase/`
- [ ] Implement service in `usecase/service/`
- [ ] Create JPA entity in `repository/postgresql/entity/`
- [ ] Create JPA repository interface
- [ ] Implement repository adapter
- [ ] Create mapper (entity ↔ domain)
- [ ] Create DTOs in `adapter/http/dto/`
- [ ] Create REST controller in `adapter/http/`
- [ ] If async: Create message model
- [ ] If async: Create producer
- [ ] If async: Create consumer with `@Profile("consumer")`
- [ ] Add RabbitMQ config (exchange, queue, binding)
- [ ] Create database migration SQL
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Update Swagger documentation
- [ ] Test manually via Swagger UI or cURL

---

## Additional Resources

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Data JPA Guide](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

---

**Happy Coding!**

For questions or issues, consult the [PROJECT_INDEX.md](PROJECT_INDEX.md) or check existing modules for reference implementations.
