import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Connect to backend

function App() {
  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // Private messaging
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Join chat
  const handleJoin = () => {
    if (username.trim()) {
      socket.emit("user_join", username);
      setIsJoined(true);
    }
  };

  // Send message (global or private)
  const sendMessage = () => {
    if (!message.trim()) return;

    if (selectedUser) {
      socket.emit("private_message", { to: selectedUser.id, message });
    } else {
      socket.emit("send_message", { message });
    }

    setMessage("");
    setSelectedUser(null);
  };

  // Typing indicator with debounce
  useEffect(() => {
    if (!isJoined) return;

    if (message.trim()) {
      socket.emit("typing", true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", false);
      }, 1500);
    } else {
      socket.emit("typing", false);
    }
  }, [message, isJoined]);

  // Listen for socket events
  useEffect(() => {
    socket.on("receive_message", (newMessage) => {
      setMessages((prev) => [...prev, { ...newMessage, reactions: [], readBy: [] }]);
      playNotification(newMessage);
    });

    socket.on("private_message", (newMessage) => {
      setMessages((prev) => [...prev, { ...newMessage, reactions: [], readBy: [] }]);
      playNotification(newMessage);
    });

    socket.on("message_updated", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
      );
    });

    socket.on("user_list", (users) => setOnlineUsers(users));
    socket.on("typing_users", (users) => setTypingUsers(users));

    return () => {
      socket.off("receive_message");
      socket.off("private_message");
      socket.off("message_updated");
      socket.off("user_list");
      socket.off("typing_users");
    };
  }, [username]);

  // Notification
  const playNotification = (msg) => {
    if (msg.sender !== username) {
      // Sound
      const audio = new Audio("/notification.mp3");
      audio.play();
      // Browser
      if (Notification.permission === "granted") {
        new Notification(`New message from ${msg.sender}`, { body: msg.message });
      }
    }
  };

  // Request notification permission
  useEffect(() => {
    if (Notification.permission !== "granted") Notification.requestPermission();
  }, []);

  // Add reaction
  const addReaction = (msgId, reaction) => {
    socket.emit("message_reaction", { msgId, reaction, user: username });
  };

  // Mark message as read
  const markAsRead = (msgId) => {
    socket.emit("message_read", { msgId, user: username });
  };

  return (
    <div style={{ fontFamily: "Arial", padding: 20 }}>
      {!isJoined ? (
        <div>
          <h2>Enter Chat Room</h2>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleJoin}>Join</button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "20px" }}>
          {/* Left side: Chat */}
          <div style={{ flex: 3 }}>
            <h2>Global Chat</h2>
            <div
              style={{
                border: "1px solid #ccc",
                padding: 10,
                height: 300,
                overflowY: "auto",
                marginBottom: 10,
              }}
            >
              {messages.map((msg) => {
                const isPrivate = msg.isPrivate && (msg.senderId === socket.id || msg.to === socket.id);
                return (
                  <div
                    key={msg.id}
                    onClick={() => markAsRead(msg.id)}
                    style={{
                      marginBottom: 5,
                      backgroundColor: isPrivate ? "#f0f0f0" : "transparent",
                      padding: isPrivate ? "2px 5px" : 0,
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    <strong>{msg.sender === username ? "You" : msg.sender}:</strong> {msg.message}{" "}
                    {isPrivate && <span style={{ fontSize: "0.7em", color: "blue" }}>(private)</span>}
                    <span style={{ fontSize: "0.8em", color: "gray" }}>
                      ({new Date(msg.timestamp).toLocaleTimeString()})
                    </span>

                    {/* Reactions */}
                    <div>
                      {["👍", "❤️", "😂"].map((r) => (
                        <button key={r} style={{ marginLeft: 5 }} onClick={() => addReaction(msg.id, r)}>
                          {r}
                        </button>
                      ))}
                      {msg.reactions?.length > 0 && (
                        <span style={{ marginLeft: 5, fontSize: "0.8em", color: "green" }}>
                          {msg.reactions.map((r) => r.reaction).join(" ")}
                        </span>
                      )}
                    </div>

                    {/* Read receipts */}
                    {msg.readBy?.length > 0 && (
                      <div style={{ fontSize: "0.7em", color: "purple" }}>
                        Read by: {msg.readBy.join(", ")}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <input
              type="text"
              placeholder={selectedUser ? `Private message to ${selectedUser.username}` : "Type a message..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              style={{ width: "70%", marginRight: 10 }}
            />
            <button onClick={sendMessage}>Send</button>

            {typingUsers.length > 0 && (
              <p style={{ fontStyle: "italic", color: "gray" }}>
                {typingUsers.filter((u) => u !== username).join(", ")} typing...
              </p>
            )}
          </div>

          {/* Right side: Online Users */}
          <div style={{ flex: 1 }}>
            <h3>Online Users ({onlineUsers.length})</h3>
            <ul>
              {onlineUsers
                .filter((user) => user.username !== username)
                .map((user) => (
                  <li key={user.id}>
                    {user.username}{" "}
                    <button
                      onClick={() => setSelectedUser(user)}
                      style={{ fontSize: "0.8em", marginLeft: 5 }}
                    >
                      Chat
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
