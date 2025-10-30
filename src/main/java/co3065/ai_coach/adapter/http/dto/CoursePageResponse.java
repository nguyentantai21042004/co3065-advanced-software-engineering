package co3065.ai_coach.adapter.http.dto;

import java.util.List;

/**
 * DTO cho response phân trang Course
 */
public class CoursePageResponse {
    private List<CourseResponse> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;

    public CoursePageResponse() {
    }

    public CoursePageResponse(List<CourseResponse> content, int page, int size, long totalElements, int totalPages) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
    }

    public List<CourseResponse> getContent() {
        return content;
    }

    public void setContent(List<CourseResponse> content) {
        this.content = content;
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
}
