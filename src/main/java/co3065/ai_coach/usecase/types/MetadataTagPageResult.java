package co3065.ai_coach.usecase.types;

import java.util.List;

import co3065.ai_coach.models.MetadataTag;

/**
 * Page result cho MetadataTag
 */
public class MetadataTagPageResult {
    private List<MetadataTag> items;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int size;
    private boolean first;
    private boolean last;

    public MetadataTagPageResult(List<MetadataTag> items, long totalElements, int totalPages,
                                int currentPage, int size, boolean first, boolean last) {
        this.items = items;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.currentPage = currentPage;
        this.size = size;
        this.first = first;
        this.last = last;
    }

    public List<MetadataTag> getItems() {
        return items;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public int getSize() {
        return size;
    }

    public boolean isFirst() {
        return first;
    }

    public boolean isLast() {
        return last;
    }
}
