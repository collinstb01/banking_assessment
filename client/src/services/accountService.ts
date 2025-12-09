import { toast } from "react-toastify";
import { API_URL, getAuthHeaders, removeToken } from "./api";

export interface Account {
  id: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  accountHolder: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
  amount: number;
  description: string;
  createdAt: string;
}

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

export const getUserAccount = async (): Promise<Account> => {
  try {
    const response = await fetch(`${API_URL}/user/account`, {
      headers: getAuthHeaders(),
    });

    if (response.status === 401 || response.status === 403) {
      removeToken();
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      throw new Error("Failed to fetch account");
    }

    return response.json();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load account";
    toast.error(errorMessage);
    throw error;
  }
};

export const getTransactions = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedTransactions> => {
  try {
    const response = await fetch(
      `${API_URL}/user/transactions?page=${page}&limit=${limit}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (response.status === 401 || response.status === 403) {
      removeToken();
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }

    return response.json();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch transactions";
    toast.error(errorMessage);
    throw error;
  }
};

export const createTransaction = async (
  amount: number,
  description: string,
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER",
  accountNumber?: string
): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/user/transactions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        amount,
        description,
        type,
        accountNumber,
      }),
    });

    if (response.status === 401 || response.status === 403) {
      removeToken();
      throw new Error("Session expired. Please login again.");
    }

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result.error || "Failed to create transaction";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    toast.success("Transaction completed successfully");
    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create transaction";
    throw new Error(errorMessage);
  }
};




