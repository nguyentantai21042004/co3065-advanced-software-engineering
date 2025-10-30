package co3065.ai_coach.models;

import java.time.LocalDateTime;

/**
 * Domain Entity - Test
 * Core business entity cho bài kiểm tra/test
 */
public class Test {
    private Long id;
    private String title;
    private String description;
    private Integer duration; // Thời gian làm bài (phút)
    private Integer maxScore; // Điểm tối đa
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor cho tạo test mới (chưa có id)
    public Test(String title, String description, Integer duration, Integer maxScore) {
        this.title = title;
        this.description = description;
        this.duration = duration;
        this.maxScore = maxScore;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor đầy đủ (có id - từ database)
    public Test(Long id, String title, String description, Integer duration, 
                Integer maxScore, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.duration = duration;
        this.maxScore = maxScore;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Business logic validation
    public boolean hasValidTitle() {
        return title != null && !title.trim().isEmpty() && title.length() >= 3;
    }

    public boolean hasValidDuration() {
        return duration != null && duration > 0 && duration <= 300; // Max 5 hours
    }

    public boolean hasValidMaxScore() {
        return maxScore != null && maxScore > 0 && maxScore <= 1000;
    }

    public boolean isValid() {
        return hasValidTitle() && hasValidDuration() && hasValidMaxScore();
    }

    public void updateTitle(String newTitle) {
        this.title = newTitle;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateDescription(String newDescription) {
        this.description = newDescription;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateDuration(Integer newDuration) {
        this.duration = newDuration;
        this.updatedAt = LocalDateTime.now();
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Integer getDuration() {
        return duration;
    }

    public Integer getMaxScore() {
        return maxScore;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}

