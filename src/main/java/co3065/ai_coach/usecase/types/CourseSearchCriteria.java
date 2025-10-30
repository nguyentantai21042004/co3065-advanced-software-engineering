package co3065.ai_coach.usecase.types;

import java.util.UUID;

import co3065.ai_coach.models.Course;

/**
 * Search criteria cho Course với pagination
 */
public class CourseSearchCriteria {
    private String title;
    private UUID instructorId;
    private Course.StructureType structureType;
    private int page = 0;
    private int size = 20;

    public CourseSearchCriteria() {
    }

    public CourseSearchCriteria(String title, UUID instructorId, Course.StructureType structureType, int page, int size) {
        this.title = title;
        this.instructorId = instructorId;
        this.structureType = structureType;
        this.page = page;
        this.size = size;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public UUID getInstructorId() {
        return instructorId;
    }

    public void setInstructorId(UUID instructorId) {
        this.instructorId = instructorId;
    }

    public Course.StructureType getStructureType() {
        return structureType;
    }

    public void setStructureType(Course.StructureType structureType) {
        this.structureType = structureType;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }
}
