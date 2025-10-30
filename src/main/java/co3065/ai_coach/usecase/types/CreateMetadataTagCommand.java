package co3065.ai_coach.usecase.types;

/**
 * Command object cho việc tạo metadata tag mới
 */
public class CreateMetadataTagCommand {
    private final String tagName;

    public CreateMetadataTagCommand(String tagName) {
        this.tagName = tagName;
    }

    public String getTagName() {
        return tagName;
    }
}
