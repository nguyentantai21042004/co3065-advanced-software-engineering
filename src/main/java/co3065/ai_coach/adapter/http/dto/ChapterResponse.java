package co3065.ai_coach.adapter.http.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO cho response Chapter
 */
public class ChapterResponse {
    private UUID chapterId;
    private UUID courseId;
    private Integer sequenceNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ChapterResponse() {
    }

    public ChapterResponse(UUID chapterId, UUID courseId, Integer sequenceNumber, 
                          LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.chapterId = chapterId;
        this.courseId = courseId;
        this.sequenceNumber = sequenceNumber;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getChapterId() {
        return chapterId;
    }

    public void setChapterId(UUID chapterId) {
        this.chapterId = chapterId;
    }

    public UUID getCourseId() {
        return courseId;
    }

    public void setCourseId(UUID courseId) {
        this.courseId = courseId;
    }

    public Integer getSequenceNumber() {
        return sequenceNumber;
    }

    public void setSequenceNumber(Integer sequenceNumber) {
        this.sequenceNumber = sequenceNumber;
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
