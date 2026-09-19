# Real-Time Socket Chat App

A real-time chat application built with Node.js, Express, Socket.IO, and MongoDB, featuring real-time messaging, typing indicators, and online user counts.

## Features

- Real-Time Communication: Instant messaging powered by Socket.IO for seamless, bi-directional communication without page reloads.
- Message History: Persists chat history in MongoDB using Mongoose, retrieving recent messages upon user connection.
- Live User Tracking: Dynamically tracks and displays the current number of online users.
- Typing Indicators: Real-time "typing..." notifications so users know when others are composing a message.
- Data Validation & Safety: Input sanitization and length restrictions (maxlength) on usernames and messages to prevent spam and clean up data.

## Tech Stack

- Backend: Node.js, Express.js
- Real-Time Engine: Socket.IO
- Database: MongoDB, Mongoose
- Environment Management: Dotenv
- Frontend: HTML5, CSS3, Vanilla JavaScript

## Project Structure

```text
chat-socketio/
├── node_modules/
├── Views/
│   ├── index.html      # Frontend UI
│   ├── script.js       # Client-side Socket.IO logic
│   └── style.css       # Styling
├── .ENV                # Environment variables
├── .gitignore          # Git ignore file
├── package-lock.json   # Package lock file
├── package.json        # Project dependencies and scripts
├── readme.md           # Documentation file
└── server.js           # Main application entry point & Socket.IO server
