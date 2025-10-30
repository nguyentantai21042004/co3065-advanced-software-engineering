package co3065.ai_coach.usecase.types;

import co3065.ai_coach.models.Course;

/**
 * Command object cho việc cập nhật course
 */
public class UpdateCourseCommand {
    private final String title;
    private final String description;
    private final Course.StructureType structureType;

    public UpdateCourseCommand(String title, String description, Course.StructureType structureType) {
        this.title = title;
        this.description = description;
        this.structureType = structureType;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Course.StructureType getStructureType() {
        return structureType;
    }
}
