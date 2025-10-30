package co3065.ai_coach.adapter.http.dto;

import co3065.ai_coach.models.Course;

/**
 * DTO cho request cập nhật course
 */
public class UpdateCourseRequest {
    private String title;
    private String description;
    private Course.StructureType structureType;

    public UpdateCourseRequest() {
    }

    public UpdateCourseRequest(String title, String description, Course.StructureType structureType) {
        this.title = title;
        this.description = description;
        this.structureType = structureType;
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

    public Course.StructureType getStructureType() {
        return structureType;
    }

    public void setStructureType(Course.StructureType structureType) {
        this.structureType = structureType;
    }
}
