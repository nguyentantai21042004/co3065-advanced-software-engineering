package co3065.ai_coach.usecase.types;

import org.springframework.data.domain.Sort;

import co3065.ai_coach.models.ContentUnit;

import java.util.List;
import java.util.UUID;

/**
 * Search criteria cho ContentUnit
 */
public class ContentUnitSearchCriteria {
    private String keyword;
    private List<UUID> unitIds;
    private UUID chapterId;
    private ContentUnit.UnitType unitType;
    private Sort sort;
    private int page;
    private int size;

    public ContentUnitSearchCriteria() {
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

    public List<UUID> getUnitIds() {
        return unitIds;
    }

    public void setUnitIds(List<UUID> unitIds) {
        this.unitIds = unitIds;
    }

    public UUID getChapterId() {
        return chapterId;
    }

    public void setChapterId(UUID chapterId) {
        this.chapterId = chapterId;
    }

    public ContentUnit.UnitType getUnitType() {
        return unitType;
    }

    public void setUnitType(ContentUnit.UnitType unitType) {
        this.unitType = unitType;
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
