# HomePal

HomePal is a nutrition and calorie tracking app built for local laptop development and mobile-friendly deployment. This repo is configured to run without needing a full Postgres install first, then can be moved to free cloud hosting later.

## What works right now

- Java 17 + Spring Boot backend scaffold runs locally
- Local development profile uses H2 so it works on a laptop without PostgreSQL installed first
- Expo app runs locally on a phone or emulator
- Docker compose file is included for Postgres + Redis if you want a production-like local environment
- CI workflow skeleton is included

## Local development setup

### 1) Backend

```powershell
cd backend
mvn spring-boot:run
```

To enable Sarvam food lookup, set the replacement key in the backend terminal before starting Spring Boot. Never put this key in `app/App.tsx`, `app.json`, Git, or the browser.

```powershell
$env:SARVAM_API_KEY = 'paste-your-new-sarvam-key-here'
$env:SARVAM_MODEL = 'sarvam-m'
mvn spring-boot:run
```

The web app uses `POST http://localhost:8080/api/v1/ai/food` for food lookup. The backend checks `Indian_Food_Nutrition_Processed.csv` and `Indian Fruits And Nutritious Foods Dataset.csv` first, then uses Sarvam for foods that are not present locally. Dataset paths can be overridden with `NUTRITION_PROCESSED_DATASET` and `NUTRITION_FRUITS_DATASET`. If both the datasets and Sarvam cannot identify a food, the endpoint returns a clear error.

Every food log requires an explicit portion size in the app; it is never silently defaulted to one serving.

Default profile is `local`, which uses H2. The app will run on:

- http://localhost:8080
- http://localhost:8080/actuator/health

### 2) Mobile app

```powershell
cd app
npm install
npx expo start
```

Then:

- open Expo Go on your phone
- scan the QR code
- or use an Android emulator / iOS simulator

### 3) Optional full local stack

Set a local database password before starting the containers:

```powershell
$env:POSTGRES_PASSWORD = 'choose-a-local-password'
```

```powershell
cd <project-directory>
docker compose up -d
```

This provides PostgreSQL and Redis for a more realistic local host setup.

## Free hosting options

### Best free options

1. Render
   - backend: deploy Spring Boot jar
   - database: free Postgres add-on
   - env vars: DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD
   - domain: free HTTPS

2. Railway
   - backend and Postgres in one project
   - easy deploy from GitHub
   - free tier is usually enough for a starter app

3. Fly.io
   - simple Java deploy
   - free-tier options for small apps

4. Vercel/Netlify for frontend only
   - good for static web frontend, but not ideal for Java backend

### Recommended free path

Use:

- frontend: Expo app via Expo Go / EAS preview
- backend: Render or Railway
- database: Postgres add-on on Render/Railway

## Deploy path for your laptop + phone

### Local laptop

- run backend on your machine
- run Expo app with local LAN mode
- on your phone, connect to the same Wi‑Fi network
- open Expo Go, then scan the QR code

### Production-like public hosting

- deploy the Spring Boot backend to Render/Railway
- set `CORS_ALLOWED_ORIGINS` to the Expo app origin or your web frontend URL
- in the app, point API base URL to the hosted backend

## Mobile phone setup

For Android:

- install Expo Go
- run the app with `npx expo start`
- scan the QR code

For iPhone:

- install Expo Go
- connect to the same Wi‑Fi as your laptop or use a tunnel
- run `npx expo start --tunnel`

## Environment variables

Backend example:

```powershell
$env:SPRING_PROFILES_ACTIVE='local'
$env:SERVER_PORT='8080'
$env:CORS_ALLOWED_ORIGINS='http://localhost:8081,http://localhost:19006,http://10.0.2.2:19006'
```

Production example:

```powershell
$env:SPRING_PROFILES_ACTIVE='prod'
$env:DB_URL='jdbc:postgresql://host:5432/homepal'
$env:DB_USERNAME='homepal'
$env:DB_PASSWORD='your-password'
$env:CORS_ALLOWED_ORIGINS='https://your-app.example.com'
```

## Security notes

- do not commit secrets
- use .env or secret manager values in deployed environments
- keep JWT secret material in environment variables only
- enforce HTTPS in prod

## Build commands

```powershell
cd backend
mvn test

cd ..\app
npx tsc --noEmit
```

## Recommended next action

1. Start the backend locally
2. Start the Expo app
3. Test the health endpoint
4. Then deploy the backend to a free host and point the app to the hosted URL
5. Keep the app stable by validating after every change with `mvn test` and `npx tsc --noEmit`

