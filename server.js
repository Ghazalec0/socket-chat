const express = require("express");
const http = require("http");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

// ========================================
// Environment Variables
// ========================================

dotenv.config();

// ========================================
// Express App
// ========================================

const app = express();

// ========================================
// HTTP Server
// ========================================

const server = http.createServer(app);

// ========================================
// Socket.IO Server
// ========================================

const io = new Server(server);

// ========================================
// MongoDB Connection
// ========================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// ========================================
// MESSAGE MODEL
// ========================================

const messageSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

// ========================================
// Create Message Model
// ========================================

const Message = mongoose.model("Message", messageSchema);

// ========================================
// Static Files
// ========================================

app.use(express.static(path.join(__dirname, "Views")));

// ========================================
// Home Route
// ========================================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Views", "index.html"));
});

// ========================================
// SOCKET.IO
// ========================================

io.on("connection", async (socket) => {
  console.log(`New socket connected: ${socket.id}`);

  // ====================================
  // ONLINE USERS
  // ====================================

  io.emit("online-users", io.engine.clientsCount);

  // ====================================
  // JOIN CHAT
  // ====================================

  socket.on("join-chat", async (username) => {
    try {
      // -------------------------------
      // Validate Username
      // -------------------------------

      if (typeof username !== "string") {
        username = "Guest";
      }

      username = username.trim();

      if (!username) {
        username = "Guest";
      }

      username = username.slice(0, 20);

      // -------------------------------
      // Save username in socket
      // -------------------------------

      socket.data.username = username;

      // -------------------------------
      // Send username to current client
      // -------------------------------

      socket.emit("joined-successfully", username);

      // -------------------------------
      // Notify other users
      // -------------------------------

      socket.broadcast.emit("user-joined", {
        username,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      // -------------------------------
      // Send old messages
      // -------------------------------

      const messages = await Message.find()
        .sort({ createdAt: 1 })
        .limit(100)
        .lean();

      socket.emit("message-history", messages);
    } catch (error) {
      console.error("Join chat error:", error);
    }
  });

  // ====================================
  // SEND MESSAGE
  // ====================================

  socket.on("send-message", async (message) => {
    try {
      // -------------------------------
      // Validate message
      // -------------------------------

      if (typeof message !== "string") {
        return;
      }

      message = message.trim();

      if (!message) {
        return;
      }

      // Limit message size

      message = message.slice(0, 500);

      // -------------------------------
      // Get username
      // -------------------------------

      const username = socket.data.username || "Guest";

      // -------------------------------
      // Save Message in MongoDB
      // -------------------------------

      const newMessage = await Message.create({
        username,
        message,
      });

      // -------------------------------
      // Prepare data
      // -------------------------------

      const messageData = {
        id: newMessage._id,

        username: newMessage.username,

        message: newMessage.message,

        time: newMessage.createdAt.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // -------------------------------
      // Send message to EVERYONE
      // -------------------------------

      io.emit("receive-message", messageData);
    } catch (error) {
      console.error("Send message error:", error);
    }
  });

  // ====================================
  // TYPING
  // ====================================

  socket.on("typing", () => {
    const username = socket.data.username || "Someone";

    socket.broadcast.emit("user-typing", username);
  });

  // ====================================
  // STOP TYPING
  // ====================================

  socket.on("stop-typing", () => {
    socket.broadcast.emit("user-stop-typing");
  });

  // ====================================
  // DISCONNECT
  // ====================================

  socket.on("disconnect", () => {
    const username = socket.data.username || "Guest";

    console.log(`${username} disconnected`);

    // Notify other users

    socket.broadcast.emit("user-left", {
      username,

      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    // Update online users

    io.emit("online-users", io.engine.clientsCount);
  });
});

// ========================================
// SERVER
// ========================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
