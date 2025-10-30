package co3065.ai_coach.usecase.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import co3065.ai_coach.models.Test;
import co3065.ai_coach.repository.TestRepository;
import co3065.ai_coach.usecase.TestUseCase;
import co3065.ai_coach.usecase.types.CreateTestCommand;

import java.util.List;
import java.util.Optional;

/**
 * Test Service Implementation - Tất cả business logic cho Test domain
 */
@Service
@Transactional
public class TestService implements TestUseCase {
    
    private final TestRepository testRepository;

    public TestService(TestRepository testRepository) {
        this.testRepository = testRepository;
    }

    @Override
    public Test createTest(CreateTestCommand command) {
        // Business validation
        if (command.getTitle() == null || command.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Tiêu đề test không được để trống");
        }

        if (command.getDuration() == null || command.getDuration() <= 0) {
            throw new IllegalArgumentException("Thời gian làm bài phải lớn hơn 0");
        }

        if (command.getMaxScore() == null || command.getMaxScore() <= 0) {
            throw new IllegalArgumentException("Điểm tối đa phải lớn hơn 0");
        }

        // Check duplicate title
        if (testRepository.existsByTitle(command.getTitle())) {
            throw new IllegalArgumentException("Test với tiêu đề này đã tồn tại");
        }

        // Tạo domain entity
        Test test = new Test(
            command.getTitle(), 
            command.getDescription(), 
            command.getDuration(), 
            command.getMaxScore()
        );

        // Domain validation
        if (!test.isValid()) {
            throw new IllegalArgumentException("Thông tin test không hợp lệ");
        }

        // Lưu vào database
        return testRepository.save(test);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Test> getTestById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("ID không hợp lệ");
        }
        return testRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Test> getAllTests() {
        return testRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Test> getTestsByTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Tiêu đề không được để trống");
        }
        return testRepository.findByTitleContaining(title);
    }
}

