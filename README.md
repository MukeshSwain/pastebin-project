# Pastebin-Lite

A lightweight Pastebin-like application that allows users to create text pastes and share them via secure, expiring links.

---

## Deployed URL
https://pastebin-project.vercel.app/
---

## Public Git Repository
https://github.com/MukeshSwain/pastebin-project/tree/main
---

## How to Run the App Locally

### Backend
create an .env file :
``` bash
PORT=4000
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
BASE_URL=http://localhost:4000
TEST_MODE=0
NODE_ENV=development
```
in the controller file update the backend url :
``` bash
const url = http://localhost:4000
```

```bash
cd backend
npm install
npm run dev
```

### Frontend
in the api file update the backend url :
``` bash
const BASE_URL =  http://localhost:4000

```
``` bash
cd frontend
npm install
npm run dev
```
## Persistence Layer

PostgreSQL (Neon) is used as the persistence layer. It provides persistent,
serverless-safe storage and supports transactions to safely enforce TTL and
view-count limits under concurrent access.

## Important Design Decisions

- Database transactions with row-level locking are used to avoid race conditions.
- Both `/api/pastes/:id` and `/p/:id` consume views as specified.
- HTML rendering is handled on the backend with escaped content to prevent XSS.
- Deterministic expiry testing is supported using `TEST_MODE=1` and the
  `x-test-now-ms` request header.
