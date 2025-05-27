# Real-Time Chat Application

A real-time chat application built with **Node.js**, **Express**, **Socket.IO**, and **MongoDB**. This project supports one-on-one and group messaging, user authentication (including Google OAuth), email verification, and chat history. The application uses access and refresh tokens for secure session management and is designed to be scalable, secure, and user-friendly.

---

## Table of Contents
- [Features](#features)
  - [Core Features](#core-features)
  - [Enhanced Features](#enhanced-features)
  - [Future Features](#future-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core Features
- **Real-Time Messaging:** Send and receive messages instantly using Socket.IO for WebSocket communication.
- **User Authentication:** Secure signup/login with username/email/password or Google OAuth, using JWT and bcrypt.
- **Email Verification:** Users must verify their email via a confirmation link before accessing chat features.
- **Chat History:** Store and retrieve message history using MongoDB.
- **Token Management:** Use short-lived access tokens (1 hour) and long-lived refresh tokens (7 days) for secure sessions.

### Enhanced Features
- **Group Chats:** Support for chat rooms (e.g., 'general' room) using Socket.IO rooms.
- **Typing Indicators:** Display real-time "user is typing" notifications.

### Future Features
- **File Sharing:** Upload and share images/files, stored in a cloud service (e.g., AWS S3).
- **Push Notifications:** Notify users of new messages via Firebase Cloud Messaging.
- **Message Reactions:** Add emoji reactions to messages, stored in MongoDB.
- **Dark/Light Mode:** Toggle between themes for a personalized UI experience.

---

## Tech Stack
- **Backend:** Node.js, Express, Socket.IO
- **Database:** MongoDB (with Mongoose)
- **Authentication:** JSON Web Tokens (JWT), bcrypt, Passport.js (Google OAuth)
- **Email:** Nodemailer for sending verification emails
- **Frontend:** HTML, CSS, JavaScript
- **Caching:** Redis (optional for presence tracking)
- **Deployment:** Heroku, AWS, or Vercel (optional)

---

## Project Structure

```text
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
```

---

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/chat-app.git
cd chat-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory and add the following:
```env
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
```

### 4. Set Up MongoDB
- Use a local MongoDB instance or a cloud service like MongoDB Atlas.
- Update `MONGODB_URI` in the `.env` file with your connection string.

### 5. Set Up Google OAuth
- Create a project in [Google Cloud Console](https://console.cloud.google.com/).
- Enable the Google+ API and create OAuth 2.0 credentials.
- Set the callback URL to `http://localhost:3000/api/auth/google/callback`.

### 6. Set Up Email Service
- Use a Gmail account with an app-specific password (enable 2FA in your Google Account).
- Update `EMAIL_USER` and `EMAIL_PASS` in the `.env` file.

### 7. Run the Application
```bash
npm start
```
The server will run on [http://localhost:3000](http://localhost:3000) by default.

---

## Usage

### Access the Chat UI
1. Open [http://localhost:3000](http://localhost:3000) in your browser to access the chat interface.
2. Sign up or log in using email/password or Google OAuth.
3. Verify your email via the confirmation link sent to your inbox.
4. Start chatting in the 'general' room, with real-time messaging and typing indicators.

### API Endpoints
- `POST /api/auth/signup`: Register a new user (e.g., `{ "username": "user", "email": "user@example.com", "password": "pass" }`).
- `POST /api/auth/login`: Authenticate and receive access/refresh tokens.
- `GET /api/auth/google`: Initiate Google OAuth login.
- `GET /api/auth/google/callback`: Handle Google OAuth callback.
- `POST /api/auth/refresh-token`: Refresh access token using refresh token.
- `GET /api/auth/verify-email`: Verify email with token (e.g., `?token=your_token`).
- `GET /api/messages`: Retrieve chat history (requires authentication).

### Real-Time Features
- Connect to the Socket.IO server for real-time messaging.
- Join the 'general' room for group chats.
- Emit typing events to show typing indicators.

#### Example Client-Side Code
```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();
  socket.on('chat message', (msg) => {
    console.log('Message received:', msg);
  });
  socket.emit('chat message', { content: 'Hello, world!', room: 'general', userId: 'user_id' });
</script>
```

---

## Contributing
Contributions are welcome! To contribute:

1. **Fork** the repository.
2. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature
   ```
3. **Make your changes and commit**
   ```bash
   git commit -m "Add your feature"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/your-feature
   ```
5. **Open a Pull Request**.

Please ensure your code follows the project's style guidelines and includes tests (using Jest or Mocha).

---

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
