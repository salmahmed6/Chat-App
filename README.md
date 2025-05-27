Real-Time Chat Application
A real-time chat application built with Node.js, Express, Socket.IO, and MongoDB. This project supports one-on-one and group messaging, user authentication (including Google OAuth), email verification, and chat history. The application uses access and refresh tokens for secure session management and is designed to be scalable, secure, and user-friendly.
Table of Contents

Features
Core Features
Enhanced Features
Future Features


Tech Stack
Project Structure
Installation
Usage
Contributing
License

Features
Core Features

Real-Time Messaging: Send and receive messages instantly using Socket.IO for WebSocket communication.
User Authentication: Secure signup/login with username/email/password or Google OAuth, using JWT and bcrypt.
Email Verification: Users must verify their email via a confirmation link before accessing chat features.
Chat History: Store and retrieve message history using MongoDB.
Token Management: Use short-lived access tokens (1 hour) and long-lived refresh tokens (7 days) for secure sessions.

Enhanced Features

Group Chats: Support for chat rooms (e.g., 'general' room) using Socket.IO rooms.
Typing Indicators: Display real-time "user is typing" notifications.

Future Features

File Sharing: Upload and share images/files, stored in a cloud service (e.g., AWS S3).
Push Notifications: Notify users of new messages via Firebase Cloud Messaging.
Message Reactions: Add emoji reactions to messages, stored in MongoDB.
Dark/Light Mode: Toggle between themes for a personalized UI experience.

Tech Stack

Backend: Node.js, Express, Socket.IO
Database: MongoDB (with Mongoose)
Authentication: JSON Web Tokens (JWT), bcrypt, Passport.js (Google OAuth)
Email: Nodemailer for sending verification emails
Frontend: HTML, CSS, JavaScript
Caching: Redis (optional for presence tracking)
Deployment: Heroku, AWS, or Vercel (optional)

Project Structure
chat-app/
├── public/                   # Client-side files
│   ├── index.html           # Main chat interface
│   └── styles.css           # Basic styling
├── src/                     # Server-side code
│   ├── config/             # Configuration files
│   │   ├── db.js           # MongoDB connection
│   │   └── passport.js     # Passport.js configuration
│   ├── controllers/        # Business logic for API endpoints
│   │   └── authController.js # Authentication logic
│   ├── models/             # MongoDB models
│   │   ├── User.js         # User schema
│   │   ├── Message.js      # Message schema
│   │   └── RefreshToken.js # Refresh token schema
│   ├── routes/             # API routes
│   │   └── auth.js         # Authentication routes
│   ├── sockets/            # Socket.IO logic
│   │   └── socket.js       # Real-time messaging logic
│   ├── middleware/         # Custom middleware
│   │   └── auth.js         # JWT authentication middleware
│   ├── utils/              # Utility functions
│   │   └── email.js        # Email sending logic
│   └── server.js           # Main server file
├── .env                    # Environment variables
├── .gitignore              # Git ignore patterns
├── package.json            # Dependencies and scripts
└── README.md               # Project documentation

Installation

Clone the Repository:
git clone https://github.com/your-username/chat-app.git
cd chat-app


Install Dependencies:
npm install


Set Up Environment Variables:Create a .env file in the root directory and add the following:
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password


Set Up MongoDB:

Use a local MongoDB instance or a cloud service like MongoDB Atlas.
Update MONGODB_URI in the .env file with your connection string.


Set Up Google OAuth:

Create a project in Google Cloud Console.
Enable the Google+ API and create OAuth 2.0 credentials.
Set the callback URL to http://localhost:3000/api/auth/google/callback.


Set Up Email Service:

Use a Gmail account with an app-specific password (enable 2FA in your Google Account).
Update EMAIL_USER and EMAIL_PASS in the .env file.


Run the Application:
npm start

The server will run on http://localhost:3000 by default.


Usage
Access the Chat UI

Open http://localhost:3000 in your browser to access the chat interface.
Sign up or log in using email/password or Google OAuth.
Verify your email via the confirmation link sent to your inbox.
Start chatting in the 'general' room, with real-time messaging and typing indicators.

API Endpoints

POST /api/auth/signup: Register a new user (e.g., { "username": "user", "email": "user@example.com", "password": "pass" }).
POST /api/auth/login: Authenticate and receive access/refresh tokens.
GET /api/auth/google: Initiate Google OAuth login.
GET /api/auth/google/callback: Handle Google OAuth callback.
POST /api/auth/refresh-token: Refresh access token using refresh token.
GET /api/auth/verify-email: Verify email with token (e.g., ?token=your_token).
GET /api/messages: Retrieve chat history (requires authentication).

Real-Time Features

Connect to the Socket.IO server for real-time messaging.
Join the 'general' room for group chats.
Emit typing events to show typing indicators.

Example Client-Side Code
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();
  socket.on('chat message', (msg) => {
    console.log('Message received:', msg);
  });
  socket.emit('chat message', { content: 'Hello, world!', room: 'general', userId: 'user_id' });
</script>

Contributing
Contributions are welcome! To contribute:

Fork the repository.
Create a new branch (git checkout -b feature/your-feature).
Make your changes and commit (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a Pull Request.

Please ensure your code follows the project's style guidelines and includes tests (using Jest or Mocha).
License
This project is licensed under the MIT License. See the LICENSE file for details.
