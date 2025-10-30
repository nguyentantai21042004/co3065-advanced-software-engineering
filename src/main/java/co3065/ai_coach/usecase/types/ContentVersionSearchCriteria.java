package co3065.ai_coach.usecase.types;

import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.UUID;

/**
 * Search criteria cho ContentVersion
 */
public class ContentVersionSearchCriteria {
    private String keyword;
    private List<Long> versionIds;
    private UUID unitId;
    private String versionNumber;
    private Boolean isActive;
    private Sort sort;
    private int page;
    private int size;

    public ContentVersionSearchCriteria() {
        this.page = 0;
        this.size = 20;
        this.sort = Sort.by(Sort.Direction.DESC, "createdAt");
    }

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }

    public List<Long> getVersionIds() {
        return versionIds;
    }

    public void setVersionIds(List<Long> versionIds) {
        this.versionIds = versionIds;
    }

    public UUID getUnitId() {
        return unitId;
    }

    public void setUnitId(UUID unitId) {
        this.unitId = unitId;
    }

    public String getVersionNumber() {
        return versionNumber;
    }

    public void setVersionNumber(String versionNumber) {
        this.versionNumber = versionNumber;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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
