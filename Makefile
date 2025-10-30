COMPOSE_FILE := docker-compose.dev.yml
SERVICE := java-maven-dev
DC := docker compose -f $(COMPOSE_FILE)

.PHONY: env-build env-up env-down env-logs env-ps env-exec env-shell env-clean env-recreate

env-build:
	$(DC) build --no-cache

env-up:
	$(DC) up -d --build

env-down:
	$(DC) down

env-logs:
	$(DC) logs -f $(SERVICE)

env-ps:
	$(DC) ps

env-exec:
	$(DC) exec $(SERVICE) bash || $(DC) exec $(SERVICE) sh

env-shell: env-exec

env-clean:
	$(DC) down -v --remove-orphans

env-recreate:
	$(DC) down && $(DC) up -d --build

run-api:
	mvn spring-boot:run
