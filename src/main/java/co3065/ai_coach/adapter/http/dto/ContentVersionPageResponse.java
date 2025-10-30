package co3065.ai_coach.adapter.http.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * ContentVersion Page Response DTO
 */
public class ContentVersionPageResponse {
    @JsonProperty("items")
    private List<ContentVersionResponse> items;

    @JsonProperty("total_elements")
    private long totalElements;

    @JsonProperty("total_pages")
    private int totalPages;

    @JsonProperty("current_page")
    private int currentPage;

    @JsonProperty("size")
    private int size;

    @JsonProperty("first")
    private boolean first;

    @JsonProperty("last")
    private boolean last;

    // Default constructor
    public ContentVersionPageResponse() {}

    // Constructor
    public ContentVersionPageResponse(List<ContentVersionResponse> items, long totalElements, int totalPages,
                                     int currentPage, int size, boolean first, boolean last) {
        this.items = items;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.currentPage = currentPage;
        this.size = size;
        this.first = first;
        this.last = last;
    }

    // Getters and Setters
    public List<ContentVersionResponse> getItems() {
        return items;
    }

    public void setItems(List<ContentVersionResponse> items) {
        this.items = items;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public boolean isFirst() {
        return first;
    }

    public void setFirst(boolean first) {
        this.first = first;
    }

    public boolean isLast() {
        return last;
    }

    public void setLast(boolean last) {
        this.last = last;
    }
}
