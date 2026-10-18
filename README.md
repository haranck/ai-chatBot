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



## Author

**Haran** · [@haranck](https://github.com/haranck)
