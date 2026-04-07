import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../utils/api";
import s from "./Login.module.css";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [keepMe, setKeepMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const data = await loginUser({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      if (data.success === false) {
        setError(data.message || "Login failed.");
        return;
      }
      localStorage.setItem("user", JSON.stringify(data));
      if (data.role === "DOCTOR") nav("/doctor");
      else if (data.role === "ADMIN") nav("/admin-portal");
      else nav("/patient");
    } catch {
      setError(
        "Cannot connect to server. Is Spring Boot running on port 8080?",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.brand}>
          <div className={s.brandIcon}>✚</div>
          <span className={s.brandName}>MediBook</span>
        </div>

        <h1 className={s.title}>Login to Your Account</h1>
        <p className={s.sub}>Access your appointments and health records</p>

        {error && <div className={s.errorBox}>⚠ {error}</div>}

        <form onSubmit={submit} className={s.form}>
          <div className={s.field}>
            <label className={s.label}>EMAIL</label>
            <div className={s.inputWrap}>
              <span className={s.icon}>✉</span>
              <input
                className={s.input}
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handle}
                autoComplete="email"
              />
            </div>
          </div>

          <div className={s.field}>
            <div className={s.labelRow}>
              <label className={s.label}>PASSWORD</label>
              <span className={s.forgot}>Forgot Password?</span>
            </div>
            <div className={s.inputWrap}>
              <span className={s.icon}>🔒</span>
              <input
                className={s.input}
                type={showPw ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handle}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={s.eye}
                onClick={() => setShowPw((p) => !p)}
              >
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <label className={s.checkRow}>
            <input
              type="checkbox"
              checked={keepMe}
              onChange={(e) => setKeepMe(e.target.checked)}
              className={s.checkbox}
            />
            <span>Keep me logged in</span>
          </label>

          <button className={s.submitBtn} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login to MediBook →"}
          </button>
        </form>

        <div className={s.divider}>
          <hr />
          <span>OR CONTINUE WITH</span>
          <hr />
        </div>

        <button
          className={s.googleBtn}
          onClick={() => alert("Google login coming soon!")}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          Continue with Google
        </button>

        <p className={s.switchText}>
          Don't have an account?{" "}
          <span className={s.switchLink} onClick={() => nav("/register")}>
            Register
          </span>
        </p>

        <div className={s.footerLinks}>
          <span>PRIVACY POLICY</span>
          <span>TERMS OF SERVICE</span>
          <span>HELP CENTER</span>
        </div>
      </div>
    </div>
  );
}
