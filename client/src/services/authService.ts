import { toast } from "react-toastify";
import { API_URL, setToken } from "./api";

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

    setToken(result.token);
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

    setToken(result.token);
    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Login failed";
    toast.error(errorMessage);
    throw error;
  }
};

export const logout = (): void => {
  localStorage.removeItem("token");
  toast.success("Logged out successfully");
};




