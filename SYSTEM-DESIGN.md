# Banking System - Simple Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  AccountList Component                                      │   │
│  │  • Display users & balances                                 │   │
│  │  • Transaction forms (Deposit/Withdrawal/Transfer)          │   │
│  │  • Transaction history with pagination                      │   │
│  └────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ↓                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  API Layer (api.ts)                                         │   │
│  │  • getUsers()                                               │   │
│  │  • getTransactions(accountId, page, limit)                  │   │
│  │  • createTransaction(...)                                   │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ HTTP/JSON
                               │
┌──────────────────────────────┴──────────────────────────────────────┐
│                      SERVER (Express.js)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  REST API Endpoints                                         │   │
│  │  • GET  /api/users                                          │   │
│  │  • GET  /api/accounts                                       │   │
│  │  • GET  /api/accounts/:id/transactions?page=&limit=         │   │
│  │  • POST /api/transactions                                   │   │
│  └────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ↓                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Business Logic                                             │   │
│  │  ✓ Validate amount, account numbers                         │   │
│  │  ✓ Check balance before transfer/withdrawal                 │   │
│  │  ✓ Prevent same-account transfers                           │   │
│  │  ✓ Create dual transaction records for transfers            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ SQL Queries
                               │
┌──────────────────────────────┴──────────────────────────────────────┐
│                    DATABASE (SQLite)                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐      ┌──────────────┐      ┌────────────────┐   │
│  │   users     │      │   accounts   │      │  transactions  │   │
│  ├─────────────┤      ├──────────────┤      ├────────────────┤   │
│  │ id          │──┐   │ id           │──┐   │ id             │   │
│  │ name        │  │   │ accountNumber│  │   │ type           │   │
│  │ email       │  │   │ accountType  │  │   │ amount         │   │
│  │ createdAt   │  │   │ balance      │  │   │ description    │   │
│  └─────────────┘  │   │ accountHolder│  │   │ createdAt      │   │
│                   │   │ createdAt    │  │   │ accountId ─────┘   │
│                   │   │ userId ──────┘  │                         │
│                   │   └──────────────┘  │                         │
│                   └─────────────────────┘                         │
│                        1:N relationship                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Transaction Flow (Transfer Example)

```
┌──────────┐    ┌────────────┐    ┌─────────┐    ┌──────────┐
│   User   │───→│ Validation │───→│ Execute │───→│ Response │
│  Input   │    │  Checks    │    │ Transfer│    │  & UI    │
└──────────┘    └────────────┘    └─────────┘    └──────────┘
  amount           ✓ amount > 0      deduct         success
  target           ✓ balance OK      add to         updated
  description      ✓ target exists   target         balances
                   ✓ not same        create 2       refresh
                     account          records
```

## Key Features

- **Deposits**: Add money to account
- **Withdrawals**: Remove money (with balance check)
- **Transfers**: Move money between accounts
  - Validates source and target accounts
  - Checks sufficient balance
  - Creates transaction history for BOTH accounts
- **Transaction History**: Paginated list (page/limit params)
- **Validation**: All operations validated before execution
- **Error Handling**: Clear error messages (400/404/500)
