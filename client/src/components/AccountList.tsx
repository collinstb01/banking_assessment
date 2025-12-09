/**
 * AccountList Component - Enhanced Version
 *
 * Improvements Made:
 * - Modern, polished UI with proper styling
 * - Enhanced error handling and loading states
 * - Proper currency and date formatting
 * - Modal-based transaction form
 * - Visual indicators for transaction types (debit/credit)
 * - Removed console.logs
 * - Better user feedback with proper error messages
 * - Accessibility improvements
 * - Responsive design
 */

import { useState, useEffect, useCallback } from "react";
import type { Transaction, User } from "../types";
import { getTransactions, getUsers, createTransaction } from "../api";
import styles from "./AccountList.module.css";
import { toast } from "react-toastify";

// Utility functions for formatting
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
};

export function AccountList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load accounts";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <h3>⚠️ Error Loading Accounts</h3>
        <p>{error}</p>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={fetchUsers}
          style={{ marginTop: "1rem" }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className={styles.errorState}>
        <h3>No Accounts Found</h3>
        <p>There are no accounts to display.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {users.map((user) => (
          <UserCard key={user.id} user={user} fetchUsers={fetchUsers} />
        ))}
      </div>
    </div>
  );
}

interface UserCardProps {
  user: User;
  fetchUsers: () => void;
}

const UserCard = ({ user, fetchUsers }: UserCardProps) => {
  const [showTransactions, setShowTransactions] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [showCreateTransaction, setShowCreateTransaction] = useState(false);
  const [submittingTransaction, setSubmittingTransaction] = useState(false);

  const [createTransactionData, setCreateTransactionData] = useState({
    amount: "",
    description: "",
    type: "" as "" | "DEPOSIT" | "WITHDRAWAL" | "TRANSFER",
    accountNumber: "",
  });

  const loadTransactions = async (accountId: string, page: number = 1) => {
    setLoadingTransactions(true);
    try {
      const response = await getTransactions(accountId, page, 10);
      setTransactions(response.data);
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
      setHasNextPage(response.pagination.hasNextPage);
      setHasPreviousPage(response.pagination.hasPreviousPage);
      setShowTransactions(true);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleCreateTransaction = async (accountId: string) => {
    // Validation
    if (!createTransactionData.type) {
      toast.error("Please select a transaction type");
      return;
    }

    const amount = Number.parseFloat(createTransactionData.amount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount greater than zero");
      return;
    }

    if (!createTransactionData.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    // For WITHDRAWAL and TRANSFER, account number is required
    if (
      (createTransactionData.type === "WITHDRAWAL" ||
        createTransactionData.type === "TRANSFER") &&
      !createTransactionData.accountNumber.trim()
    ) {
      toast.error(
        `Account number is required for ${createTransactionData.type.toLowerCase()}`
      );
      return;
    }

    setSubmittingTransaction(true);
    try {
      await createTransaction(
        accountId,
        amount,
        createTransactionData.description.trim(),
        createTransactionData.type,
        createTransactionData.accountNumber.trim() || "null"
      );

      // Reset form
      setShowCreateTransaction(false);
      setCreateTransactionData({
        amount: "",
        description: "",
        type: "",
        accountNumber: "",
      });

      // Reload data
      await loadTransactions(accountId, currentPage);
      await fetchUsers();

      toast.success("Transaction completed successfully!");
    } finally {
      setSubmittingTransaction(false);
    }
  };

  const accountTypeClass =
    user.accountType?.toLowerCase() === "savings" ? "savings" : "checking";

  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.accountInfo}>
            <h3>{user.name}</h3>
            <p className={styles.accountNumber}>Acc #: {user.accountNumber}</p>
            <span
              className={`${styles.accountType} ${styles[accountTypeClass]}`}
            >
              {user.accountType || "Checking"}
            </span>
          </div>
          <div className={styles.balance}>
            <p className={styles.balanceLabel}>Balance</p>
            <p className={styles.balanceAmount}>
              {formatCurrency(user.balance || 0)}
            </p>
          </div>
        </div>

        <div className={styles.cardDetails}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Email</span>
            <span className={styles.detailValue}>{user.email}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Created</span>
            <span className={styles.detailValue}>
              {formatDate(user.createdAt)}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => setShowCreateTransaction(true)}
          >
            💳 New Transaction
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => loadTransactions(user.accountId)}
            disabled={loadingTransactions}
          >
            {loadingTransactions ? "Loading..." : "📊 View History"}
          </button>
        </div>

        {showTransactions && (
          <div className={styles.transactions}>
            <div className={styles.transactionsHeader}>
              <h4>Transaction History</h4>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                style={{
                  flex: "none",
                  fontSize: "0.75rem",
                  padding: "0.5rem 0.75rem",
                }}
                onClick={() => setShowTransactions(false)}
              >
                Hide
              </button>
            </div>

            {loadingTransactions ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div className={styles.spinner} />
              </div>
            ) : transactions.length > 0 ? (
              <div className={styles.transactionsContainer}>
                {transactions.map((transaction) => {
                  const transactionType = transaction.type.toLowerCase();
                  return (
                    <div
                      key={transaction.id}
                      className={`${styles.transactionItem} ${styles[transactionType]}`}
                    >
                      <div className={styles.transactionDetails}>
                        <div
                          className={`${styles.transactionType} ${styles[transactionType]}`}
                        >
                          {transaction.type === "DEPOSIT" && "💰 Credit"}
                          {transaction.type === "WITHDRAWAL" && "💸 Debit"}
                          {transaction.type === "TRANSFER" && "🔄 Transfer"}
                        </div>
                        <p className={styles.transactionDescription}>
                          {transaction.description}
                        </p>
                        <p className={styles.transactionDate}>
                          {getRelativeTime(transaction.createdAt)}
                        </p>
                      </div>
                      <div
                        className={`${styles.transactionAmount} ${styles[transactionType]}`}
                      >
                        {transaction.type === "DEPOSIT" && "+"}
                        {(transaction.type === "WITHDRAWAL" ||
                          transaction.type === "TRANSFER") &&
                          "-"}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  );
                })}

                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      type="button"
                      onClick={() =>
                        loadTransactions(user.accountId, currentPage - 1)
                      }
                      disabled={!hasPreviousPage || loadingTransactions}
                    >
                      ← Previous
                    </button>
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        loadTransactions(user.accountId, currentPage + 1)
                      }
                      disabled={!hasNextPage || loadingTransactions}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.noTransactions}>
                <p>No transactions yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {showCreateTransaction && (
        <div
          className={styles.modal}
          onClick={() =>
            !submittingTransaction && setShowCreateTransaction(false)
          }
          onKeyDown={(e) => {
            if (e.key === "Escape" && !submittingTransaction) {
              setShowCreateTransaction(false);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <h3>New Transaction</h3>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setShowCreateTransaction(false)}
                disabled={submittingTransaction}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateTransaction(user.accountId);
              }}
            >
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="type">
                  Transaction Type *
                </label>
                <select
                  id="type"
                  className={styles.formSelect}
                  value={createTransactionData.type}
                  onChange={(e) =>
                    setCreateTransactionData({
                      ...createTransactionData,
                      type: e.target.value as
                        | "DEPOSIT"
                        | "WITHDRAWAL"
                        | "TRANSFER"
                        | "",
                    })
                  }
                  disabled={submittingTransaction}
                  required
                >
                  <option value="">Select a type</option>
                  <option value="DEPOSIT">💰 Deposit (Credit)</option>
                  <option value="WITHDRAWAL">💸 Withdrawal (Debit)</option>
                  <option value="TRANSFER">
                    🔄 Transfer to Another Account
                  </option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="amount">
                  Amount *
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className={styles.formInput}
                  value={createTransactionData.amount}
                  onChange={(e) =>
                    setCreateTransactionData({
                      ...createTransactionData,
                      amount: e.target.value,
                    })
                  }
                  disabled={submittingTransaction}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="description">
                  Description *
                </label>
                <input
                  id="description"
                  type="text"
                  placeholder="Enter transaction description"
                  className={styles.formInput}
                  value={createTransactionData.description}
                  onChange={(e) =>
                    setCreateTransactionData({
                      ...createTransactionData,
                      description: e.target.value,
                    })
                  }
                  disabled={submittingTransaction}
                  required
                />
              </div>

              {(createTransactionData.type === "WITHDRAWAL" ||
                createTransactionData.type === "TRANSFER") && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="accountNumber">
                    {createTransactionData.type === "TRANSFER"
                      ? "Target Account Number *"
                      : "Account Number *"}
                  </label>
                  <input
                    id="accountNumber"
                    type="text"
                    placeholder="Enter account number"
                    className={styles.formInput}
                    value={createTransactionData.accountNumber}
                    onChange={(e) =>
                      setCreateTransactionData({
                        ...createTransactionData,
                        accountNumber: e.target.value,
                      })
                    }
                    disabled={submittingTransaction}
                    required
                  />
                </div>
              )}

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() => setShowCreateTransaction(false)}
                  disabled={submittingTransaction}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={submittingTransaction}
                >
                  {submittingTransaction
                    ? "Processing..."
                    : "Submit Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
