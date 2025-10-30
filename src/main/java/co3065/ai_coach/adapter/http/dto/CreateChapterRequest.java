package co3065.ai_coach.adapter.http.dto;

import java.util.UUID;

/**
 * DTO cho request tạo chapter mới
 */
public class CreateChapterRequest {
    private UUID courseId;
    private Integer sequenceNumber;

    public CreateChapterRequest() {
    }

    public CreateChapterRequest(UUID courseId, Integer sequenceNumber) {
        this.courseId = courseId;
        this.sequenceNumber = sequenceNumber;
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
}
