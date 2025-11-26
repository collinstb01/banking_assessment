import { toast } from "react-toastify";
import { Account, Transaction, User } from "./types";

const API_URL = "http://localhost:3001/api";

export const getAccounts = async (): Promise<Account[]> => {
  const response = await fetch(`${API_URL}/accounts`);
  if (!response.ok) {
    throw new Error("Failed to fetch accounts");
  }
  return response.json();
};

export const getAccount = async (id: string): Promise<Account> => {
  const response = await fetch(`${API_URL}/accounts/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch account");
  }
  return response.json();
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    return response.json();
  } catch {
    toast.error("Failed to fetch users");
    throw new Error("Failed to fetch users");
  }
};

export const getTransactions = async (
  userId: string
): Promise<Transaction[]> => {
  try {
    const response = await fetch(`${API_URL}/transactions/${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }
    return response.json();
  } catch {
    toast.error("Failed to fetch transactions");
    throw new Error("Failed to fetch transactions");
  }
};

export const createTransaction = async (
  accountId: string,
  amount: number,
  description: string,
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER",
  accountNumber: string
): Promise<Transaction> => {
  try {
    const response = await fetch(`${API_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        description,
        type,
        accountId,
        accountNumber,
      }),
    });
    if (!response.ok) {
      toast.error("Failed to create transaction");
      throw new Error("Failed to create transaction");
    }
    toast.success("Transaction created successfully");
    return response.json();
  } catch {
    toast.error("Failed to create transaction");
    throw new Error("Failed to create transaction");
  }
};
