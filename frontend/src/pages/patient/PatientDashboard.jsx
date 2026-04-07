import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSpecialties,
  getDoctors,
  getAvailableSlots,
  bookAppointment,
  getPatientAppts,
  updateApptStatus,
} from "../../utils/api";
import s from "./PatientDashboard.module.css";

const NAV = [
  { key: "profile", icon: "👤", label: "Patient Profile" },
  { key: "book", icon: "📅", label: "Book Appointment" },
  { key: "appointments", icon: "🗓", label: "My Appointments" },
  { key: "history", icon: "📋", label: "Medical History" },
  { key: "bills", icon: "💳", label: "Bills Summary" },
];

export default function PatientDashboard() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("profile");
  const [appts, setAppts] = useState([]);

  // Booking state
  const [specialties, setSpecialties] = useState([]);
  const [selSpec, setSelSpec] = useState("");
  const [selMode, setSelMode] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selDoc, setSelDoc] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selSlot, setSelSlot] = useState(null);
  const [notes, setNotes] = useState("");
  const [bookStep, setBookStep] = useState(1);
  const [bookMsg, setBookMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) {
      nav("/login");
      return;
    }
    const parsed = JSON.parse(u);
    if (parsed.role !== "PATIENT") {
      nav("/login");
      return;
    }
    setUser(parsed);
    loadAppts(parsed.id);
    loadSpecialties();
  }, []);

  const loadAppts = async (id) => {
    try {
      const d = await getPatientAppts(id);
      setAppts(Array.isArray(d) ? d : []);
    } catch {}
  };
  const loadSpecialties = async () => {
    try {
      const d = await getSpecialties();
      setSpecialties(Array.isArray(d) ? d : []);
    } catch {}
  };

  const searchDoctors = async () => {
    if (!selSpec || !selMode) return;
    try {
      const d = await getDoctors(selSpec, selMode);
      setDoctors(Array.isArray(d) ? d : []);
      setBookStep(2);
    } catch {}
  };

  const selectDoctor = async (doc) => {
    setSelDoc(doc);
    setSelSlot(null);
    try {
      const d = await getAvailableSlots(doc.id, selMode);
      setSlots(Array.isArray(d) ? d : []);
      setBookStep(3);
    } catch {}
  };

  const confirmBook = async () => {
    if (!selSlot || !selDoc || !user) return;
    setLoading(true);
    setBookMsg({ type: "", text: "" });
    try {
 
     const data = await bookAppointment({
  slot: { id: selSlot.id },      // ✅ REQUIRED
  doctor: { id: selDoc.id },     // ✅ REQUIRED
  user: { id: user.id },         // ✅ REQUIRED
  mode: selMode,
  notes,
});

      if (data.success === false) {
        setBookMsg({ type: "error", text: data.message || "Booking failed." });
        return;
      }
      setBookMsg({
        type: "success",
        text:
          "✅ Appointment booked! A confirmation email has been sent to " +
          user.email,
      });
      loadAppts(user.id);
      setTimeout(() => {
        setBookStep(1);
        setSelSpec("");
        setSelMode("");
        setSelDoc(null);
        setSelSlot(null);
        setNotes("");
        setBookMsg({ type: "", text: "" });
        setActive("appointments");
      }, 3000);
    } catch {
      setBookMsg({ type: "error", text: "Server error. Try again." });
    } finally {
      setLoading(false);
    }
  };

  const cancelAppt = async (id) => {
    if (!confirm("Cancel this appointment?")) return;
    await updateApptStatus(id, "CANCELLED");
    loadAppts(user.id);
  };

  if (!user) return null;
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "P";
  const confirmed = appts.filter((a) => a.status === "BOOKED");
  const completed = appts.filter((a) => a.status === "COMPLETED");
  const bills = completed;

  return (
    <div className={s.layout}>
      {/* SIDEBAR */}
      <aside className={s.sidebar}>
        <div className={s.sidebarTop}>
          <div className={s.av}>{initials}</div>
          <div className={s.sName}>{user.name}</div>
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
        {/* ── PROFILE ── */}
        {active === "profile" && (
          <div className={s.page}>
            <h1 className={s.pageTitle}>Patient Profile</h1>
            <div className={s.profileCard}>
              <div className={s.profileAvLg}>{initials}</div>
              <div>
                <h2 className={s.profileName}>{user.name}</h2>
                <div className={s.idBadge}>Patient ID: {user.id}</div>
                <div className={s.profileEmail}>{user.email}</div>
                {[
                  ["📞", user.phone],
                  ["⚧", user.gender],
                  ["📅", user.dob],
                  ["🩸", user.bloodGroup],
                  ["🏠", user.address],
                  ["🆘", user.emergencyContact],
                ]
                  .filter(([, v]) => v)
                  .map(([icon, val]) => (
                    <div key={icon} className={s.profileMeta}>
                      {icon} {val}
                    </div>
                  ))}
                {user.allergies && (
                  <div className={s.profileMeta}>
                    ⚠ Allergies: {user.allergies}
                  </div>
                )}
              </div>
            </div>
            <div className={s.statsRow}>
              <div className={s.statCard}>
                <span className={s.statNum}>{appts.length}</span>
                <span className={s.statLabel}>Total</span>
              </div>
              <div className={s.statCard}>
                <span className={s.statNum} style={{ color: "var(--teal)" }}>
                  {confirmed.length}
                </span>
                <span className={s.statLabel}>Upcoming</span>
              </div>
              <div className={s.statCard}>
                <span className={s.statNum} style={{ color: "var(--green)" }}>
                  {completed.length}
                </span>
                <span className={s.statLabel}>Completed</span>
              </div>
            </div>
          </div>
        )}

        {/* ── BOOK ── */}
        {active === "book" && (
          <div className={s.page}>
            <h1 className={s.pageTitle}>Book Appointment</h1>

            {bookMsg.text && (
              <div
                className={bookMsg.type === "error" ? s.errBanner : s.okBanner}
              >
                {bookMsg.text}
              </div>
            )}

            {/* Step 1 */}
            <div className={s.bookCard}>
              <h2 className={s.bookTitle}>
                Select Specialty and Consultation Mode
              </h2>
              <div className={s.bookLabel}>Select Specialty</div>
              <div className={s.specPills}>
                {specialties.length === 0 ? (
                  <span style={{ fontSize: 13, color: "var(--text-3)" }}>
                    Loading specialties...
                  </span>
                ) : (
                  specialties.map((sp) => (
                    <button
                      key={sp}
                      className={`${s.specPill} ${selSpec === sp ? s.specActive : ""}`}
                      onClick={() => {
                        setSelSpec(sp);
                        setBookStep(1);
                      }}
                    >
                      {sp}
                    </button>
                  ))
                )}
              </div>
              <div className={s.bookLabel} style={{ marginTop: 18 }}>
                Consultation Mode
              </div>
              <div className={s.modeRow}>
                {["ONLINE", "OFFLINE"].map((m) => (
                  <button
                    key={m}
                    className={`${s.modeBtn} ${selMode === m ? s.modeBtnActive : ""}`}
                    onClick={() => {
                      setSelMode(m);
                      setBookStep(1);
                    }}
                  >
                    {m === "ONLINE" ? "💻 Online" : "🏥 Offline"}
                  </button>
                ))}
              </div>
              <div className={s.bookBtnRow}>
                <button
                  className={s.btnOutline}
                  onClick={searchDoctors}
                  disabled={!selSpec || !selMode}
                >
                  Check Availability
                </button>
                <button
                  className={s.btnDark}
                  onClick={searchDoctors}
                  disabled={!selSpec || !selMode}
                >
                  Book Appointment →
                </button>
              </div>
            </div>

            {/* Consult info cards */}
            <div className={s.consultCards}>
              <div className={s.consultCard}>
                <div className={s.consultImg}>💻</div>
                <div>
                  <div className={s.consultTitle}>Consult via phone/video</div>
                  <div className={s.consultSub}>
                    Online meeting link sent to your email
                  </div>
                </div>
              </div>
              <div className={s.consultCard}>
                <div className={s.consultImg}>🏥</div>
                <div>
                  <div className={s.consultTitle}>Visit clinic</div>
                  <div className={s.consultSub}>
                    Address as per doctor's profile
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 — doctors */}
            {bookStep >= 2 && (
              <div className={s.bookCard} style={{ marginTop: 20 }}>
                <h2 className={s.bookTitle}>
                  Available Doctors — {selSpec} ({selMode})
                </h2>
                {doctors.length === 0 ? (
                  <div className={s.emptyCard}>
                    No doctors available for this combination.
                  </div>
                ) : (
                  doctors.map((d) => (
                    <div
                      key={d.id}
                      className={`${s.docRow} ${selDoc?.id === d.id ? s.docRowActive : ""}`}
                      onClick={() => selectDoctor(d)}
                    >
                      <div className={s.docAv}>{d.name[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div className={s.docName}>Dr. {d.name}</div>
                        <div className={s.docSub}>
                          {d.specialty} · {d.experience || "Experienced"} ·{" "}
                          {d.location || ""}
                        </div>
                      </div>
                      <div className={s.docFee}>
                        <div>₹{d.consultFee || "—"}</div>
                        <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                          per visit
                        </div>
                      </div>
                      <span
                        className={`${s.modePill} ${d.mode === "ONLINE" ? s.mOnline : s.mOffline}`}
                      >
                        {d.mode}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Step 3 — slots */}
            {bookStep >= 3 && selDoc && (
              <div className={s.bookCard} style={{ marginTop: 20 }}>
                <h2 className={s.bookTitle}>
                  Available Slots — Dr. {selDoc.name}
                </h2>
                <div className={s.feeBanner}>
                  💰 Consultation Fee:{" "}
                  <strong>₹{selDoc.consultFee || "—"}</strong>{" "}
                  <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                    · paid at consultation
                  </span>
                </div>
                {slots.length === 0 ? (
                  <div
                    style={{
                      color: "var(--text-3)",
                      fontSize: 13,
                      padding: "12px 0",
                    }}
                  >
                    No available slots for {selMode} mode.
                  </div>
                ) : (
                  <div className={s.slotGrid}>
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        className={`${s.slotBtn} ${selSlot?.id === slot.id ? s.slotActive : ""}`}
                        onClick={() => {
                          setSelSlot(slot);
                          setBookStep(4);
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{slot.timeSlot}</div>
                        <div style={{ fontSize: 11, opacity: 0.8 }}>
                          {slot.date}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4 — confirm */}
            {bookStep >= 4 && selSlot && (
              <div className={s.bookCard} style={{ marginTop: 20 }}>
                <h2 className={s.bookTitle}>Confirm Booking</h2>
                <div className={s.confirmGrid}>
                  {[
                    ["Doctor", `Dr. ${selDoc.name}`],
                    ["Specialty", selDoc.specialty],
                    ["Date", selSlot.date],
                    ["Time", selSlot.timeSlot],
                    ["Mode", selMode],
                    ["Fee", `₹${selDoc.consultFee || "—"}`],
                  ].map(([k, v]) => (
                    <div key={k} className={s.confirmRow}>
                      <span>{k}</span>
                      <strong
                        style={k === "Fee" ? { color: "var(--teal)" } : {}}
                      >
                        {v}
                      </strong>
                    </div>
                  ))}
                </div>
                <textarea
                  className={s.notesInput}
                  rows={3}
                  placeholder="Symptoms or reason for visit (optional)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <button
                  className={s.btnDark}
                  style={{ width: "100%", marginTop: 12 }}
                  onClick={confirmBook}
                  disabled={loading}
                >
                  {loading ? "Booking..." : "✅ Confirm Appointment"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── MY APPOINTMENTS ── */}
        {active === "appointments" && (
          <div className={s.page}>
            <h1 className={s.pageTitle}>My Appointments</h1>
            <div className={s.whiteCard}>
              {appts.length === 0 ? (
                <div className={s.emptyState}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>
                    No appointments yet
                  </div>
                  <div
                    style={{
                      color: "var(--text-3)",
                      fontSize: 13,
                      marginBottom: 20,
                    }}
                  >
                    Book your first appointment
                  </div>
                  <button
                    className={s.btnDark}
                    onClick={() => setActive("book")}
                  >
                    Book Now →
                  </button>
                </div>
              ) : (
                <>
                  <div className={s.tableHead}>
                    <span>Date &amp; Time</span>
                    <span>Specialty</span>
                    <span>Mode</span>
                    <span>Status</span>
                    <span>Action</span>
                  </div>
                  {appts.map((a) => (
                    <div key={a.id} className={s.tableRow}>
                      <div>
                        <div className={s.apptDate}>{a.date}</div>
                        <div className={s.apptTime}>{a.time}</div>
                      </div>
                      <div>{a.doctor?.specialty}</div>
                      <div>
                        <span
                          className={`${s.modePill} ${a.mode === "ONLINE" ? s.mOnline : s.mOffline}`}
                        >
                          {a.mode}
                        </span>
                      </div>
                      <div>
                        <span
                          className={`${s.statusPill} ${s["st" + a.status]}`}
                        >
                          {a.status}
                        </span>
                      </div>
                      <div>
                        {a.status === "BOOKED" && (
                          <button
                            className={s.cancelBtn}
                            onClick={() => cancelAppt(a.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── MEDICAL HISTORY ── */}
        {active === "history" && (
          <div className={s.page}>
            <h1 className={s.pageTitle}>Medical History</h1>
            <div className={s.whiteCard}>
              {completed.length === 0 ? (
                <div className={s.emptyState}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>
                    No history yet
                  </div>
                  <div style={{ color: "var(--text-3)", fontSize: 13 }}>
                    Completed appointments appear here
                  </div>
                </div>
              ) : (
                completed.map((a) => (
                  <div key={a.id} className={s.historyRow}>
                    <div className={s.historyIcon}>🩺</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>
                        Dr. {a.doctor?.name}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                        {a.doctor?.specialty} · {a.date} · {a.time}
                      </div>
                      {a.notes && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text-2)",
                            marginTop: 4,
                          }}
                        >
                          Note: {a.notes}
                        </div>
                      )}
                    </div>
                    <span className={`${s.statusPill} ${s.stCOMPLETED}`}>
                      Completed
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── BILLS ── */}
        {active === "bills" && (
          <div className={s.page}>
            <h1 className={s.pageTitle}>Bills Summary</h1>
            <div className={s.whiteCard}>
              {bills.length === 0 ? (
                <div className={s.emptyState}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>
                    No bills yet
                  </div>
                  <div style={{ color: "var(--text-3)", fontSize: 13 }}>
                    Bills appear after appointments are completed
                  </div>
                </div>
              ) : (
                <>
                  <div className={s.billTotal}>
                    Total Paid: ₹
                    {bills
                      .reduce((s, a) => s + (a.fee || 0), 0)
                      .toLocaleString()}
                  </div>
                  <div className={s.tableHead}>
                    <span>Date</span>
                    <span>Doctor</span>
                    <span>Specialty</span>
                    <span>Mode</span>
                    <span>Fee</span>
                  </div>
                  {bills.map((a) => (
                    <div key={a.id} className={s.tableRow}>
                      <div>{a.date}</div>
                      <div style={{ fontWeight: 500 }}>
                        Dr. {a.doctor?.name}
                      </div>
                      <div style={{ color: "var(--text-3)" }}>
                        {a.doctor?.specialty}
                      </div>
                      <div>
                        <span
                          className={`${s.modePill} ${a.mode === "ONLINE" ? s.mOnline : s.mOffline}`}
                        >
                          {a.mode}
                        </span>
                      </div>
                      <div style={{ fontWeight: 600, color: "var(--teal)" }}>
                        ₹{a.fee || "—"}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
