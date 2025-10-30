package co3065.ai_coach.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Application Class
 * Config cho Spring Boot application với Clean Architecture
 */
@SpringBootApplication(scanBasePackages = "co3065.ai_coach")
public class AICoachServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AICoachServiceApplication.class, args);
	}

}

