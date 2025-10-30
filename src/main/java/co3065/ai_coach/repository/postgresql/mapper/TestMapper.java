package co3065.ai_coach.repository.postgresql.mapper;

import co3065.ai_coach.models.Test;
import co3065.ai_coach.repository.postgresql.entity.TestEntity;

/**
 * Mapper chuyển đổi giữa Domain Test và TestEntity (JPA)
 */
public class TestMapper {

    /**
     * Chuyển từ Domain Test sang TestEntity để lưu vào database
     */
    public static TestEntity toEntity(Test test) {
        TestEntity entity = new TestEntity();
        entity.setId(test.getId());
        entity.setTitle(test.getTitle());
        entity.setDescription(test.getDescription());
        entity.setDuration(test.getDuration());
        entity.setMaxScore(test.getMaxScore());
        entity.setCreatedAt(test.getCreatedAt());
        entity.setUpdatedAt(test.getUpdatedAt());
        return entity;
    }

    /**
     * Chuyển từ TestEntity sang Domain Test sau khi đọc từ database
     */
    public static Test toDomain(TestEntity entity) {
        return new Test(
            entity.getId(),
            entity.getTitle(),
            entity.getDescription(),
            entity.getDuration(),
            entity.getMaxScore(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}

