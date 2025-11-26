/**
 * AccountList Component
 *
 * TECHNICAL ASSESSMENT NOTES:
 * This is a basic implementation with intentional areas for improvement:
 * - Basic error handling
 * - Simple loading state
 * - No skeleton loading
 * - No retry mechanism
 * - No pagination
 * - No sorting/filtering
 * - No animations
 * - No accessibility features
 * - No tests
 *
 * Candidates should consider:
 * - Component structure
 * - Error boundary implementation
 * - Loading states and animations
 * - User feedback
 * - Performance optimization
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Testing strategy
 */

import { useState, useEffect } from "react";
import { Transaction, User } from "../types";
import { getTransactions, getUsers, createTransaction } from "../api";
import styles from "./AccountList.module.css";
import { toast } from "react-toastify";

export function AccountList() {
  // Basic state management - Consider using more robust state management for larger applications
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  // Data fetching - Consider implementing retry logic, caching, and better error handling

  const fetchUsers = async () => {
    try {
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Basic loading and error states - Consider implementing skeleton loading and error boundaries
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Basic render logic - Consider implementing:
  // - Sorting and filtering
  // - Pagination
  // - Search functionality
  // - More interactive features
  // - Accessibility improvements
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

const UserCard = ({
  user,
  fetchUsers,
}: {
  user: User;
  fetchUsers: () => void;
}) => {
  const [showTransactions, setShowTransactions] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [showCreateTransaction, setShowCreateTransaction] = useState(false);
  const [createTransactionData, setCreateTransactionData] = useState({
    amount: 0,
    description: "",
    type: "" as "DEPOSIT" | "WITHDRAWAL" | "TRANSFER",
    accountNumber: "",
  });

  const _getTransactions = async (accountId: string, page: number = 1) => {
    setShowTransactions(true);

    const response = await getTransactions(accountId, page, 10);
    setTransactions(response.data);
    setCurrentPage(response.pagination.currentPage);
    setTotalPages(response.pagination.totalPages);
    setHasNextPage(response.pagination.hasNextPage);
    setHasPreviousPage(response.pagination.hasPreviousPage);
  };

  const _createTransaction = async (accountId: string) => {
    // Validation
    if (!createTransactionData.type) {
      toast.error("Please select a transaction type");
      return;
    }

    if (createTransactionData.amount <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }

    if (!createTransactionData.description) {
      toast.error("Please enter a description");
      return;
    }

    // For WITHDRAWAL and TRANSFER, account number is required
    if (
      (createTransactionData.type === "WITHDRAWAL" ||
        createTransactionData.type === "TRANSFER") &&
      !createTransactionData.accountNumber
    ) {
      toast.error(
        "Account number is required for " +
          createTransactionData.type.toLowerCase()
      );
      return;
    }

    try {
      await createTransaction(
        accountId,
        createTransactionData.amount,
        createTransactionData.description,
        createTransactionData.type,
        createTransactionData.accountNumber || "null"
      );
      setShowCreateTransaction(false);
      setCreateTransactionData({
        amount: 0,
        description: "",
        type: "" as "DEPOSIT" | "WITHDRAWAL" | "TRANSFER",
        accountNumber: "",
      });
      _getTransactions(accountId);
      fetchUsers();
    } catch (error) {
      // Error toast already handled in api.ts
      console.error("Transaction failed:", error);
    }
  };

  console.log(transactions, "skksksk");
  return (
    <div className={styles.card}>
      <h3>{user.name}</h3>
      <p>Account Number: {user.accountNumber}</p>
      <p>Balance: {user.balance}</p>
      <p>Email: {user.email}</p>
      <p>Created At: {user.createdAt}</p>
      <div>
        <button onClick={() => setShowCreateTransaction(true)}>
          Create Transaction
        </button>
        <button onClick={() => _getTransactions(user.accountId)}>
          View Transactions
        </button>
      </div>

      {showCreateTransaction && (
        <div className="createTransactionContainer">
          <input
            type="text"
            placeholder="Amount"
            className="input"
            onChange={(e) =>
              setCreateTransactionData({
                ...createTransactionData,
                amount: Number(e.target.value),
              })
            }
            value={createTransactionData.amount}
          />
          <input
            type="text"
            placeholder="Description"
            className="input"
            onChange={(e) =>
              setCreateTransactionData({
                ...createTransactionData,
                description: e.target.value,
              })
            }
            value={createTransactionData.description}
          />
          {createTransactionData.type !== "DEPOSIT" && (
            <input
              type="text"
              placeholder="Account Number"
              className="input"
              onChange={(e) =>
                setCreateTransactionData({
                  ...createTransactionData,
                  accountNumber: e.target.value,
                })
              }
              value={createTransactionData.accountNumber}
            />
          )}
          <select
            name="type"
            id="type"
            className="input"
            onChange={(e) =>
              setCreateTransactionData({
                ...createTransactionData,
                type: e.target.value as "DEPOSIT" | "WITHDRAWAL" | "TRANSFER",
              })
            }
            value={createTransactionData.type}
          >
            <option value="">Select a type</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="TRANSFER">Transfer</option>
            <option value="WITHDRAWAL">Withdrawal</option>
          </select>
          <button onClick={() => _createTransaction(user.accountId)}>
            Create Transaction
          </button>
        </div>
      )}

      {showTransactions && (
        <div className={styles.transactions}>
          <h4>Transactions</h4>
          {transactions.length > 0 ? (
            <div className={styles.transactionsContainer}>
              {transactions.map((transaction, index) => (
                <div key={transaction.id} className={"transactionItem"}>
                  <p>{(currentPage - 1) * 10 + index + 1}.</p>
                  <p>amount: {transaction.amount}</p>
                  <p>description: {transaction.description}</p>
                  <p>createdAt: {transaction.createdAt}</p>
                </div>
              ))}
              <div className="pagination">
                <button
                  onClick={() =>
                    _getTransactions(user.accountId, currentPage - 1)
                  }
                  disabled={!hasPreviousPage}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    _getTransactions(user.accountId, currentPage + 1)
                  }
                  disabled={!hasNextPage}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.transactionsList}>
              <p>No transactions found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
