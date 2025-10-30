package co3065.ai_coach.models;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Entity - Chapter
 * Entity cho chương trong khóa học
 */
public class Chapter {
    private UUID chapterId;
    private UUID courseId;
    private Integer sequenceNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor cho tạo chapter mới (chưa có chapterId)
    public Chapter(UUID courseId, Integer sequenceNumber) {
        this.chapterId = UUID.randomUUID();
        this.courseId = courseId;
        this.sequenceNumber = sequenceNumber;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor đầy đủ (có chapterId - từ database)
    public Chapter(UUID chapterId, UUID courseId, Integer sequenceNumber, 
                   LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.chapterId = chapterId;
        this.courseId = courseId;
        this.sequenceNumber = sequenceNumber;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Business logic validation
    public boolean hasValidCourseId() {
        return courseId != null;
    }

    public boolean hasValidSequenceNumber() {
        return sequenceNumber != null && sequenceNumber > 0;
    }

    public boolean isValid() {
        return hasValidCourseId() && hasValidSequenceNumber();
    }

    public void updateSequenceNumber(Integer newSequenceNumber) {
        if (newSequenceNumber == null || newSequenceNumber <= 0) {
            throw new IllegalArgumentException("Sequence number must be greater than 0");
        }
        this.sequenceNumber = newSequenceNumber;
        this.updatedAt = LocalDateTime.now();
    }

    // Getters
    public UUID getChapterId() {
        return chapterId;
    }

    public UUID getCourseId() {
        return courseId;
    }

    public Integer getSequenceNumber() {
        return sequenceNumber;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
