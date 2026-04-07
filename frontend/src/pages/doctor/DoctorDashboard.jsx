import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDoctorAppts,
  getDoctorSlots,
  addSlot,
  deleteSlot,
  updateApptStatus,
  getDoctorSummary,
  confirmAppointment 
} from "../../utils/api";
import s from "./DoctorDashboard.module.css";

const NAV = [
  { key: "appointments", icon: "📋", label: "Appointments" },
  { key: "schedule", icon: "📅", label: "Schedule" },
  { key: "summary", icon: "📊", label: "Daily Summary" },
  { key: "profile", icon: "👤", label: "Profile" },
];

const TIMES = [

  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

export default function DoctorDashboard() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("appointments");
  const [appts, setAppts] = useState([]);
  const [slots, setSlots] = useState([]);
  const [summary, setSummary] = useState(null);
  const [newSlot, setNewSlot] = useState({ date: "", timeSlot: "" });
  const [slotMsg, setSlotMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

 useEffect(() => {
  const u = localStorage.getItem("user");
  if (!u) {
    nav("/login");
    return;
  }

  const parsed = JSON.parse(u);
  if (parsed.role !== "DOCTOR") {
    nav("/login");
    return;
  }

  setUser(parsed);

  // Initial load
  loadAppts(parsed.id);
  loadSlots(parsed.id);
  loadSummary(parsed.id);

  setNewSlot((p) => ({
    ...p,
    date: new Date().toISOString().split("T")[0],
  }));

  // 🔥 AUTO REFRESH EVERY 3 SECONDS
  const interval = setInterval(() => {
    loadAppts(parsed.id);
    loadSummary(parsed.id);
  }, 3000);

  // Cleanup
  return () => clearInterval(interval);

}, []);

  const loadAppts = async (id) => {
    try {
      const d = await getDoctorAppts(id);
      setAppts(Array.isArray(d) ? d : []);
    } catch {}
  };
  const loadSlots = async (id) => {
    try {
      const d = await getDoctorSlots(id);
      setSlots(Array.isArray(d) ? d : []);
    } catch {}
  };
  const loadSummary = async (id) => {
    try {
      const d = await getDoctorSummary(id);
      setSummary(d);
    } catch {}
  };


const handleConfirm = async (id) => {
  try {
    await confirmAppointment(id);

    alert("Appointment Confirmed ✅");

    loadAppts(user.id);
    loadSummary(user.id);
  } catch (err) {
    console.error(err);
    alert("Error confirming appointment");
  }
};


  const handleAddSlot = async () => {
    if (!newSlot.date || !newSlot.timeSlot)
      return setSlotMsg({
        type: "error",
        text: "Please fill in date and time.",
      });
    setLoading(true);
    try {
      const data = await addSlot({
        doctorId: String(user.id),
        date: newSlot.date,
        timeSlot: newSlot.timeSlot,
        mode: user.mode,
      });
      if (data.success === false)
        return setSlotMsg({ type: "error", text: data.message });
      setSlotMsg({ type: "success", text: "Slot added successfully!" });
      setNewSlot((p) => ({ ...p, timeSlot: "" }));
      loadSlots(user.id);
    } catch {
      setSlotMsg({ type: "error", text: "Server error." });
    } finally {
      setLoading(false);
      setTimeout(() => setSlotMsg({ type: "", text: "" }), 3000);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!confirm("Delete this slot?")) return;
    try {
      await deleteSlot(id);
      loadSlots(user.id);
    } catch {}
  };

  const handleStatus = async (id, status) => {
    await updateApptStatus(id, status);
    loadAppts(user.id);
    loadSummary(user.id);
  };

  if (!user) return null;
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "D";
  const confirmed = appts.filter((a) => a.status === "CONFIRMED").length;
  const completed = appts.filter((a) => a.status === "COMPLETED").length;

  return (
    <div className={s.layout}>
      {/* SIDEBAR */}
      <aside className={s.sidebar}>
        <div className={s.sidebarTop}>
          <div className={s.av}>{initials}</div>
          <div className={s.sName}>{user.name}</div>
          <div className={s.sSpec}>{user.specialty || "Doctor"}</div>
          <div className={s.sEmail}>{user.email}</div>
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
            nav("/login");
          }}
        >
          Sign Out
        </button>
      </aside>

      {/* MAIN */}
      <main className={s.main}>
        <div className={s.welcomeBanner}>Welcome, {user.name}!!!</div>

        {/* ── APPOINTMENTS ── */}
        {active === "appointments" && (
          <div className={s.page}>
            <h1 className={s.pageTitle}>Appointments</h1>
            <div className={s.statsRow}>
              <div className={s.statCard}>
                <div className={s.statNum}>{appts.length}</div>
                <div className={s.statLabel}>Total</div>
              </div>
              <div className={s.statCard}>
                <div className={s.statNum} style={{ color: "var(--teal)" }}>
                  {confirmed}
                </div>
                <div className={s.statLabel}>Confirmed</div>
              </div>
              <div className={s.statCard}>
                <div className={s.statNum} style={{ color: "var(--green)" }}>
                  {completed}
                </div>
                <div className={s.statLabel}>Completed</div>
              </div>
            </div>
            <div className={s.whiteCard}>
              <h2 className={s.cardTitle}>Appointments</h2>
              {appts.length === 0 ? (
                <div className={s.emptyState}>
                  No appointments yet. Patients will appear here when they book.
                </div>
              ) : (
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Problem</th>
                      <th>Time</th>
                      <th>Mode</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appts.map((a) => (
                      <tr key={a.id}>
                        <td className={s.tdBold}>{a.user?.name}</td>
                        <td>{a.notes || "—"}</td>
                        <td>
                          <div className={s.tdTime}>{a.time}</div>
                          <div className={s.tdDate}>({a.date})</div>
                        </td>
                        <td>
                          <span
                            className={`${s.modePill} ${a.mode === "ONLINE" ? s.mOnline : s.mOffline}`}
                          >
                            {a.mode}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`${s.statusPill} ${s["st" + a.status]}`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td>
                    {a.status === "BOOKED" && (
                      <div className={s.actionBtns}>
                        <button
                          className={s.acceptBtn}
                          onClick={() => handleConfirm(a.id)}
                        >
                          Confirm
                        </button>

                        <button
                          className={s.declineBtn}
                          onClick={() => handleStatus(a.id, "CANCELLED")}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                          {a.status === "COMPLETED" && (
                            <span className={s.doneTag}>✓ Done</span>
                          )}
                          {a.status === "CANCELLED" && (
                            <span className={s.cancelledTag}>Declined</span>
                          )}
                          {a.status === "NO_SHOW" && (
                            <span className={s.noShowTag}>No Show</span>
                          )}

                          {a.status === "CONFIRMED" && (
                            <div className={s.actionBtns}>
                              <button
                                className={s.acceptBtn}
                                onClick={() => handleStatus(a.id, "COMPLETED")}
                              >
                                Mark Completed
                              </button>
                            </div>
                          )}

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── SCHEDULE ── */}
        {active === "schedule" && (
          <div className={s.page}>
            <h1 className={s.pageTitle}>Schedule</h1>
            <div className={s.whiteCard} style={{ marginBottom: 20 }}>
              <h2 className={s.cardTitle}>Add Available Slot</h2>
              {slotMsg.text && (
                <div className={slotMsg.type === "error" ? s.errBox : s.okBox}>
                  {slotMsg.text}
                </div>
              )}
              <div className={s.slotFormRow}>
                <div className={s.slotField}>
                  <label className={s.slotLabel}>Date</label>
                  <input
                    type="date"
                    className={s.slotInput}
                    value={newSlot.date}
                    onChange={(e) =>
                      setNewSlot((p) => ({ ...p, date: e.target.value }))
                    }
                  />
                </div>
                <div className={s.slotField}>
                  <label className={s.slotLabel}>Time</label>
                  <select
                    className={s.slotInput}
                    value={newSlot.timeSlot}
                    onChange={(e) =>
                      setNewSlot((p) => ({ ...p, timeSlot: e.target.value }))
                    }
                  >
                    <option value="">Select time</option>
                    {TIMES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className={s.slotField}>
                 <label className={s.slotLabel}>Consultation Mode</label>
                 <input
                  className={s.slotInput}
                  value={user.mode}
                  disabled
                />
               </div>
                <button
                  className={s.addSlotBtn}
                  onClick={handleAddSlot}
                  disabled={loading}
                >
                  {loading ? "..." : "+ Add"}
                </button>
              </div>
            </div>
            <div className={s.whiteCard}>
              <h2 className={s.cardTitle}>My Slots</h2>
              {slots.length === 0 ? (
                <div className={s.emptyState}>
                  No slots yet. Add slots above.
                </div>
              ) : (
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Mode</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots
                      .sort((a, b) => (a.date > b.date ? 1 : -1))
                      .map((sl) => (
                        <tr key={sl.id}>
                          <td>{sl.date}</td>
                          <td className={s.tdBold}>{sl.timeSlot}</td>
                          <td>
                            <span
                              className={`${s.modePill} ${sl.mode === "ONLINE" ? s.mOnline : s.mOffline}`}
                            >
                              {sl.mode}
                            </span>
                          </td>
                          <td>
                            <span
                              className={
                                sl.available ? s.availTag : s.bookedTag
                              }
                            >
                              {sl.available ? "Available" : "Booked"}
                            </span>
                          </td>
                          <td>
                            {sl.available && (
                              <button
                                className={s.delBtn}
                                onClick={() => handleDeleteSlot(sl.id)}
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── DAILY SUMMARY ── */}
        {active === "summary" && (
          <div className={s.page}>
            <h1 className={s.pageTitle}>Daily Summary</h1>
            {summary && (
              <div className={s.whiteCard}>
                <div className={s.grandTotal}>
                  Grand Total: ₹{(summary.revenue || 0).toLocaleString()}
                </div>
                <div className={s.summaryGrid}>
                  {[
                    ["Total", summary.total],
                    ["Confirmed", summary.booked, "var(--teal)"],
                    ["Completed", summary.completed, "var(--green)"],
                    ["Cancelled", summary.cancelled, "var(--red)"],
                    ["No Show", summary.noShow, "#d97706"],
                    [
                      "Revenue",
                      "₹" + (summary.revenue || 0).toLocaleString(),
                      "var(--green)",
                    ],
                  ].map(([label, val, col]) => (
                    <div key={label} className={s.summaryCard}>
                      <div
                        className={s.summaryNum}
                        style={col ? { color: col } : {}}
                      >
                        {val}
                      </div>
                      <div className={s.summaryLabel}>{label}</div>
                    </div>
                  ))}
                </div>
                <h2 className={s.sectionTitle} style={{ marginTop: 24 }}>
                  Appointments
                </h2>
                {(summary.appointments || []).filter(
                  (a) => a.status === "COMPLETED",
                ).length === 0 ? (
                  <div className={s.emptyState}>
                    No completed appointments yet.
                  </div>
                ) : (
                  <table className={s.table}>
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Problem</th>
                        <th>Time</th>
                        <th>Mode</th>
                        <th>Fee (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(summary.appointments || [])
                        .filter((a) => a.status === "COMPLETED")
                        .map((a) => (
                          <tr key={a.id}>
                            <td>{a.user?.name}</td>
                            <td>{a.notes || "—"}</td>
                            <td>{a.time}</td>
                            <td>
                              <span
                                className={`${s.modePill} ${a.mode === "ONLINE" ? s.mOnline : s.mOffline}`}
                              >
                                {a.mode}
                              </span>
                            </td>
                            <td style={{ fontWeight: 600 }}>₹{a.fee || "—"}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE ── */}
        {active === "profile" && (
          <div className={s.page}>
            <h1 className={s.pageTitle}>My Profile</h1>
            <div className={s.whiteCard}>
              <div className={s.profileTop}>
                <div className={s.profileAvLg}>{initials}</div>
                <div>
                  <h2 className={s.profileName}>{user.name}</h2>
                  <div className={s.profileSpec}>{user.specialty}</div>
                  <div style={{ fontSize: 13, color: "var(--text-3)" }}>
                    {user.email}
                  </div>
                </div>
              </div>
              <div className={s.profileGrid}>
                {[
                  ["📞 Phone", user.phone],
                  ["⚧ Gender", user.gender],
                  ["🏥 Mode", user.mode],
                  ["💰 Fee", user.consultFee ? `₹${user.consultFee}` : null],
                  ["📍 Location", user.location],
                  ["📜 Qualification", user.qualification],
                  ["💼 Experience", user.experience],
                  ["🕐 Time Slot", user.timeSlot],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className={s.profileRow}>
                      <span className={s.profileKey}>{k}</span>
                      <span className={s.profileVal}>{v}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
