# Banking Dashboard Application

A full-stack banking dashboard application with JWT authentication, built with React, TypeScript, Node.js, and SQLite.

## Features

- User authentication (signup/login) with JWT
- Secure password hashing with bcrypt
- Personal account dashboard
- Transaction management (deposits, withdrawals, transfers)
- Transaction history with pagination
- Persistent SQLite database
- Responsive, modern UI

## Tech Stack

**Backend:**

- Node.js & Express
- TypeScript
- SQLite3
- JWT (jsonwebtoken)
- bcrypt for password hashing

**Frontend:**

- React 18
- TypeScript
- Vite
- CSS Modules
- React Toastify for notifications

## Project Structure

```
/
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/        # Configuration
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # Auth middleware
│   │   ├── models/        # Database setup
│   │   ├── routes/        # API routes
│   │   ├── types/         # TypeScript types
│   │   └── index.ts       # Server entry point
│   └── package.json
│
└── client/                # Frontend app
    ├── src/
    │   ├── components/    # React components
    │   ├── services/      # API services
    │   ├── utils/         # Utility functions
    │   ├── types/         # TypeScript types
    │   └── App.tsx
    └── package.json
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### 1. Install Dependencies

```bash
# Install root dependencies (optional)
npm install

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Start the Backend Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:3001`

### 3. Start the Frontend

Open a new terminal window:

```bash
cd client
npm run dev
```

The client will start on `http://localhost:5173`

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Create an account using the signup form
3. Login with your credentials
4. View your account dashboard
5. Perform transactions (deposit, withdrawal, transfer)
6. View transaction history

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user

### User (Protected)

- `GET /api/user/account` - Get user account details
- `POST /api/user/transactions` - Create new transaction
- `GET /api/user/transactions?page=1&limit=10` - Get transaction history

## Database

The application uses SQLite with a persistent database file (`banking.db`) that is created automatically on first run. The database includes:

- `users` table - User accounts with hashed passwords
- `accounts` table - Bank account information
- `transactions` table - Transaction records

## Security Features

- JWT-based authentication
- Password hashing with bcrypt (10 rounds)
- Protected API routes
- Token expiration (24 hours)
- Input validation and sanitization
- SQL injection prevention with parameterized queries

## Development

### Available Scripts

**Backend:**

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

**Frontend:**

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Notes

- The database file (`banking.db`) is gitignored and will be created on first run
- JWT secret should be changed in production via environment variables
- Default port for backend is 3001, frontend is 5173
- All passwords are securely hashed before storage

## Environment Variables (Optional)

Create a `.env` file in the server directory:

```env
PORT=3001
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

## Troubleshooting

**Port already in use:**

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Database errors:**

- Delete `banking.db` file and restart server to recreate with fresh schema

**Dependencies issues:**

- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

---

Built as a technical assessment project demonstrating full-stack development skills.
