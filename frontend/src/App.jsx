import { useState } from "react";
import TicketForm from "./components/TicketForm";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import "./App.css";

function getStoredAdmin() {
  try {
    const raw = localStorage.getItem("admin");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function App() {
  const [view, setView] = useState("submit");
  const [admin, setAdmin] = useState(getStoredAdmin());

  function handleLoginSuccess(adminData) {
    setAdmin(adminData);
    setView("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    setAdmin(null);
    setView("submit");
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>IT Support Ticketing System</h1>
        <nav>
          <button className={view === "submit" ? "active" : ""} onClick={() => setView("submit")}>
            Log an Issue
          </button>
          <button
            className={view === "admin" || view === "dashboard" ? "active" : ""}
            onClick={() => setView(admin ? "dashboard" : "admin")}
          >
            IT Staff Area
          </button>
        </nav>
      </header>

      <main>
        {view === "submit" && <TicketForm />}
        {view === "admin" && !admin && <AdminLogin onLoginSuccess={handleLoginSuccess} />}
        {view === "dashboard" && admin && (
          <AdminDashboard admin={admin} onLogout={handleLogout} />
        )}
      </main>
    </div>
  );
}

export default App;
