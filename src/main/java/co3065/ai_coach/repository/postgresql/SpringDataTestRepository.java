package co3065.ai_coach.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;

import co3065.ai_coach.repository.postgresql.entity.TestEntity;

import java.util.List;

/**
 * Spring Data JPA Repository cho Test
 */
public interface SpringDataTestRepository extends JpaRepository<TestEntity, Long> {
    
    List<TestEntity> findByTitleContaining(String title);
    
    boolean existsByTitle(String title);
}

