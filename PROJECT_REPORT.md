# Fit Self / HomePal - Professional Project Report

## 1. Executive summary

Fit Self is a nutrition and calorie-tracking application designed around Indian
foods and everyday wellness habits. The repository combines:

- an Expo/React Native client for mobile and web;
- a Spring Boot backend for health checks and food identification;
- PostgreSQL-oriented domain and migration design;
- H2-based local development;
- Redis and PostgreSQL Docker services for a production-like local stack; and
- two nutrition datasets containing Indian dishes and fruits.

The current implementation is best described as a functional prototype with a
substantial UI and a backend foundation. The client supports onboarding,
personalized calorie/macronutrient targets, local meal logging, hydration,
activity, sleep and mood tracking, progress views, profile/settings screens,
and AI-assisted food lookup. The backend can search the bundled datasets and,
when configured, query Grok and Sarvam as fallback providers.

Authentication, server-side food logging, and persistent user data are not yet
implemented end to end. The authentication endpoints currently return demo
tokens, and the client stores its working state in browser local storage.

## 2. Project identity

| Item | Current value |
|---|---|
| Product name in UI/configuration | Fit Self |
| Backend/application package | HomePal |
| Backend artifact | `com.homepal:homepal-backend:0.1.0` |
| Primary purpose | Indian-food nutrition, calorie and wellness tracking |
| Target platforms | Android, iOS, web through Expo |
| Backend port | 8080 |
| Client development command | `npx expo start` |
| Backend development command | `mvn spring-boot:run` |
| Java target | 17 |
| Repository state reviewed | 13 November 2026 |

## 3. Problem statement

Many calorie trackers have incomplete coverage of regional Indian foods,
unhelpful serving assumptions, and little support for simple daily wellness
check-ins. Fit Self addresses this by combining:

1. an Indian-food nutrition catalogue;
2. explicit portion entry before a food is logged;
3. calorie and macronutrient targets based on the user's profile and goal;
4. simple daily tracking for water, steps, exercise, sleep and mood; and
5. AI-assisted identification for foods not found locally.

## 4. Objectives

### Primary objectives

- Let a user create a lightweight personal nutrition profile.
- Estimate a daily calorie target from age, sex/gender selection, height,
  weight and goal.
- Search common Indian foods and log them by an explicit portion.
- Show consumed calories, protein, carbohydrates and fats against targets.
- Track complementary wellness behaviours without overwhelming the user.
- Provide a backend path for dataset lookup and external nutrition providers.

### Secondary objectives

- Support Hindi and Hinglish fields in the planned database model.
- Make the local development setup usable without PostgreSQL.
- Keep provider API keys on the backend rather than in the client.
- Provide a path to hosted deployment through Render, Railway or similar
  platforms.

## 5. Main user journeys

1. **Sign in or register**
   - The UI provides login and registration forms.
   - A demo-admin login is available for local testing.
   - Current authentication is local/demo behaviour; it is not connected to
     persisted backend users.

2. **Complete onboarding**
   - The user selects gender, enters age, weight and height, and chooses a
     goal.
   - Units supported by the UI include kg/lb and cm/ft/in.
   - The app calculates an estimated daily calorie target and macro targets.

3. **Review today's dashboard**
   - The dashboard shows calorie progress, macro progress, meal entries,
     hydration, activity and wellness information.
   - The layout adapts between wide desktop/web and compact mobile screens.

4. **Search and log food**
   - The client filters a local list of common foods.
   - A backend search can identify a food using the local datasets, Grok or
     Sarvam.
   - The user must enter a positive serving quantity and select a portion unit.
   - The selected food is added to the local daily meal list.

5. **Review progress and update profile/settings**
   - Progress summarizes calories, protein, hydration, steps, exercise and
     sleep.
   - The profile and settings screens allow personal details and calorie
     targets to be reviewed or changed.
   - Local data can be reset.

## 6. Functional scope currently implemented

### Client

- Responsive Expo/React Native layout.
- Login, registration and demo-admin screens.
- Multi-step onboarding.
- Calorie target estimation.
- Protein, carbohydrate and fat target estimation.
- Local food library with 14 predefined foods.
- Food search through `POST /api/v1/ai/food`.
- Explicit portion validation before logging.
- Add/remove meal entries.
- Daily calorie and macro visualizations.
- Water, steps, exercise, sleep and mood inputs.
- Progress, profile and settings views.
- Local persistence using browser `localStorage`.
- Timeout and user-facing error messages for backend food search failures.
- SVG-based circular nutrition visualizations.

### Backend

- Spring Boot application startup.
- `/api/v1/health` health route.
- `/actuator/health` Actuator route.
- `/api/v1/ai/food` food lookup route.
- CSV dataset loading and basic name/token matching.
- Grok fallback integration when `GROK_API_KEY` is configured.
- Sarvam fallback integration when `SARVAM_API_KEY` is configured.
- Spring Security, CORS, stateless session configuration and BCrypt bean.
- JPA domain model for users, foods, serving sizes, daily logs, refresh
  tokens and audit records.
- PostgreSQL Flyway schema for the planned persistent model.
- H2 local profile for laptop development.
- Prometheus endpoint exposure configuration.

## 7. Technical architecture

```text
Expo/React Native client
        |
        | POST /api/v1/ai/food
        v
Spring Boot REST API
        |
        +--> FoodNutritionService
        |       +--> Indian_Food_Nutrition_Processed.csv
        |       +--> Indian Fruits And Nutritious Foods Dataset.csv
        |
        +--> Grok API fallback
        |
        +--> Sarvam API fallback
        |
        +--> Planned JPA/Flyway persistence
                +--> PostgreSQL
                +--> H2 local profile
                +--> Redis dependency/configuration
```

The current client is not yet a full server-backed client. Its meal list,
profile, wellness values and registered demo users are local browser state.
The backend food lookup is the main live integration.

## 8. Technology stack

### Frontend

- React 19.2.3
- React Native 0.86.3
- Expo 57
- TypeScript 6
- `react-native-svg` for data visualizations
- `expo-status-bar`
- React Native Web for browser execution

### Backend

- Java 17
- Spring Boot 3.3.3
- Spring Web
- Spring Data JPA
- Spring Security
- Spring Validation
- Spring Actuator
- Spring Data Redis
- Spring Cache
- Flyway
- PostgreSQL driver
- H2 runtime database
- JJWT dependencies
- Bucket4j dependency
- Testcontainers and Spring Boot test dependencies

### Infrastructure and delivery

- Docker Compose
- PostgreSQL 15
- Redis 7 Alpine
- GitHub Actions
- Maven
- npm

## 9. Dataset report

### 9.1 Indian fruits dataset

File: `Indian Fruits And Nutritious Foods Dataset.csv`

- 159 data rows.
- 7 columns.
- All 159 records are categorized as `Fruits`.
- 159 unique fruit names.
- 159 non-empty image links.
- 150 distinct daily-serving descriptions.
- Nutrition is stored as descriptive text rather than normalized numeric
  columns.
- Benefit statements and serving guidance are included for each record.

Fields:

1. serial number;
2. entity name;
3. category;
4. nutritious components;
5. benefits;
6. daily quantity guidance; and
7. image link.

### 9.2 Processed Indian food dataset

File: `Indian_Food_Nutrition_Processed.csv`

- 1,014 data rows.
- 12 columns.
- 1,014 unique dish names.
- Numeric calories, carbohydrates, protein and fats are available for the
  primary lookup fields.
- Additional fields include free sugar, fibre, sodium, calcium, iron, vitamin
  C and folate.
- Vitamin C and folate are not populated for every row.

Fields:

1. dish name;
2. calories;
3. carbohydrates;
4. protein;
5. fats;
6. free sugar;
7. fibre;
8. sodium;
9. calcium;
10. iron;
11. vitamin C; and
12. folate.

### 9.3 Dataset processing

The backend loads both CSV files at startup. It first tries a normalized direct
name match, then token-based matching. The processed dish dataset is treated
as nutrition per 100 g. The fruit dataset extracts the first matching kcal,
protein, carbohydrate and fat values from the descriptive nutrition string.

The external-provider fallback is:

1. local processed/fruit datasets;
2. Grok, when configured;
3. Sarvam, when configured;
4. HTTP 503 if no provider can answer.

## 10. API inventory

| Method | Route | Current purpose | Status |
|---|---|---|---|
| GET | `/api/v1/health` | Basic application health response | Implemented |
| GET | `/actuator/health` | Spring health endpoint | Configured |
| POST | `/api/v1/ai/food` | Dataset/provider food identification | Implemented |
| POST | `/api/v1/auth/register` | Registration contract | Demo response only |
| POST | `/api/v1/auth/login` | Login contract | Demo response only |
| POST | `/api/v1/auth/refresh` | Refresh-token contract | Demo response only |
| POST | `/api/v1/auth/logout` | Logout contract | No-op response |

Example food request:

```json
{
  "query": "masala dosa"
}
```

The food response contains a name, detail, calories, protein, carbohydrates,
fats, icon, category and source.

## 11. Database design

The PostgreSQL migration defines:

- `users`: identity, password hash, targets, language, role and lock state.
- `refresh_tokens`: hashed refresh tokens, expiry, revocation and device data.
- `food_items`: English/Hindi/Hinglish names, category and nutrition per 100 g.
- `serving_sizes`: labels and gram equivalents for explicit portions.
- `daily_logs`: user food entries, quantity, meal type and snapshot nutrition.
- `audit_log`: security/audit actions, IP address, metadata and timestamps.

The schema includes:

- UUID identifiers;
- foreign keys and cascade rules;
- positive-value checks for servings and quantities;
- optimistic version columns;
- timestamps;
- trigram indexes for food-name search; and
- PostgreSQL `unaccent` and `pg_trgm` extensions.

The design is stronger than the currently wired application layer: entities
exist, but repositories, application services and real CRUD controllers are
not present in the reviewed source.

## 12. Security and privacy assessment

### Positive design choices

- Password encoder bean uses BCrypt with strength 12.
- API keys are intended to be supplied through backend environment variables.
- The security policy is stateless.
- CORS is restricted to configured development/deployment patterns rather than
  allowing every origin.
- Refresh-token storage is designed around token hashes.
- The database includes account lock fields, audit logging and optimistic
  locking.
- Unknown JSON properties are rejected.

### Important current risks

- Auth endpoints return the literal demo tokens and do not authenticate,
  persist users or validate credentials.
- The client stores profile, meals and demo user credentials in browser
  localStorage, which is not suitable for sensitive production data.
- The client hardcodes `http://localhost:8080`, which will not work from a
  physical phone unless replaced with a reachable host/LAN address.
- The backend AI provider catch block returns `null` for all provider failures,
  reducing observability and hiding the reason for an outage.
- The configured `app.cors.allowed-origins` and rate-limit properties are not
  visibly wired into the security/rate-limiting implementation.
- No production JWT key-loading/filter implementation is present in the
  reviewed source.
- Nutrition returned by an AI provider is an estimate and should be labelled
  and persisted with provenance if used in a real health product.

This project should not be presented as production-ready medical or dietary
advice without source validation, clinical review where appropriate, and
stronger privacy controls.

## 13. Quality and validation status

| Check | Result |
|---|---|
| Expo TypeScript check (`cd app; npx tsc --noEmit`) | Passed |
| Backend Maven tests (`cd backend; mvn test`) | Not executed: Maven is unavailable on PATH in this environment |
| Automated backend test coverage | No backend test classes were found in the reviewed source |
| CI configuration | Present for backend Maven tests and mobile TypeScript check |
| Dataset profile | Completed: 159 fruit rows and 1,014 processed-food rows |

## 14. Known implementation gaps

### High priority

1. Replace demo authentication with real registration, login, refresh,
   logout, password hashing and JWT validation.
2. Add repositories and services for users, food items, serving sizes and
   daily logs.
3. Move meal/profile/wellness persistence from local storage to authenticated
   backend APIs.
4. Remove or protect the demo-admin path outside development.
5. Add integration and unit tests for authentication, food matching,
   nutrition parsing and daily-log calculations.

### Medium priority

1. Add a configurable client API base URL for LAN, emulator and production.
2. Use a standards-compliant CSV parser that supports embedded newlines and
   all quoted fields.
3. Normalize both datasets into a single canonical schema with units,
   serving basis, provenance and confidence.
4. Make the static client food library use the backend catalogue.
5. Wire rate limiting and configured CORS values into actual components.
6. Add structured logging and explicit provider error handling.
7. Add loading, empty, retry and offline states consistently.

### Product enhancements

1. Barcode/photo food scanning.
2. Hindi/Hinglish UI and search.
3. Weekly/monthly trend reports.
4. Export to CSV/PDF.
5. Reminders and notification support.
6. Dietary preferences, allergies and medical disclaimers.
7. Admin workflows for reviewing AI estimates and verifying foods.

## 15. Recommended release plan

### Phase 1 - Stabilize the prototype

- Add a Maven wrapper or document the required Maven installation.
- Add backend tests and test fixtures for both datasets.
- Fix CSV parsing and validate malformed/missing nutrition values.
- Extract API base URL and environment configuration from the client.
- Add error logging and provider timeout handling.

### Phase 2 - Make the backend authoritative

- Implement user repositories and authentication services.
- Implement JWT access-token and refresh-token flows.
- Add authenticated food-log and profile endpoints.
- Persist meal nutrition snapshots and serving sizes.
- Add authorization tests and request validation.

### Phase 3 - Production readiness

- Migrate from H2 to PostgreSQL in a staging environment.
- Configure Redis for clearly defined caching/rate-limit use cases.
- Add secret management, HTTPS, monitoring and alerting.
- Run dependency, security, performance and accessibility reviews.
- Add backup/restore and data deletion processes.

### Phase 4 - Product growth

- Expand verified food coverage.
- Add localization and richer search.
- Add trends, reminders and integrations.
- Measure retention, logging completion and search success rates.

## 16. Suggested report/demo narrative

For a presentation or academic/project review, describe the system as:

> Fit Self is a responsive nutrition and wellness tracking prototype focused
> on Indian foods. It combines personalized calorie planning, explicit portion
> logging, daily wellness check-ins and a Spring Boot food-identification API
> backed by curated CSV datasets with optional AI provider fallbacks.

Demonstrate the following sequence:

1. launch the Expo client;
2. complete onboarding;
3. show the calculated calorie and macro targets;
4. search for a local Indian dish;
5. use backend search for a food not in the local client list;
6. enter an explicit portion and log it;
7. show the nutrition and progress panels;
8. explain local persistence and the current prototype boundary;
9. show the planned PostgreSQL schema and deployment path.

## 17. Reference files

- `README.md`: setup, environment variables, deployment guidance and security
  notes.
- `app/App.tsx`: primary Expo client implementation.
- `app/package.json`: client dependencies and scripts.
- `backend/pom.xml`: backend dependencies and Java version.
- `backend/src/main/java/com/homepal/controller/AiFoodController.java`: food
  lookup API and provider fallback flow.
- `backend/src/main/java/com/homepal/service/FoodNutritionService.java`: CSV
  loading, parsing and matching.
- `backend/src/main/resources/db/migration/V1__initial_schema.sql`: planned
  PostgreSQL schema.
- `.github/workflows/ci.yml`: CI build and type-check workflow.
- `docker-compose.yml`: local PostgreSQL and Redis services.

## 18. Final assessment

Fit Self has a credible product concept, a visually developed client, useful
Indian-food data coverage and a reasonable backend architecture direction. Its
current maturity is **prototype / early MVP**, not production release. The
largest gap is not UI functionality; it is the missing server-side
authentication and persistence layer. Completing that layer, adding tests and
normalizing nutrition data would convert the project from a compelling demo
into a dependable multi-user application.
