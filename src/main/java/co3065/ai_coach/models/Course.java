package co3065.ai_coach.models;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Entity - Course
 * Aggregate Root cho khóa học
 */
public class Course {
    private UUID courseId;
    private String title;
    private String description;
    private UUID instructorId;
    private StructureType structureType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor cho tạo course mới (chưa có courseId)
    public Course(String title, String description, UUID instructorId, StructureType structureType) {
        this.courseId = UUID.randomUUID();
        this.title = title;
        this.description = description;
        this.instructorId = instructorId;
        this.structureType = structureType;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor đầy đủ (có courseId - từ database)
    public Course(UUID courseId, String title, String description, UUID instructorId,
            StructureType structureType, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.courseId = courseId;
        this.title = title;
        this.description = description;
        this.instructorId = instructorId;
        this.structureType = structureType;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Business logic validation
    public boolean hasValidTitle() {
        return title != null && !title.trim().isEmpty() && title.length() >= 3;
    }

    public boolean hasValidDescription() {
        return description != null && !description.trim().isEmpty();
    }

    public boolean hasValidInstructorId() {
        return instructorId != null;
    }

    public boolean hasValidStructureType() {
        return structureType != null;
    }

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

    public void updateDescription(String newDescription) {
        if (newDescription == null || newDescription.trim().isEmpty()) {
            throw new IllegalArgumentException("Description cannot be null or empty");
        }
        this.description = newDescription;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateStructureType(StructureType newStructureType) {
        if (newStructureType == null) {
            throw new IllegalArgumentException("Structure type cannot be null");
        }
        this.structureType = newStructureType;
        this.updatedAt = LocalDateTime.now();
    }

    // Getters
    public UUID getCourseId() {
        return courseId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public UUID getInstructorId() {
        return instructorId;
    }

    public StructureType getStructureType() {
        return structureType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // Enum cho Structure Type
    public enum StructureType {
        LINEAR, ADAPTIVE
    }
}
