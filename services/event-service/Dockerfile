FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /workspace

COPY pom.xml ./pom.xml
COPY services/event-service/pom.xml services/event-service/pom.xml
COPY services/event-service/src services/event-service/src

RUN mvn -f services/event-service/pom.xml -B -DskipTests package

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app

COPY --from=build /workspace/services/event-service/target/event-service-0.1.0-SNAPSHOT.jar /app/app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

