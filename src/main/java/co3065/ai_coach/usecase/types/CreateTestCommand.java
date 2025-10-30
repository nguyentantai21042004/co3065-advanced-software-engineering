package co3065.ai_coach.usecase.types;

/**
 * Command object cho việc tạo test
 */
public class CreateTestCommand {
    private final String title;
    private final String description;
    private final Integer duration;
    private final Integer maxScore;

    public CreateTestCommand(String title, String description, Integer duration, Integer maxScore) {
        this.title = title;
        this.description = description;
        this.duration = duration;
        this.maxScore = maxScore;
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
}

