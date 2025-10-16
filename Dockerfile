# Dockerfile
FROM maven:3.9.8-eclipse-temurin-17

WORKDIR /app

# Không build source, chỉ giữ container chạy để có thể exec vào
CMD ["tail", "-f", "/dev/null"]