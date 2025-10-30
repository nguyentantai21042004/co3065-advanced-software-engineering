package co3065.ai_coach.repository.postgresql;

import org.springframework.stereotype.Repository;

import co3065.ai_coach.models.Test;
import co3065.ai_coach.repository.TestRepository;
import co3065.ai_coach.repository.postgresql.entity.TestEntity;
import co3065.ai_coach.repository.postgresql.mapper.TestMapper;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Infrastructure Repository Implementation cho Test
 * Adapter cho persistence layer, implement Port Out interface
 */
@Repository
public class JpaTestRepository implements TestRepository {

    private final SpringDataTestRepository springDataTestRepository;

    public JpaTestRepository(SpringDataTestRepository springDataTestRepository) {
        this.springDataTestRepository = springDataTestRepository;
    }

    @Override
    public Test save(Test test) {
        TestEntity entity = TestMapper.toEntity(test);
        TestEntity savedEntity = springDataTestRepository.save(entity);
        return TestMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Test> findById(Long id) {
        return springDataTestRepository.findById(id)
            .map(TestMapper::toDomain);
    }

    @Override
    public List<Test> findAll() {
        return springDataTestRepository.findAll().stream()
            .map(TestMapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public List<Test> findByTitleContaining(String title) {
        return springDataTestRepository.findByTitleContaining(title).stream()
            .map(TestMapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        springDataTestRepository.deleteById(id);
    }

    @Override
    public boolean existsByTitle(String title) {
        return springDataTestRepository.existsByTitle(title);
    }
}

