// AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../utils/api";

export default function AdminLogin() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "prasannachinnam24@gmail.com", password: "password" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser({
        email: form.email,
        password: form.password,
      });
      if (data.success === false)
        return setError(data.message || "Login failed.");
      if (data.role !== "ADMIN")
        return setError("Access denied. Admin credentials required.");
      localStorage.setItem("user", JSON.stringify(data));
      nav("/admin-portal");
    } catch {
      setError("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1a202c",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#2d3748",
          borderRadius: 16,
          padding: 40,
          width: 360,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚙</div>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#f7fafc",
            marginBottom: 4,
          }}
        >
          Admin Access
        </h1>
        <p style={{ fontSize: 13, color: "#718096", marginBottom: 24 }}>
          Internal use only
        </p>
        {error && (
          <div
            style={{
              background: "rgba(239,68,68,.15)",
              border: "1px solid rgba(239,68,68,.3)",
              color: "#fc8181",
              borderRadius: 8,
              padding: 10,
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}
        <form
          onSubmit={submit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            style={{
              background: "#1a202c",
              border: "1px solid #4a5568",
              borderRadius: 8,
              padding: "11px 14px",
              fontSize: 14,
              color: "#f7fafc",
              outline: "none",
              fontFamily: "inherit",
            }}
            type="email"
            placeholder="Admin email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
          <input
            style={{
              background: "#1a202c",
              border: "1px solid #4a5568",
              borderRadius: 8,
              padding: "11px 14px",
              fontSize: 14,
              color: "#f7fafc",
              outline: "none",
              fontFamily: "inherit",
            }}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm((p) => ({ ...p, password: e.target.value }))
            }
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: 12,
              background: "#fbbf24",
              color: "#1a202c",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Signing in..." : "Access Admin Panel"}
          </button>
        </form>
      </div>
    </div>
  );
}
