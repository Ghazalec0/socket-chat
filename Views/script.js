// =========================================
// SOCKET CONNECTION
// =========================================

const socket = window.io();

// =========================================
// DOM ELEMENTS
// =========================================

const usernameOverlay = document.querySelector("#username-overlay");

const usernameForm = document.querySelector("#username-form");

const usernameInput = document.querySelector("#username-input");

const chatApp = document.querySelector("#chat-app");

const messageForm = document.querySelector("#message-form");

const messageInput = document.querySelector("#message-input");

const messagesContainer = document.querySelector("#messages-container");

const onlineCount = document.querySelector("#online-count");

const typingContainer = document.querySelector("#typing-container");

const typingText = document.querySelector("#typing-text");

// =========================================
// CURRENT USER
// =========================================

let currentUsername = "";

// =========================================
// TYPING TIMER
// =========================================

let typingTimer;

// =========================================
// JOIN CHAT
// =========================================

usernameForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();

  if (!username) {
    return;
  }

  currentUsername = username.slice(0, 20);

  // Send username to server

  socket.emit("join-chat", currentUsername);

  // Hide username overlay

  usernameOverlay.style.display = "none";

  // Show chat

  chatApp.style.display = "flex";

  // Focus input

  messageInput.focus();
});

// =========================================
// SEND MESSAGE
// =========================================

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const message = messageInput.value.trim();

  if (!message) {
    return;
  }

  // Send message

  socket.emit("send-message", message);

  // Clear input

  messageInput.value = "";

  messageInput.style.height = "48px";

  socket.emit("stop-typing");
});

// =========================================
// ENTER TO SEND
// =========================================

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();

    messageForm.requestSubmit();
  }
});

// =========================================
// AUTO RESIZE
// =========================================

messageInput.addEventListener("input", () => {
  messageInput.style.height = "auto";

  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 130)}px`;
});

// =========================================
// TYPING
// =========================================

messageInput.addEventListener("input", () => {
  if (!currentUsername) {
    return;
  }

  socket.emit("typing");

  clearTimeout(typingTimer);

  typingTimer = setTimeout(() => {
    socket.emit("stop-typing");
  }, 800);
});

// =========================================
// RECEIVE NEW MESSAGE
// =========================================

socket.on("receive-message", (data) => {
  addMessage(data);
});

// =========================================
// MESSAGE HISTORY
// =========================================

socket.on("message-history", (messages) => {
  // Remove welcome message

  const welcomeMessage = document.querySelector(".welcome-message");

  if (welcomeMessage) {
    welcomeMessage.remove();
  }

  // Add old messages

  messages.forEach((message) => {
    addMessage({
      username: message.username,

      message: message.message,

      time: new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  });
});

// =========================================
// ONLINE USERS
// =========================================

socket.on("online-users", (count) => {
  onlineCount.textContent = count;
});

// =========================================
// USER JOINED
// =========================================

socket.on("user-joined", (data) => {
  addSystemMessage(`${data.username} joined the chat`);
});

// =========================================
// USER LEFT
// =========================================

socket.on("user-left", (data) => {
  addSystemMessage(`${data.username} left the chat`);
});

// =========================================
// USER TYPING
// =========================================

socket.on("user-typing", (username) => {
  typingText.textContent = `${username} is typing...`;

  typingContainer.style.visibility = "visible";
});

// =========================================
// STOP TYPING
// =========================================

socket.on("user-stop-typing", () => {
  typingText.textContent = "";
});

// =========================================
// ADD MESSAGE
// =========================================

function addMessage(data) {
  const welcomeMessage = document.querySelector(".welcome-message");

  if (welcomeMessage) {
    welcomeMessage.remove();
  }

  // Create wrapper

  const wrapper = document.createElement("div");

  wrapper.classList.add("message-wrapper");

  // Current user or other user

  if (data.username === currentUsername) {
    wrapper.classList.add("mine");
  } else {
    wrapper.classList.add("other");
  }

  // Username

  const username = document.createElement("div");

  username.classList.add("message-username");

  username.textContent = data.username;

  // Message

  const bubble = document.createElement("div");

  bubble.classList.add("message-bubble");

  // textContent prevents
  // HTML injection

  bubble.textContent = data.message;

  // Time

  const time = document.createElement("div");

  time.classList.add("message-time");

  time.textContent = data.time;

  // Build DOM

  wrapper.appendChild(username);

  wrapper.appendChild(bubble);

  wrapper.appendChild(time);

  // Add message

  messagesContainer.appendChild(wrapper);

  // Scroll

  scrollToBottom();
}

// =========================================
// SYSTEM MESSAGE
// =========================================

function addSystemMessage(message) {
  const element = document.createElement("div");

  element.classList.add("system-message");

  element.textContent = message;

  messagesContainer.appendChild(element);

  scrollToBottom();
}

// =========================================
// SCROLL
// =========================================

function scrollToBottom() {
  messagesContainer.scrollTo({
    top: messagesContainer.scrollHeight,

    behavior: "smooth",
  });
}
