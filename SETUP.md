# Quick Setup Guide

## Option 1: Quick Start (Recommended)

```bash
# 1. Install all dependencies at once
npm run install-all

# 2. Start both servers
npm run dev
```

This will start:

- Backend on http://localhost:3001
- Frontend on http://localhost:5173

## Option 2: Manual Setup

```bash
# 1. Install backend dependencies
cd server
npm install

# 2. Install frontend dependencies
cd ../client
npm install

# 3. Start backend (in one terminal)
cd ../server
npm run dev

# 4. Start frontend (in another terminal)
cd ../client
npm run dev
```

## First Time Usage

1. Open browser to http://localhost:5173
2. Click "Sign Up" tab
3. Create your account
4. Start using the dashboard!

## What You'll See

- **Signup/Login Modal** - Authenticate to access your account
- **Account Dashboard** - View your balance and account details
- **New Transaction** - Create deposits, withdrawals, or transfers
- **Transaction History** - View all past transactions with pagination

## Troubleshooting

**"Port already in use" error:**

```bash
# Kill the process
lsof -ti:3001 | xargs kill -9
# or
lsof -ti:5173 | xargs kill -9
```

**Database issues:**

```bash
# Delete and recreate database
rm server/banking.db
# Restart server
```

**Module not found:**

```bash
# Reinstall dependencies
npm run install-all
```

---

That's it! You're ready to use the banking dashboard.
