package co3065.ai_coach.adapter.http.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import co3065.ai_coach.models.Course;

/**
 * DTO cho response Course
 */
public class CourseResponse {
    private UUID courseId;
    private String title;
    private String description;
    private UUID instructorId;
    private Course.StructureType structureType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CourseResponse() {
    }

    public CourseResponse(UUID courseId, String title, String description, UUID instructorId,
            Course.StructureType structureType, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.courseId = courseId;
        this.title = title;
        this.description = description;
        this.instructorId = instructorId;
        this.structureType = structureType;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getCourseId() {
        return courseId;
    }

    public void setCourseId(UUID courseId) {
        this.courseId = courseId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public UUID getInstructorId() {
        return instructorId;
    }

    public void setInstructorId(UUID instructorId) {
        this.instructorId = instructorId;
    }

    public Course.StructureType getStructureType() {
        return structureType;
    }

    public void setStructureType(Course.StructureType structureType) {
        this.structureType = structureType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
