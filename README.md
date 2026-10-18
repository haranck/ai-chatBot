<div align="center">

# Pseudo AI

**A full-stack AI chat app with Google sign-in, saved conversations, and fast replies from Groq.**

[**Live demo →**](https://ai-chat-bot-t3ln.vercel.app)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-gpt--oss-F55036)

</div>

<!-- Add a screenshot here: ![Pseudo AI screenshot](docs/screenshot.png) -->

## Features

- **Sign in with Google.** No passwords to manage.
- **Saved chat history.** Conversations are stored in MongoDB, so you can continue them on any device.
- **Remembers the conversation.** Recent messages are sent back to the model with each new question.
- **Markdown replies.** Tables, lists and links render properly, and code blocks get syntax highlighting and a copy button.
- **Fast and free.** Runs on Groq's free tier with `gpt-oss-20b`, and switches to `gpt-oss-120b` automatically when the first model hits its rate limit.
- **Works on phones.** Mobile layout, and a prompt to open the page in Chrome or Safari when it is viewed inside Instagram, Facebook or another in-app browser where Google sign-in is blocked.
- **Secure sessions.** Short-lived access tokens kept in memory, rotating refresh tokens in an `httpOnly` cookie, and rate limits on sign-in and chat.

## Tech stack

| Part | Tools |
| --- | --- |
| **Client** | React 19, TypeScript, Vite, Axios, `@react-oauth/google`, `react-markdown`, `react-syntax-highlighter`, Lucide icons |
| **Server** | Node.js, Express 5, TypeScript, Mongoose, Zod, Helmet, `express-rate-limit`, `google-auth-library`, JWT |
| **AI** | [Groq](https://console.groq.com) through the OpenAI SDK (`openai/gpt-oss-20b`, `openai/gpt-oss-120b`) |
| **Hosting** | Vercel (client), Render (server), MongoDB Atlas (database) |

## Project structure

```
.
├── client/                 # React + Vite frontend
│   └── src/
│       ├── auth/           # Google sign-in and session context
│       ├── components/     # Chat page, sidebar, messages, input, login screen
│       ├── services/api.ts # Axios client with automatic token refresh
│       └── types/
└── server/                 # Express + TypeScript API
    └── src/
        ├── config/         # Groq client and auth settings
        ├── controllers/    # Request handlers
        ├── services/       # Business logic (AI, auth, conversations)
        ├── repositories/   # MongoDB data access
        ├── models/         # Mongoose schemas
        ├── middleware/     # Auth, rate limits, error handling
        ├── routes/
        ├── validators/     # Zod request schemas
        └── server.ts       # Entry point
```

## Getting started

### Prerequisites

- **Node.js 22.12+**
- A **MongoDB** database (a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works)
- A **Groq API key**, free at [console.groq.com/keys](https://console.groq.com/keys)
- A **Google OAuth Client ID** from [Google Cloud Console](https://console.cloud.google.com/apis/credentials). Add `http://localhost:5173` to its *Authorized JavaScript origins*.

### 1. Clone the repo

```bash
git clone https://github.com/haranck/ai-chatBot.git
cd ai-chatBot
```

### 2. Set up the server

```bash
cd server
cp .env.example .env
npm install
```

Fill in `server/.env`:

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Port to listen on (default `3000`) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `GROQ_API_KEY` | Yes | Your Groq API key |
| `GROQ_MODEL` | No | Main model (default `openai/gpt-oss-20b`) |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth Client ID (the same one the client uses) |
| `JWT_ACCESS_SECRET` | Yes | Random secret for access tokens |
| `JWT_REFRESH_SECRET` | Yes | A different random secret for refresh tokens |
| `CLIENT_ORIGINS` | No | Extra allowed frontend URLs, comma-separated |
| `NODE_ENV` | No | Set to `production` when deployed, so the refresh cookie works across sites |

Generate each JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Start the API in dev mode (reloads on changes):

```bash
npm run dev
```

### 3. Set up the client

In a second terminal:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Fill in `client/.env`:

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | Server URL, e.g. `http://localhost:3000/api` |
| `VITE_GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |

Open **http://localhost:5173** and sign in with Google.

## Scripts

| Folder | Command | What it does |
| --- | --- | --- |
| `server` | `npm run dev` | Run the API with auto-reload (nodemon + ts-node) |
| `server` | `npm run build` | Install dependencies and compile TypeScript to `dist/` |
| `server` | `npm start` | Run the compiled server from `dist/` |
| `client` | `npm run dev` | Start the Vite dev server |
| `client` | `npm run build` | Type-check and build for production |
| `client` | `npm run preview` | Preview the production build |
| `client` | `npm run lint` | Run ESLint |

> **Note:** `npm start` runs the compiled code in `dist/`. After changing server code, run `npm run build` again before restarting.

## API

All routes start with `/api`. Routes marked 🔒 need an `Authorization: Bearer <accessToken>` header.

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/auth/google` | Exchange a Google ID token for an access token and a refresh cookie |
| `POST` | `/auth/refresh` | Get a new access token using the refresh cookie |
| `POST` | `/auth/logout` | End the session and clear the cookie |
| `GET` | `/auth/me` 🔒 | Get the signed-in user |
| `POST` | `/chat` 🔒 | Send a message. Body: `{ message, conversationId? }` |
| `GET` | `/conversations` 🔒 | List your conversations |
| `GET` | `/conversations/:id/messages` 🔒 | Get the messages in a conversation |
| `DELETE` | `/conversations/:id` 🔒 | Delete a conversation |

**Rate limits:** 100 auth requests per 15 minutes per IP, and 20 chat messages per minute per user.

## How sign-in works

1. The client gets an ID token from Google and sends it to `POST /api/auth/google`.
2. The server verifies it, then returns a **15-minute access token** and sets a **7-day refresh token** in an `httpOnly` cookie.
3. The client keeps the access token in memory only, never in `localStorage`.
4. When the access token expires, the client calls `/auth/refresh`. The refresh token is rotated each time, and only its hash is stored in the database.

## Deployment

**Server (Render or similar)**

- Root directory: `server`
- Build command: `npm run build`
- Start command: `npm start`
- Add every variable from `server/.env`, plus `NODE_ENV=production`
- Add your frontend URL to `CLIENT_ORIGINS`

**Client (Vercel or similar)**

- Root directory: `client`
- Framework preset: Vite
- Set `VITE_API_BASE_URL` to your deployed server, e.g. `https://your-api.onrender.com/api`
- Set `VITE_GOOGLE_CLIENT_ID`
- Add the deployed frontend URL to the Google OAuth client's *Authorized JavaScript origins*

## Author

**Haran** · [@haranck](https://github.com/haranck)
