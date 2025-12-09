export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface Account {
  id: string;
  accountNumber: string;
  accountType: "CHECKING" | "SAVINGS";
  balance: number;
  accountHolder: string;
  createdAt: string;
  userId: string;
}

export interface Transaction {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
  amount: number;
  description: string;
  createdAt: string;
  accountId: string;
}

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  accountType?: "CHECKING" | "SAVINGS";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TransactionRequest {
  amount: number;
  description: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
  accountNumber?: string;
}
