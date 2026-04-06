FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /workspace

COPY pom.xml ./pom.xml
COPY services/auth-service/pom.xml services/auth-service/pom.xml
COPY services/auth-service/src services/auth-service/src

RUN mvn -f services/auth-service/pom.xml -B -DskipTests package

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app

COPY --from=build /workspace/services/auth-service/target/auth-service-0.1.0-SNAPSHOT.jar /app/app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

