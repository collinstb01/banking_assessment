export interface Account {
  id: string;
  accountNumber: string;
  accountType: "CHECKING" | "SAVINGS";
  balance: number;
  accountHolder: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  accountId: string;
  accountNumber: string;
  accountType?: "CHECKING" | "SAVINGS";
  balance: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
  amount: number;
  description: string;
  createdAt: string;
}
