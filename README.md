# Fit Self

Fit Self is a nutrition and wellness tracking application focused on Indian
foods. It includes an Expo/React Native client, a Spring Boot backend, local
nutrition datasets, and a PostgreSQL/Redis Docker setup for production-like
development.

> **Project status:** prototype / early MVP. The UI and food lookup flow work,
> but authentication and server-side meal persistence are still demo-level.
> The current client stores profile, meals, and wellness values locally in the
> browser.

## What this repository contains

```text
HomePal/
├── app/                              Expo + React Native client
│   ├── App.tsx                       Main Fit Self application
│   ├── components/ui/                Reusable UI components
│   ├── assets/                       App icons and images
│   ├── package.json                  Frontend dependencies/scripts
│   └── app.json                      Expo configuration
├── backend/                          Spring Boot API
│   ├── src/main/java/                Controllers, services and entities
│   ├── src/main/resources/           Configuration and Flyway schema
│   └── pom.xml                       Maven dependencies
├── Indian_Food_Nutrition_Processed.csv
├── Indian Fruits And Nutritious Foods Dataset.csv
├── docker-compose.yml                Optional PostgreSQL + Redis stack
├── PROJECT_REPORT.md                 Detailed professional project report
└── .github/workflows/ci.yml          CI build/type-check workflow
```

## Prerequisites

Install these before starting:

| Tool | Recommended version | Required for |
|---|---:|---|
| Git | Latest | Cloning and updating the repository |
| Java JDK | 17 | Spring Boot backend |
| Maven | 3.9 or newer | Backend run/test commands |
| Node.js | 20 LTS | Expo frontend |
| npm | Included with Node.js | Frontend dependencies |
| Docker Desktop | Latest, optional | PostgreSQL and Redis containers |
| Expo Go | Latest, optional | Running on a physical phone |

Verify installations in a terminal:

```powershell
git --version
java -version
mvn -version
node --version
npm --version
docker --version
```

Java 17 and Node.js 20 are the important versions used by the CI workflow.
Docker is not required for the default local profile because the backend uses
an in-memory H2 database.

## Option A: Run in VS Code

### 1. Clone and open the project

Open the VS Code terminal with **Terminal > New Terminal**, then run:

```powershell
git clone https://github.com/Harshkala008/HomePal.git
cd HomePal
code .
```

If the repository is already downloaded, open the repository folder directly
with **File > Open Folder**.

### 2. Install frontend dependencies

Open a terminal in VS Code and run:

```powershell
cd app
npm install
```

### 3. Start the backend

Open a **second** VS Code terminal. From the repository root:

```powershell
cd backend
mvn spring-boot:run
```

The backend starts at:

- API: `http://localhost:8080`
- Health check: `http://localhost:8080/api/v1/health`
- Actuator health: `http://localhost:8080/actuator/health`

The default `local` profile uses H2 and does not require PostgreSQL. The
bundled CSV files are loaded from the repository root when the backend is
started from the `backend` directory.

### 4. Start the Expo client

Open a **third** VS Code terminal:

```powershell
cd app
npx expo start
```

Expo displays a QR code and keyboard shortcuts. Use:

- `w` to open the web version;
- `a` to open an Android emulator;
- `i` to open an iOS simulator on macOS; or
- Expo Go on a physical phone to scan the QR code.

For web-only development, use:

```powershell
cd app
npm run web
```

### 5. Test the application

1. Complete the Fit Self onboarding flow.
2. Set age, weight, height and a nutrition goal.
3. Search a local food such as `dosa`, `dal`, or `banana`.
4. Enter a serving quantity and log the food.
5. Open Progress to review calories, protein and hydration.
6. Try an unknown food only after configuring an AI provider key.

## Option B: Run in Google Antigravity or another AI coding workspace

The project does not require a special Antigravity integration. Any workspace
that provides a terminal, Git, Java 17, Maven, Node.js and npm can run it.

1. Import or clone `https://github.com/Harshkala008/HomePal`.
2. Open the repository root, the folder containing `backend`, `app`, and the
   two CSV files.
3. Install dependencies:

   ```bash
   cd app
   npm install
   ```

4. Create two terminal sessions:

   **Backend terminal**

   ```bash
   cd backend
   mvn spring-boot:run
   ```

   **Frontend terminal**

   ```bash
   cd app
   npx expo start --web
   ```

5. Open the URL printed by Expo. Keep the backend terminal running while
   testing food search.

On Linux/macOS, use `export NAME=value` instead of PowerShell's `$env:NAME =
'value'`. On hosted workspaces, `localhost` usually means the workspace
machine. If the browser cannot reach port 8080, expose/forward port 8080 in
the workspace and update the frontend API URL in `app/App.tsx`.

## AI food lookup configuration (optional)

The backend always checks the bundled datasets first. AI providers are only
needed for foods that are not found locally.

Set provider keys in the **backend terminal only**. Never put keys in
`app/App.tsx`, `app.json`, GitHub, or the browser.

### PowerShell

```powershell
$env:GROK_API_KEY = 'your-grok-key'
$env:GROK_MODEL = 'grok-3-mini'
$env:SARVAM_API_KEY = 'your-sarvam-key'
$env:SARVAM_MODEL = 'sarvam-m'
cd backend
mvn spring-boot:run
```

### Bash

```bash
export GROK_API_KEY='your-grok-key'
export GROK_MODEL='grok-3-mini'
export SARVAM_API_KEY='your-sarvam-key'
export SARVAM_MODEL='sarvam-m'
cd backend
mvn spring-boot:run
```

Grok is attempted first, followed by Sarvam. Provider nutrition values are
estimates and should not be treated as medical advice.

## Running on a physical phone

The client currently calls `http://localhost:8080`. On a physical phone,
`localhost` means the phone itself, not the development computer.

For local phone testing:

1. Put the phone and computer on the same Wi-Fi network.
2. Find the computer's LAN IP address, for example `192.168.1.25`.
3. Update the API URL in `app/App.tsx` from:

   ```text
   http://localhost:8080/api/v1/ai/food
   ```

   to:

   ```text
   http://192.168.1.25:8080/api/v1/ai/food
   ```

4. Restart Expo and scan the QR code.

For an Android emulator, `10.0.2.2` commonly maps to the host computer.
For iOS Simulator, `localhost` normally works. Windows Firewall may need to
allow Java on the private network.

## Optional PostgreSQL and Redis stack

The default local profile does not need Docker. To start the optional services,
install Docker Desktop, open a repository-root terminal, and run:

### PowerShell

```powershell
$env:POSTGRES_PASSWORD = 'choose-a-local-password'
docker compose up -d
docker compose ps
```

### Stop the services

```powershell
docker compose down
```

The containers expose PostgreSQL on `127.0.0.1:5432` and Redis on
`127.0.0.1:6379`. The current default `local` Spring profile still uses H2;
switching the application to PostgreSQL requires supplying the appropriate
Spring datasource configuration.

## Backend configuration

Important environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `local` | Spring profile |
| `SERVER_PORT` | `8080` | Backend HTTP port |
| `GROK_API_KEY` | empty | Optional Grok key |
| `GROK_MODEL` | `grok-3-mini` | Grok model |
| `SARVAM_API_KEY` | empty | Optional Sarvam key |
| `SARVAM_MODEL` | `sarvam-m` | Sarvam model |
| `CORS_ALLOWED_ORIGINS` | Local origins | Allowed frontend origins |
| `NUTRITION_PROCESSED_DATASET` | `../Indian_Food_Nutrition_Processed.csv` | Processed food CSV |
| `NUTRITION_FRUITS_DATASET` | `../Indian Fruits And Nutritious Foods Dataset.csv` | Fruit CSV |

Dataset paths are relative to the backend process working directory when
using the documented `cd backend` command.

## Useful commands

### Frontend

```powershell
cd app
npm install
npm run web
npx expo start
npx tsc --noEmit
```

### Backend

```powershell
cd backend
mvn spring-boot:run
mvn test
mvn package
```

### Git update workflow

```powershell
git pull
git status
git add .
git commit -m "Describe your change"
git push
```

## Troubleshooting

### `mvn` is not recognized

Install Apache Maven, add its `bin` directory to PATH, restart VS Code, and
run `mvn -version`. Also confirm that Java 17 is selected.

### `npm` or `npx` is not recognized

Install Node.js 20 LTS, restart VS Code, and run `node --version` and
`npm --version`.

### Food search says the backend is offline

Confirm that the backend terminal is still running and open
`http://localhost:8080/api/v1/health` in a browser. If using a phone, replace
`localhost` with the computer's LAN IP as described above.

### Expo dependencies or cache are broken

```powershell
cd app
npm install
npx expo start --clear
```

### Dataset lookup returns no result

Start the backend from the `backend` folder so the default relative dataset
paths resolve correctly. You can also set explicit absolute dataset paths with
`NUTRITION_PROCESSED_DATASET` and `NUTRITION_FRUITS_DATASET`.

### Port 8080 is already in use

Use another port:

```powershell
$env:SERVER_PORT = '8081'
cd backend
mvn spring-boot:run
```

Then update the client URL in `app/App.tsx` to use port `8081`.

## Security notes

- Never commit API keys, passwords, private keys, or `.env` files.
- Use environment variables or a deployment secret manager.
- Do not use the demo authentication flow as production authentication.
- Enable HTTPS before exposing the backend publicly.
- AI nutrition results are estimates and require verification for health use.

## CI

GitHub Actions runs:

- backend `mvn test` with Java 17; and
- frontend `npm install` and `npx tsc --noEmit` with Node.js 20.

## Further documentation

See [PROJECT_REPORT.md](PROJECT_REPORT.md) for the architecture, data
inventory, API summary, database design, limitations, security assessment and
recommended roadmap.
