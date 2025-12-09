import { useState, useEffect, useCallback } from "react";
import type { Account, Transaction, PaginatedTransactions } from "../services/accountService";
import { getUserAccount, getTransactions, createTransaction } from "../services/accountService";
import { formatCurrency, formatDate, getRelativeTime } from "../utils/formatters";
import styles from "./Dashboard.module.css";
import { toast } from "react-toastify";

export function Dashboard() {
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [submittingTransaction, setSubmittingTransaction] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginatedTransactions["pagination"] | null>(null);

  const [transactionData, setTransactionData] = useState({
    amount: "",
    description: "",
    type: "" as "" | "DEPOSIT" | "WITHDRAWAL" | "TRANSFER",
    accountNumber: "",
  });

  const loadAccount = useCallback(async () => {
    try {
      const accountData = await getUserAccount();
      setAccount(accountData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load account");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTransactions = useCallback(async (page: number = 1) => {
    setLoadingTransactions(true);
    try {
      const data: PaginatedTransactions = await getTransactions(page, 10);
      setTransactions(data.data);
      setPagination(data.pagination);
      setCurrentPage(page);
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  useEffect(() => {
    loadAccount();
    loadTransactions();
  }, [loadAccount, loadTransactions]);

  const handleCreateTransaction = async () => {
    if (!transactionData.type) {
      toast.error("Please select a transaction type");
      return;
    }

    const amount = Number.parseFloat(transactionData.amount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount greater than zero");
      return;
    }

    if (!transactionData.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    if (
      (transactionData.type === "WITHDRAWAL" ||
        transactionData.type === "TRANSFER") &&
      !transactionData.accountNumber.trim()
    ) {
      toast.error(
        `Account number is required for ${transactionData.type.toLowerCase()}`
      );
      return;
    }

    setSubmittingTransaction(true);
    try {
      await createTransaction(
        amount,
        transactionData.description.trim(),
        transactionData.type,
        transactionData.accountNumber.trim() || undefined
      );

      setShowTransactionModal(false);
      setTransactionData({
        amount: "",
        description: "",
        type: "",
        accountNumber: "",
      });

      await loadAccount();
      await loadTransactions(currentPage);
    } finally {
      setSubmittingTransaction(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className={styles.errorState}>
        <h3>⚠️ Error Loading Account</h3>
        <p>{error || "Account not found"}</p>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={loadAccount}
        >
          Try Again
        </button>
      </div>
    );
  }

  const accountTypeClass =
    account.accountType?.toLowerCase() === "savings" ? "savings" : "checking";

  return (
    <div className={styles.container}>
      <div className={styles.accountCard}>
        <div className={styles.cardHeader}>
          <div className={styles.accountInfo}>
            <h2>{account.name}</h2>
            <p className={styles.email}>{account.email}</p>
            <p className={styles.accountNumber}>
              Account #: {account.accountNumber}
            </p>
            <span className={`${styles.accountType} ${styles[accountTypeClass]}`}>
              {account.accountType}
            </span>
          </div>
          <div className={styles.balance}>
            <p className={styles.balanceLabel}>Available Balance</p>
            <p className={styles.balanceAmount}>
              {formatCurrency(account.balance)}
            </p>
          </div>
        </div>

        <div className={styles.cardActions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => setShowTransactionModal(true)}
          >
            New Transaction
          </button>
        </div>
      </div>

      <div className={styles.transactionsSection}>
        <div className={styles.sectionHeader}>
          <h3>Transaction History</h3>
        </div>

        {loadingTransactions ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div className={styles.spinner} />
          </div>
        ) : transactions.length > 0 ? (
          <>
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
                        {transaction.type === "DEPOSIT" && "Credit"}
                        {transaction.type === "WITHDRAWAL" && "Debit"}
                        {transaction.type === "TRANSFER" && "Transfer"}
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
                        transaction.type === "TRANSFER") && "-"}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                );
              })}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  type="button"
                  onClick={() => loadTransactions(currentPage - 1)}
                  disabled={!pagination.hasPreviousPage || loadingTransactions}
                >
                  ← Previous
                </button>
                <span>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => loadTransactions(currentPage + 1)}
                  disabled={!pagination.hasNextPage || loadingTransactions}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.noTransactions}>
            <p>No transactions yet</p>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={() => setShowTransactionModal(true)}
            >
              Make your first transaction
            </button>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div
          className={styles.modal}
          onClick={() =>
            !submittingTransaction && setShowTransactionModal(false)
          }
          onKeyDown={(e) => {
            if (e.key === "Escape" && !submittingTransaction) {
              setShowTransactionModal(false);
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
                onClick={() => setShowTransactionModal(false)}
                disabled={submittingTransaction}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateTransaction();
              }}
            >
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="type">
                  Transaction Type *
                </label>
                <select
                  id="type"
                  className={styles.formSelect}
                  value={transactionData.type}
                  onChange={(e) =>
                    setTransactionData({
                      ...transactionData,
                      type: e.target.value as
                        | ""
                        | "DEPOSIT"
                        | "WITHDRAWAL"
                        | "TRANSFER",
                    })
                  }
                  disabled={submittingTransaction}
                  required
                >
                  <option value="">Select a type</option>
                  <option value="DEPOSIT">Deposit (Credit)</option>
                  <option value="WITHDRAWAL">Withdrawal (Debit)</option>
                  <option value="TRANSFER">Transfer to Another Account</option>
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
                  value={transactionData.amount}
                  onChange={(e) =>
                    setTransactionData({
                      ...transactionData,
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
                  value={transactionData.description}
                  onChange={(e) =>
                    setTransactionData({
                      ...transactionData,
                      description: e.target.value,
                    })
                  }
                  disabled={submittingTransaction}
                  required
                />
              </div>

              {(transactionData.type === "WITHDRAWAL" ||
                transactionData.type === "TRANSFER") && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="accountNumber">
                    {transactionData.type === "TRANSFER"
                      ? "Target Account Number *"
                      : "Account Number *"}
                  </label>
                  <input
                    id="accountNumber"
                    type="text"
                    placeholder="Enter account number"
                    className={styles.formInput}
                    value={transactionData.accountNumber}
                    onChange={(e) =>
                      setTransactionData({
                        ...transactionData,
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
                  onClick={() => setShowTransactionModal(false)}
                  disabled={submittingTransaction}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={submittingTransaction}
                >
                  {submittingTransaction ? "Processing..." : "Submit Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

