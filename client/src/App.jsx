
import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // ✅ Connect to your backend

function App() {
  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  // Join chat
  const handleJoin = () => {
    if (username.trim()) {
      socket.emit("user_join", username);
      setIsJoined(true);
    }
  };

  // Send message
  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send_message", { text: message });
      setMessage("");
    }
  };

  // Handle typing indicator
  useEffect(() => {
    if (!isJoined) return;

    if (message.trim()) {
      socket.emit("typing", true);
    } else {
      socket.emit("typing", false);
    }

    const timeout = setTimeout(() => {
      socket.emit("typing", false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [message, isJoined]);

  // Listen for messages, users, and typing
  useEffect(() => {
    socket.on("receive_message", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("user_list", (users) => {
      console.log("Received users:", users); // ✅
      setOnlineUsers(users);
    });

    socket.on("typing_users", (users) => {
      setTypingUsers(users);
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_list");
      socket.off("typing_users");
    };
  }, []);

  // UI
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
              {messages.map((msg) => (
                <div key={msg.id}>
                  <strong>{msg.sender}:</strong> {msg.text}{" "}
                  <span style={{ fontSize: "0.8em", color: "gray" }}>
                    ({new Date(msg.timestamp).toLocaleTimeString()})
                  </span>
                </div>
              ))}
            </div>

            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              style={{ width: "70%", marginRight: 10 }}
            />
            <button onClick={sendMessage}>Send</button>

            {typingUsers.length > 0 && (
              <p style={{ fontStyle: "italic", color: "gray" }}>
                {typingUsers.join(", ")} typing...
              </p>
            )}
          </div>

          {/* Right side: Online Users */}
          <div style={{ flex: 1 }}>
            <h3>Online Users ({onlineUsers.length})</h3>
            <ul>
              {onlineUsers.map((user) => (
                <li key={user.id}>{user.username}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
