package com.aicoach.models;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class ExtractionNotifyMessage {
    private String resultId;

    public ExtractionNotifyMessage() {}
    public ExtractionNotifyMessage(String resultId) {
        this.resultId = resultId;
    }
    public String getResultId() { return resultId; }
    public void setResultId(String id) { this.resultId = id; }
}
