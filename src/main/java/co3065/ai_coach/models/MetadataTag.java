package co3065.ai_coach.models;

import java.time.LocalDateTime;

/**
 * Domain Entity - MetadataTag
 * Entity cho danh sách kỹ năng/chủ đề cốt lõi (Source of Truth)
 */
public class MetadataTag {
    private Integer tagId;
    private String tagName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor cho tạo metadata tag mới (chưa có tagId)
    public MetadataTag(String tagName) {
        this.tagName = tagName;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor đầy đủ (có tagId - từ database)
    public MetadataTag(Integer tagId, String tagName, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.tagId = tagId;
        this.tagName = tagName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Business logic validation
    public boolean hasValidTagName() {
        return tagName != null && !tagName.trim().isEmpty() && tagName.length() <= 100;
    }

    public boolean isValid() {
        return hasValidTagName();
    }

    public void updateTagName(String newTagName) {
        if (newTagName == null || newTagName.trim().isEmpty()) {
            throw new IllegalArgumentException("Tag name cannot be null or empty");
        }
        if (newTagName.length() > 100) {
            throw new IllegalArgumentException("Tag name cannot exceed 100 characters");
        }
        this.tagName = newTagName;
        this.updatedAt = LocalDateTime.now();
    }

    // Getters
    public Integer getTagId() {
        return tagId;
    }

    public String getTagName() {
        return tagName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
