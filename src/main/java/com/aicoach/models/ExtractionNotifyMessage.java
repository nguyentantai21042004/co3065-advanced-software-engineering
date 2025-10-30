package com.aicoach.models;

public class ExtractionNotifyMessage {
    private String resultId;

    public ExtractionNotifyMessage() {}
    public ExtractionNotifyMessage(String resultId) {
        this.resultId = resultId;
    }
    public String getResultId() { return resultId; }
    public void setResultId(String id) { this.resultId = id; }
}
