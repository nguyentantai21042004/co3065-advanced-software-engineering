package co3065.ai_coach.adapter.http.dto;

/**
 * DTO cho request cập nhật chapter
 */
public class UpdateChapterRequest {
    private Integer sequenceNumber;

    public UpdateChapterRequest() {
    }

    public UpdateChapterRequest(Integer sequenceNumber) {
        this.sequenceNumber = sequenceNumber;
    }

    public Integer getSequenceNumber() {
        return sequenceNumber;
    }

    public void setSequenceNumber(Integer sequenceNumber) {
        this.sequenceNumber = sequenceNumber;
    }
}
