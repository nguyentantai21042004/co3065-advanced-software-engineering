package co3065.ai_coach.adapter.http.dto;

/**
 * DTO cho request tạo test mới
 */
public class CreateTestRequest {
    private String title;
    private String description;
    private Integer duration;
    private Integer maxScore;

    public CreateTestRequest() {
    }

    public CreateTestRequest(String title, String description, Integer duration, Integer maxScore) {
        this.title = title;
        this.description = description;
        this.duration = duration;
        this.maxScore = maxScore;
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

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Integer getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(Integer maxScore) {
        this.maxScore = maxScore;
    }
}

