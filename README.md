# Real-Time Socket Chat App

A real-time chat application built with Node.js, Express, Socket.IO, and MongoDB, featuring real-time messaging, typing indicators, and online user counts.

## Features

- Real-Time Communication: Instant messaging powered by Socket.IO for seamless, bi-directional communication without page reloads.
- Message History: Persists chat history in MongoDB using Mongoose, retrieving recent messages upon user connection.
- Live User Tracking: Dynamically tracks and displays the current number of online users.
- Typing Indicators: Real-time "typing..." notifications so users know when others are composing a message.
- Data Validation & Safety: Input sanitization and length restrictions on usernames and messages to prevent spam and clean up data.

## Tech Stack

- Backend: Node.js, Express.js (v5.2.1)
- Real-Time Engine: Socket.IO (v4.8.3)
- Database: MongoDB, Mongoose (v9.9.5)
- Environment Management: Dotenv (v17.4.2)
- Frontend: HTML5, CSS3, Vanilla JavaScript

## Project Structure

```text
chat-socketio/
├── node_modules/
├── Views/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── .env
├── .gitignore
├── package-lock.json
├── package.json
├── readme.md
└── server.js
