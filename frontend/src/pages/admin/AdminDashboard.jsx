import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAppts, getAllDoctors, updateApptStatus } from "../../utils/api";
import s from "./AdminDashboard.module.css";

const NAV = [
  { key: "overview", icon: "📊", label: "Overview" },
  { key: "appointments", icon: "📋", label: "All Appointments" },
  { key: "doctors", icon: "🩺", label: "Doctors" },
];

export default function AdminDashboard() {
  const nav = useNavigate();
  const [active, setActive] = useState("overview");
  const [appts, setAppts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) {
      nav("/admin-login");
      return;
    }
    const parsed = JSON.parse(u);
    if (parsed.role !== "ADMIN") {
      nav("/admin-login");
      return;
    }
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [a, d] = await Promise.all([getAllAppts(), getAllDoctors()]);
      setAppts(Array.isArray(a) ? a : []);
      setDoctors(Array.isArray(d) ? d : []);
    } catch {}
  };

  const handleStatus = async (id, status) => {
    await updateApptStatus(id, status);
    loadAll();
  };

  const filtered =
    filter === "ALL" ? appts : appts.filter((a) => a.status === filter);
  const revenue = appts
    .filter((a) => a.status === "COMPLETED")
    .reduce((s, a) => s + (a.fee || 0), 0);
  const sCls = {
    BOOKED: "stBOOKED",
    COMPLETED: "stCOMPLETED",
    CANCELLED: "stCANCELLED",
    NO_SHOW: "stNO_SHOW",
  };

  return (
    <div className={s.layout}>
      <aside className={s.sidebar}>
        <div className={s.sidebarTop}>
          <div className={s.adminBadge}>⚙ Admin</div>
          <div className={s.adminSub}>MediBook Portal</div>
        </div>
        <nav className={s.sidebarNav}>
          {NAV.map((item) => (
            <button
              key={item.key}
              className={`${s.navItem} ${active === item.key ? s.navActive : ""}`}
              onClick={() => setActive(item.key)}
            >
              <span className={s.navIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <button
          className={s.logoutBtn}
          onClick={() => {
            localStorage.removeItem("user");
            nav("/");
          }}
        >
          Sign Out
        </button>
      </aside>

      <main className={s.main}>
        {/* ── OVERVIEW ── */}
        {active === "overview" && (
          <div className={s.page}>
            <h1 className={s.pageTitle}>Overview</h1>
            <div className={s.statsGrid}>
              {[
                ["📋", "Total", appts.length, ""],
                [
                  "✅",
                  "Confirmed",
                  appts.filter((a) => a.status === "BOOKED").length,
                  "var(--teal)",
                ],
                [
                  "🩺",
                  "Completed",
                  appts.filter((a) => a.status === "COMPLETED").length,
                  "var(--green)",
                ],
                ["💰", "Revenue", "₹" + revenue.toLocaleString(), "#d97706"],
              ].map(([icon, label, val, col]) => (
                <div key={label} className={s.statCard}>
                  <div className={s.statIcon}>{icon}</div>
                  <div className={s.statNum} style={col ? { color: col } : {}}>
                    {val}
                  </div>
                  <div className={s.statLabel}>{label}</div>
                </div>
              ))}
            </div>
            <div className={s.twoCol}>
              <div className={s.whiteCard}>
                <h3 className={s.cardTitle}>By Mode</h3>
                {[
                  ["ONLINE", appts.filter((a) => a.mode === "ONLINE").length],
                  ["OFFLINE", appts.filter((a) => a.mode === "OFFLINE").length],
                ].map(([mode, cnt]) => (
                  <div key={mode} className={s.modeRow}>
                    <span
                      className={`${s.modePill} ${mode === "ONLINE" ? s.mOnline : s.mOffline}`}
                    >
                      {mode}
                    </span>
                    <strong>{cnt}</strong>
                  </div>
                ))}
              </div>
              <div className={s.whiteCard}>
                <h3 className={s.cardTitle}>By Status</h3>
                {["BOOKED", "COMPLETED", "CANCELLED", "NO_SHOW"].map((st) => (
                  <div key={st} className={s.modeRow}>
                    <span className={`${s.statusPill} ${s[sCls[st]]}`}>
                      {st}
                    </span>
                    <strong>
                      {appts.filter((a) => a.status === st).length}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ALL APPOINTMENTS ── */}
        {active === "appointments" && (
          <div className={s.page}>
            <h1 className={s.pageTitle}>All Appointments</h1>
            <div className={s.whiteCard}>
              <div className={s.filterRow}>
                {["ALL", "BOOKED", "COMPLETED", "CANCELLED", "NO_SHOW"].map(
                  (f) => (
                    <button
                      key={f}
                      className={`${s.filterBtn} ${filter === f ? s.filterActive : ""}`}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                    </button>
                  ),
                )}
              </div>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Specialty</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Mode</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        style={{
                          textAlign: "center",
                          padding: 32,
                          color: "var(--text-3)",
                        }}
                      >
                        No appointments
                      </td>
                    </tr>
                  ) : (
                    filtered.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{a.user?.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                            {a.user?.email}
                          </div>
                        </td>
                        <td>Dr. {a.doctor?.name}</td>
                        <td style={{ color: "var(--text-3)" }}>
                          {a.doctor?.specialty}
                        </td>
                        <td>{a.date}</td>
                        <td>{a.time}</td>
                        <td>
                          <span
                            className={`${s.modePill} ${a.mode === "ONLINE" ? s.mOnline : s.mOffline}`}
                          >
                            {a.mode}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: "var(--teal)" }}>
                          ₹{a.fee || "—"}
                        </td>
                        <td>
                          <span
                            className={`${s.statusPill} ${s[sCls[a.status]]}`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td>
                          {a.status === "BOOKED" && (
                            <div style={{ display: "flex", gap: 4 }}>
                              <button
                                className={s.acceptBtn}
                                onClick={() => handleStatus(a.id, "COMPLETED")}
                              >
                                Complete
                              </button>
                              <button
                                className={s.declineBtn}
                                onClick={() => handleStatus(a.id, "CANCELLED")}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── DOCTORS ── */}
        {active === "doctors" && (
          <div className={s.page}>
            <h1 className={s.pageTitle}>Doctors</h1>
            <div className={s.whiteCard}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Specialty</th>
                    <th>Mode</th>
                    <th>Fee</th>
                    <th>Experience</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 500 }}>Dr. {d.name}</td>
                      <td style={{ color: "var(--text-3)", fontSize: 12 }}>
                        {d.email}
                      </td>
                      <td>{d.specialty}</td>
                      <td>
                        <span
                          className={`${s.modePill} ${d.mode === "ONLINE" ? s.mOnline : d.mode === "OFFLINE" ? s.mOffline : s.mBoth}`}
                        >
                          {d.mode}
                        </span>
                      </td>
                      <td style={{ color: "var(--teal)", fontWeight: 600 }}>
                        ₹{d.consultFee || "—"}
                      </td>
                      <td style={{ color: "var(--text-3)" }}>
                        {d.experience || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
