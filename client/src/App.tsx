import { useState, useEffect } from "react";
import { AuthModal } from "./components/AuthModal";
import { Dashboard } from "./components/Dashboard";
import { logout } from "./services/authService";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has a token
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="app">
        <div className="loadingScreen">
          <div className="spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {!isAuthenticated && <AuthModal onAuthSuccess={handleAuthSuccess} />}
      
      {isAuthenticated && (
        <>
          <header className="header">
            <h1>Banking Dashboard</h1>
            <button
              type="button"
              className="logoutButton"
              onClick={handleLogout}
            >
              Logout
            </button>
          </header>
          <main className="main">
            <Dashboard />
          </main>
        </>
      )}
    </div>
  );
}

export default App;
