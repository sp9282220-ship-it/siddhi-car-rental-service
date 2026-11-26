# Siddhi Car Rental Service - Backend

Java 17 · Spring Boot 3.3 · Spring Data JPA · Spring Security · MySQL 8

1. Run `../database.sql` in MySQL (`mysql -u root -p < ../database.sql`).
2. Set your MySQL username/password in `src/main/resources/application.properties`.
3. Start: `mvn spring-boot:run`  → http://localhost:8080/api/cars
4. Tests: `mvn test` (JUnit 5 + Mockito: booking rules, ownership checks, auth, token signing)

Demo admin: `rutikaparekar@gmail.com` / `Parekar@123` (created automatically if missing).

Layers: `controller` (REST endpoints) → `service` (business rules) → `repository` (Spring Data JPA) → `entity` (tables).
`dto` = request/response objects with validation, `exception` = JSON error handling,
`security` = token creation/checking, `config` = security rules, CORS, default admin.

See the main `README.md` one folder up for the full API list and troubleshooting.
