package co3065.ai_coach.repository;

import java.util.List;
import java.util.Optional;

import co3065.ai_coach.models.Test;

/**
 * Port Out - Repository interface cho Test
 * Infrastructure layer sẽ implement interface này
 */
public interface TestRepository {
    Test save(Test test);
    Optional<Test> findById(Long id);
    List<Test> findAll();
    List<Test> findByTitleContaining(String title);
    void deleteById(Long id);
    boolean existsByTitle(String title);
}

