// server.js - Socket.io Chat Server

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Data storage
const users = {}; // { socket.id: { username, id } }
const messages = []; // All messages
const typingUsers = {}; // { socket.id: username }

// Socket.io connection
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins
  socket.on("user_join", (username) => {
    users[socket.id] = { username, id: socket.id };
    io.emit("user_list", Object.values(users));
    io.emit("user_joined", { username, id: socket.id });
    console.log(`${username} joined the chat`);
  });

  // Global message
  socket.on("send_message", (data) => {
    const msg = {
      id: Date.now(),
      sender: users[socket.id]?.username || "Anonymous",
      senderId: socket.id,
      message: data.message,
      timestamp: new Date().toISOString(),
      reactions: [],
      readBy: [],
    };

    messages.push(msg);

    // Keep messages limited to 100
    if (messages.length > 100) messages.shift();

    io.emit("receive_message", msg);
  });

  // Private message
  socket.on("private_message", ({ to, message }) => {
    const msg = {
      id: Date.now(),
      sender: users[socket.id]?.username || "Anonymous",
      senderId: socket.id,
      to,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
      reactions: [],
      readBy: [],
    };

    socket.to(to).emit("private_message", msg); // send to recipient
    socket.emit("private_message", msg); // also send to sender
  });

  // Typing indicator
  socket.on("typing", (isTyping) => {
    if (!users[socket.id]) return;
    const username = users[socket.id].username;

    if (isTyping) typingUsers[socket.id] = username;
    else delete typingUsers[socket.id];

    io.emit("typing_users", Object.values(typingUsers));
  });

  // Message reactions
  socket.on("message_reaction", ({ msgId, reaction, user }) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg) return;

    msg.reactions = msg.reactions || [];
    msg.reactions.push({ user, reaction });

    // Emit update to all clients
    io.emit("message_updated", msg);
  });

  // Read receipts
  socket.on("message_read", ({ msgId, user }) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg) return;

    msg.readBy = msg.readBy || [];
    if (!msg.readBy.includes(user)) {
      msg.readBy.push(user);
    }

    io.emit("message_updated", msg);
  });

  // Disconnect
  socket.on("disconnect", () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      io.emit("user_left", { username, id: socket.id });
      console.log(`${username} left the chat`);
    }

    delete users[socket.id];
    delete typingUsers[socket.id];

    io.emit("user_list", Object.values(users));
    io.emit("typing_users", Object.values(typingUsers));
  });
});

// API routes
app.get("/api/messages", (req, res) => res.json(messages));
app.get("/api/users", (req, res) => res.json(Object.values(users)));

// Root
app.get("/", (req, res) => res.send("Socket.io Chat Server is running"));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, server, io };
