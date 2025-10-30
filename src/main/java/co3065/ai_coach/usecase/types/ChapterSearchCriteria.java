package co3065.ai_coach.usecase.types;

import java.util.UUID;

/**
 * Search criteria cho Chapter với pagination
 */
public class ChapterSearchCriteria {
    private UUID courseId;
    private Integer sequenceNumber;
    private int page = 0;
    private int size = 20;

    public ChapterSearchCriteria() {
    }

    public ChapterSearchCriteria(UUID courseId, Integer sequenceNumber, int page, int size) {
        this.courseId = courseId;
        this.sequenceNumber = sequenceNumber;
        this.page = page;
        this.size = size;
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
