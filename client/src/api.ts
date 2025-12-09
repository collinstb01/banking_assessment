import { toast } from "react-toastify";

const API_URL = "http://localhost:3001/api";

// Get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem("token");
};

// Set token in localStorage
export const setToken = (token: string): void => {
  localStorage.setItem("token", token);
};

// Remove token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem("token");
};

// Auth headers
const getAuthHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export interface SignupData {
  name: string;
  email: string;
  password: string;
  accountType?: "CHECKING" | "SAVINGS";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    accountId?: string;
    accountNumber: string;
    accountType: string;
    balance: number;
  };
}

export const signup = async (data: SignupData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Signup failed");
    }

    // Save token
    localStorage.setItem("token", result.token);
    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Signup failed";
    toast.error(errorMessage);
    throw error;
  }
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Login failed");
    }

    // Save token
    localStorage.setItem("token", result.token);
    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Login failed";
    toast.error(errorMessage);
    throw error;
  }
};

export const logout = (): void => {
  removeToken();
  toast.success("Logged out successfully");
};

// Protected API calls
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

export const getTransactions = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedTransactions> => {
  try {
    const response = await fetch(
      `${API_URL}/transactions?page=${page}&limit=${limit}`,
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
    const response = await fetch(`${API_URL}/transactions`, {
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
