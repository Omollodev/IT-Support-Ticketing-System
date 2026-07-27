import { useEffect, useState } from "react";
import { api } from "../api";

const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

function AdminDashboard({ admin, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [ticketData, statsData] = await Promise.all([
        api.listTickets(filter),
        api.getStats(),
      ]);
      setTickets(ticketData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleStatusChange(id, status) {
    try {
      await api.updateTicket(id, { status });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>IT Support Dashboard</h2>
        <div>
          <span className="admin-name">{admin.name}</span>
          <button className="secondary" onClick={onLogout}>
            Log out
          </button>
        </div>
      </div>

      {stats && (
        <div className="stats-row">
          <div className="stat-box">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Tickets</span>
          </div>
          {stats.byStatus.map((s) => (
            <div className="stat-box" key={s._id}>
              <span className="stat-number">{s.count}</span>
              <span className="stat-label">{STATUS_LABELS[s._id] || s._id}</span>
            </div>
          ))}
        </div>
      )}

      <div className="filter-row">
        <label>
          Filter by status:
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </label>
      </div>

      {error && <p className="status-error">{error}</p>}
      {loading ? (
        <p>Loading tickets...</p>
      ) : (
        <table className="ticket-table">
          <thead>
            <tr>
              <th>Reported by</th>
              <th>Office</th>
              <th>Category</th>
              <th>Urgency</th>
              <th>Description</th>
              <th>Status</th>
              <th>Logged</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t._id}>
                <td>{t.reporterName}</td>
                <td>{t.office}</td>
                <td>{t.category}</td>
                <td>{t.urgency}</td>
                <td className="description-cell">{t.description}</td>
                <td>
                  <select value={t.status} onChange={(e) => handleStatusChange(t._id, e.target.value)}>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
                <td>{new Date(t.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={7}>No tickets found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminDashboard;
