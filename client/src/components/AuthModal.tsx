import { useState } from "react";
import styles from "./AuthModal.module.css";
import {
  login,
  signup,
  type SignupData,
  type LoginData,
} from "../services/authService";

interface AuthModalProps {
  onAuthSuccess: () => void;
}

export function AuthModal({ onAuthSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState<SignupData>({
    name: "",
    email: "",
    password: "",
    accountType: "CHECKING",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(loginData);
      onAuthSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signup(signupData);
      onAuthSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authModal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Banking Dashboard</h2>
          <p>Manage your finances with ease</p>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "login" ? styles.active : ""}`}
            onClick={() => {
              setActiveTab("login");
              setError(null);
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "signup" ? styles.active : ""}`}
            onClick={() => {
              setActiveTab("signup");
              setError(null);
            }}
          >
            Sign Up
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {activeTab === "login" ? (
          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label htmlFor="login-email" className={styles.formLabel}>
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className={styles.formInput}
                placeholder="your@email.com"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="login-password" className={styles.formLabel}>
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className={styles.formInput}
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <div className={styles.formGroup}>
              <label htmlFor="signup-name" className={styles.formLabel}>
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                className={styles.formInput}
                placeholder="John Doe"
                value={signupData.name}
                onChange={(e) =>
                  setSignupData({ ...signupData, name: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="signup-email" className={styles.formLabel}>
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                className={styles.formInput}
                placeholder="your@email.com"
                value={signupData.email}
                onChange={(e) =>
                  setSignupData({ ...signupData, email: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="signup-password" className={styles.formLabel}>
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                className={styles.formInput}
                placeholder="At least 6 characters"
                value={signupData.password}
                onChange={(e) =>
                  setSignupData({ ...signupData, password: e.target.value })
                }
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="account-type" className={styles.formLabel}>
                Account Type
              </label>
              <select
                id="account-type"
                className={styles.formSelect}
                value={signupData.accountType}
                onChange={(e) =>
                  setSignupData({
                    ...signupData,
                    accountType: e.target.value as "CHECKING" | "SAVINGS",
                  })
                }
                disabled={loading}
              >
                <option value="CHECKING">Checking Account</option>
                <option value="SAVINGS">Savings Account</option>
              </select>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}

        <div className={styles.welcomeText}>
          {activeTab === "login"
            ? "New here? Switch to Sign Up to create an account."
            : "Already have an account? Switch to Login."}
        </div>
      </div>
    </div>
  );
}

