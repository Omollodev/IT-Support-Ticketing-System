import { useState } from "react";
import { api } from "../api";

const CATEGORIES = [
  { value: "network", label: "Network / Internet" },
  { value: "printer", label: "Printer" },
  { value: "hardware", label: "Other Hardware" },
  { value: "security", label: "Security Concern" },
  { value: "other", label: "Other" },
];

const URGENCY = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const INITIAL_FORM = {
  reporterName: "",
  office: "",
  category: "network",
  urgency: "medium",
  description: "",
};

function TicketForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: null, message: "" });

    try {
      const ticket = await api.submitTicket(form);
      setStatus({
        type: "success",
        message: `Ticket submitted. Reference ID: ${ticket._id}`,
      });
      setForm(INITIAL_FORM);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <h2>Log an IT Issue</h2>
      <p className="subtitle">Report network, printer, hardware, or security problems.</p>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Your name
          <input
            type="text"
            name="reporterName"
            value={form.reporterName}
            onChange={handleChange}
            required
            minLength={2}
            maxLength={100}
          />
        </label>

        <label>
          Office / Department
          <input
            type="text"
            name="office"
            value={form.office}
            onChange={handleChange}
            required
            minLength={2}
            maxLength={100}
          />
        </label>

        <label>
          Category
          <select name="category" value={form.category} onChange={handleChange} required>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Urgency
          <select name="urgency" value={form.urgency} onChange={handleChange}>
            {URGENCY.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Describe the issue
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            minLength={5}
            maxLength={1000}
            rows={4}
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>

      {status.type && (
        <p className={status.type === "success" ? "status-success" : "status-error"}>
          {status.message}
        </p>
      )}
    </div>
  );
}

export default TicketForm;
