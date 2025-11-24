**Chirpy API Documentation**

This document describes the HTTP API provided by Chirpy (server code in `src/`). It covers available endpoints, request/response shapes, authentication, and examples to try locally.

**Base URL**: When running locally the server listens on the port set in environment (see `src/env.ts`). Example base: `http://localhost:3000`.

**Auth**: Use `Authorization` header.

- **Bearer**: `Authorization: Bearer <jwt_or_refresh_token>` — used for access tokens (JWT) and refresh tokens where noted.
- **API key**: `Authorization: ApiKey <key>` — used by `/api/polka/webhooks`.

**Endpoints**

- **GET /api/healthz**: Readiness probe
  - Response: `200 OK` text/plain `OK`

- **POST /api/users**: Create a new user
  - Body (JSON): `{ "email": "you@example.com", "password": "securepassword" }`
  - Response: `201 Created` JSON user object (example):
    ```json
    {
      "id": "uuid",
      "email": "you@example.com",
      "createdAt": "2023-09-01T...",
      "updatedAt": "2023-09-01T...",
      "isChirpyRed": false
    }
    ```

- **POST /api/login**: Authenticate and obtain tokens
  - Body (JSON): `{ "email": "you@example.com", "password": "securepassword" }`
  - Response: `200 OK` JSON with user fields plus `token` (JWT) and `refresh_token`:
    ```json
    {
      "id": "uuid",
      "email": "you@example.com",
      "createdAt": "...",
      "updatedAt": "...",
      "isChirpyRed": false,
      "token": "<jwt>",
      "refresh_token": "<refresh-token>"
    }
    ```

- **PUT /api/users**: Update current user
  - Auth: `Authorization: Bearer <access_token>` (JWT)
  - Body (JSON): `{ "email": "new@example.com", "password": "newpassword" }` (password min length 8)
  - Response: `200 OK` JSON updated user object.

- **POST /api/chirps**: Create a chirp (post)
  - Auth: `Authorization: Bearer <access_token>` (JWT)
  - Body (JSON): `{ "body": "Hello world" }` (max 140 chars)
  - Response: `201 Created` chirp object (example):
    ```json
    {
      "id": "uuid",
      "createdAt": "...",
      "updatedAt": "...",
      "body": "Hello world",
      "userId": "<author-id>"
    }
    ```

- **GET /api/chirps**: List chirps
  - Query: optional `authorId` to filter by user
  - Response: `200 OK` JSON array of chirp objects.

- **GET /api/chirps/:chirpID**: Get a single chirp
  - Response: `200 OK` JSON chirp object or `404` if not found.

- **DELETE /api/chirps/:chirpID**: Delete a chirp
  - Auth: `Authorization: Bearer <access_token>` (JWT)
  - Only the chirp owner can delete. If not owner, `403 Forbidden`.
  - Response: `204 No Content` (the code currently sends the deleted chirp body with 204).

- **POST /api/refresh**: Exchange a refresh token for a new access token
  - Auth: `Authorization: Bearer <refresh_token>` (send refresh token in Bearer header)
  - Response: `200 OK` `{ "token": "<new_jwt>" }`

- **POST /api/revoke**: Revoke a refresh token
  - Auth: `Authorization: Bearer <refresh_token>`
  - Response: `204 No Content`.

- **POST /api/polka/webhooks**: External webhook receiver (Polka)
  - Auth: `Authorization: ApiKey <POLKA_KEY>` (value in `env.POLKA_KEY`).
  - Body example:
    ```json
    {
      "event": "user.upgraded",
      "data": { "userId": "3311..." }
    }
    ```
  - If `event` is `user.upgraded` the server will mark the user as `isChirpyRed`.
  - Response: `204 No Content` or `404` if user not found.

- **GET /admin/metrics**: Admin-only metrics page (HTML)
  - Response: `200 OK` HTML showing fileserver hits.

- **POST /admin/reset**: Reset metrics and delete test users
  - Not allowed in production (returns `403` when `isProd()` is true).
  - Response: `200/204` or `403` when in production.

Auth Notes

- Access token: JWT returned by `/api/login`. Include in requests as `Authorization: Bearer <jwt>`.
- Refresh token: generated and returned by `/api/login`. Present it to `/api/refresh` and `/api/revoke` in the `Authorization: Bearer <refresh_token>` header.

Examples (curl)

- Create user

  ```bash
  curl -X POST http://localhost:3000/api/users \
    -H "Content-Type: application/json" \
    -d '{"email":"alice@example.com","password":"password123"}'
  ```

- Login

  ```bash
  curl -X POST http://localhost:3000/api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"alice@example.com","password":"password123"}'
  ```

- Create a chirp (with access token)

  ```bash
  curl -X POST http://localhost:3000/api/chirps \
    -H "Authorization: Bearer <ACCESS_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"body":"This is my chirp"}'
  ```

- Refresh access token (use refresh token in Bearer header)

  ```bash
  curl -X POST http://localhost:3000/api/refresh \
    -H "Authorization: Bearer <REFRESH_TOKEN>"
  ```

- Polka webhook (API key)
  ```bash
  curl -X POST http://localhost:3000/api/polka/webhooks \
    -H "Authorization: ApiKey <POLKA_KEY>" \
    -H "Content-Type: application/json" \
    -d '{"event":"user.upgraded","data":{"userId":"<USER_ID>"}}'
  ```

Run locally

- Install deps: `npm install`
- Start server: `npm run start` (uses `tsx ./src/index.ts`)
- Ensure environment variables (DB URL, JWT secret, POLKA_KEY, etc.) are set — see `src/env.ts`.

Notes & Implementation details

- Request body JSON parsing and malformed JSON errors are handled globally (returns `400 Malformed JSON`).
- Passwords are stored hashed (Argon2). JWTs are created with `src/utils/auth.ts`.
- The server serves static web app files at `/app`.
- Database schema for users/chirps is in `src/database/schema.ts`.
