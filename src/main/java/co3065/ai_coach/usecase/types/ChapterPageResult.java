package co3065.ai_coach.usecase.types;

import java.util.List;

import co3065.ai_coach.models.Chapter;

/**
 * Kết quả phân trang cho Chapter
 */
public class ChapterPageResult {
    private List<Chapter> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;

    public ChapterPageResult() {
    }

    public ChapterPageResult(List<Chapter> content, int page, int size, long totalElements, int totalPages) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
    }

    public List<Chapter> getContent() {
        return content;
    }

    public void setContent(List<Chapter> content) {
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
