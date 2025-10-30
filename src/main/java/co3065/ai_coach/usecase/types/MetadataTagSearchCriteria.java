package co3065.ai_coach.usecase.types;

import org.springframework.data.domain.Sort;

import java.util.List;

/**
 * Search criteria cho MetadataTag
 */
public class MetadataTagSearchCriteria {
    private String keyword;
    private List<Integer> tagIds;
    private Sort sort;
    private int page;
    private int size;

    public MetadataTagSearchCriteria() {
        this.page = 0;
        this.size = 20;
        this.sort = Sort.by(Sort.Direction.ASC, "tagName");
    }

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }

    public List<Integer> getTagIds() {
        return tagIds;
    }

    public void setTagIds(List<Integer> tagIds) {
        this.tagIds = tagIds;
    }

    public Sort getSort() {
        return sort;
    }

    public void setSort(Sort sort) {
        this.sort = sort;
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
