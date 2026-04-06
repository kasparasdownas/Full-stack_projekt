FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /workspace

COPY pom.xml ./pom.xml
COPY services/booking-service/pom.xml services/booking-service/pom.xml
COPY services/booking-service/src services/booking-service/src

RUN mvn -f services/booking-service/pom.xml -B -DskipTests package

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app

COPY --from=build /workspace/services/booking-service/target/booking-service-0.1.0-SNAPSHOT.jar /app/app.jar

EXPOSE 8083

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

