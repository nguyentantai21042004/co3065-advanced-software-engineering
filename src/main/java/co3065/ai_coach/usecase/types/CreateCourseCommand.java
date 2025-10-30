package co3065.ai_coach.usecase.types;

import java.util.UUID;

import co3065.ai_coach.models.Course;

/**
 * Command object cho việc tạo course mới
 */
public class CreateCourseCommand {
    private final String title;
    private final String description;
    private final UUID instructorId;
    private final Course.StructureType structureType;

    public CreateCourseCommand(String title, String description, UUID instructorId, Course.StructureType structureType) {
        this.title = title;
        this.description = description;
        this.instructorId = instructorId;
        this.structureType = structureType;
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

    public Course.StructureType getStructureType() {
        return structureType;
    }
}
