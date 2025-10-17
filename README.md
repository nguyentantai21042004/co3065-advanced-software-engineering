# AI Coach - Personal Skill Development Platform

## 🎯 Vision

**AI Coach** is a personalized skill development platform designed to help employees and students improve their capabilities through intelligent guidance and actionable plans.

### Key Features
- **Personalized Learning Paths**: Tailored to individual skill levels and learning styles
- **SMART Goal Setting**: AI-powered assistance in defining achievable, sustainable goals
- **Action Plan Generation**: Intelligent recommendations for skill development actions
- **Progress Tracking**: Monitor and analyze skill improvement over time
- **Achievable Goals**: System helps users choose realistic and sustainable objectives

## 🚀 Technical Stack

- **Backend**: Java 17 with Spring Boot 3.2.0
- **Database**: PostgreSQL 15 with JPA/Hibernate
- **AI Integration**: Google Gemini API for intelligent recommendations
- **Containerization**: Docker & Docker Compose
- **Build Tool**: Maven 3.9.8
- **Admin Interface**: pgAdmin 4 for database management

## 📋 Prerequisites

Before running this project, ensure you have the following installed:
- Docker and Docker Compose
- Git

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd co3065-advanced-software-engineering
```

### 2. Environment Configuration
Create a `.env` file from the template:
```bash
cp env-template .env
```

Edit the `.env` file with your preferred settings:
```env
# Database Configuration
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=co3065_db

# pgAdmin Configuration
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=admin123
```

### 3. Start the Development Environment
```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps
```

### 4. Verify Services
- **Application**: http://localhost:8080
- **pgAdmin**: http://localhost:5050
- **PostgreSQL**: localhost:5432

## 🔧 Development Workflow

### Accessing the Java Development Container
```bash
# Enter the Java development container
docker-compose exec java-maven-dev bash

# Inside the container, you can:
# - Run Maven commands
mvn clean compile
mvn test
mvn spring-boot:run

# - Access database
# Database connection details:
# Host: postgres
# Port: 5432
# Database: co3065_db
# Username: admin
# Password: admin123
```

### Database Management
Access pgAdmin at http://localhost:5050:
- **Email**: admin@example.com
- **Password**: admin123

Connect to PostgreSQL:
- **Host**: postgres (or localhost from host machine)
- **Port**: 5432
- **Database**: co3065_db
- **Username**: admin
- **Password**: admin123

### Useful Commands
```bash
# View logs
docker-compose logs -f java-maven-dev
docker-compose logs -f postgres

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ This will delete all data)
docker-compose down -v
```

## 🏗️ Project Structure

```
co3065-advanced-software-engineering/
├── src/
│   ├── main/
│   │   ├── java/com/example/
│   │   └── resources/
│   └── test/
├── docker-compose.yml
├── Dockerfile
├── pom.xml
├── .env
└── README.md
```

## 🤖 AI Integration

The platform integrates with Google Gemini API to provide:
- Personalized skill assessments
- Intelligent goal recommendations
- Action plan generation
- Progress analysis and insights

## 📚 API Documentation

Once the application is running, API documentation will be available at:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   lsof -i :8080
   lsof -i :5432
   lsof -i :5050
   ```

2. **Database connection refused**
   ```bash
   # Check if PostgreSQL is healthy
   docker-compose ps
   docker-compose logs postgres
   ```

3. **Container build failures**
   ```bash
   # Rebuild containers
   docker-compose build --no-cache
   docker-compose up -d
   ```
