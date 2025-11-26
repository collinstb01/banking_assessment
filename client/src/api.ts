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

export interface PaginatedTransactions {
  data: Transaction[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const getTransactions = async (
  accountId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedTransactions> => {
  try {
    const response = await fetch(
      `${API_URL}/accounts/${accountId}/transactions?page=${page}&limit=${limit}`
    );
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
      const errorData = await response.json();
      const errorMessage = errorData.error || "Failed to create transaction";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
    toast.success("Transaction created successfully");
    return response.json();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create transaction";
    toast.error(errorMessage);
    throw error;
  }
};
