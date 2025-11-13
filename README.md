# Real-Time Chat Application with Socket.io

This assignment focuses on building a real-time chat application using Socket.io, implementing bidirectional communication between clients and server.

## Assignment Overview

You will build a chat application with the following features:
1. Real-time messaging using Socket.io
2. User authentication and presence
3. Multiple chat rooms or private messaging
4. Real-time notifications
5. Advanced features like typing indicators and read receipts

## Project Structure

```
socketio-chat/
├── client/                 # React front-end
│   ├── public/             # Static files
│   ├── src/                # React source code
│   │   ├── components/     # UI components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── socket/         # Socket.io client setup
│   │   └── App.jsx         # Main application component
│   └── package.json        # Client dependencies
├── server/                 # Node.js back-end
│   ├── config/             # Configuration files
│   ├── controllers/        # Socket event handlers
│   ├── models/             # Data models
│   ├── socket/             # Socket.io server setup
│   ├── utils/              # Utility functions
│   ├── server.js           # Main server file
│   └── package.json        # Server dependencies
└── README.md               # Project documentation
```

## Getting Started

1. Accept the GitHub Classroom assignment invitation
2. Clone your personal repository that was created by GitHub Classroom
3. Follow the setup instructions in the `Week5-Assignment.md` file
4. Complete the tasks outlined in the assignment

## Files Included

- `Week5-Assignment.md`: Detailed assignment instructions
- Starter code for both client and server:
  - Basic project structure
  - Socket.io configuration templates
  - Sample components for the chat interface

## Requirements

- Node.js (v18 or higher)
- npm or yarn
- Modern web browser
- Basic understanding of React and Express

## Submission

Your work will be automatically submitted when you push to your GitHub Classroom repository. Make sure to:

1. Complete both the client and server portions of the application
2. Implement the core chat functionality
3. Add at least 3 advanced features
4. Document your setup process and features in the README.md
5. Include screenshots or GIFs of your working application
6. Optional: Deploy your application and add the URLs to your README.md

## Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Building a Chat Application with Socket.io](https://socket.io/get-started/chat) 



Socket.io Real-Time Chat App

Project Overview

This is a real-time chat application built with React (frontend) and Node.js + Express + Socket.io (backend). It demonstrates bidirectional communication between clients and the server, supporting features such as live messaging, typing indicators, online status, private messaging, message reactions, read receipts, and notifications.

Features Implemented

Core Features:
 .Username-based authentication (simple join)
 .Global chat room for all users
 .Typing indicators
 .Online/offline status updates
 .Real-time display of messages with timestamps

Advanced Features:
 .Private messaging: send messages to selected users only
 .Message reactions: react to messages with emojis (👍, ❤️, 😂)
 .Read receipts: mark messages as read and show who has read them
 .Notifications;
    .Sound notification for new messages
    .Browser notifications using Web Notifications API

UX & Performance:
 .Auto-scroll to newest messages
 .Responsive design for desktop and mobile
 .Typing debounce to reduce unnecessary events
 .Message limit to 100 messages to optimize memory usage

Setup Instructions

Prerequisites:
 .Node.js v18+ installed
 .npm (Node package manager)

Clone Repository;
git clone <your-github-repo-url>
cd socketio-chat

Server Setup;
cd server
npm install
npm run dev


Server will run on http://localhost:5000

Client Setup
cd client
npm install
npm run dev


.Client will run on http://localhost:5173

Usage:
1.Open http://localhost:5173 in your browser.
2.Enter a username and click Join.
3.Start chatting globally or click a username to send a private message.
4.React to messages using emoji buttons.
5.Check who has read your messages in real-time.
6.Listen for notification sounds or browser alerts when messages arrive.

Screenshots / GIFs

(Replace these placeholders with your actual screenshots or GIFs)

Global Chat

Typing Indicator

Online Users

Private Message

Message Reactions

Read Receipts

Notification

Sending Message (GIF)

Project Structure
socketio-chat/
├─ client/            # React frontend
│  ├─ public/         # Static files (notification.mp3, images, favicon, etc.)
│  ├─ src/            # React components
│  └─ package.json
├─ server/            # Node.js + Express + Socket.io backend
│  └─ server.js
├─ .gitignore
└─ README.md
