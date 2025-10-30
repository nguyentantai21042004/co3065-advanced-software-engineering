package co3065.ai_coach.usecase.types;

import java.util.List;

import co3065.ai_coach.models.Course;

/**
 * Kết quả phân trang cho Course
 */
public class CoursePageResult {
    private List<Course> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;

    public CoursePageResult() {
    }

    public CoursePageResult(List<Course> content, int page, int size, long totalElements, int totalPages) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
    }

    public List<Course> getContent() {
        return content;
    }

    public void setContent(List<Course> content) {
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
