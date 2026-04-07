import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { registerPatient, registerDoctor } from "../utils/api";
import s from "./Register.module.css";

const SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "General Medicine",
  "Gynecology",
  "Ophthalmology",
  "ENT",
  "Oncology",
  "Urology",
  "Other",
];
const QUALIFICATIONS = [
  "MBBS",
  "MD",
  "MS",
  "DNB",
  "DM",
  "MCh",
  "BDS",
  "BHMS",
  "Other",
];
const EXPERIENCES = [
  "Less than 1 year",
  "1–3 years",
  "3–5 years",
  "5–10 years",
  "10–15 years",
  "15+ years",
  "Other",
];
const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "Unknown",
];
const TIME_SLOTS = [
  "Morning (8AM–12PM)",
  "Afternoon (12PM–4PM)",
  "Evening (4PM–8PM)",
];

function Field({ icon, label, children }) {
  return (
    <div className={s.fieldRow}>
      <div className={s.fieldLeft}>
        <span className={s.fieldIcon}>{icon}</span>
        <label className={s.fieldLabel}>{label}</label>
      </div>
      <div className={s.fieldRight}>{children}</div>
    </div>
  );
}

// Dropdown that shows a text input when "Other" is selected
function SelectOrOther({
  name,
  value,
  onChange,
  options,
  placeholder,
  customPlaceholder,
}) {
  const knownValues = options.slice(0, -1); // all except "Other"
  const isCustom = value && !options.includes(value);
  const selectValue = isCustom ? "Other" : value;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <select
        className={s.input}
        name={name}
        value={selectValue}
        onChange={(e) => onChange({ target: { name, value: e.target.value } })}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      {selectValue === "Other" && (
        <input
          className={s.input}
          placeholder={customPlaceholder || "Please specify..."}
          value={isCustom ? value : ""}
          onChange={(e) =>
            onChange({ target: { name, value: e.target.value } })
          }
        />
      )}
    </div>
  );
}

export default function Register() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [tab, setTab] = useState(
    params.get("role") === "doctor" ? "doctor" : "patient",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);

  const [doc, setDoc] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
    location: "",
    mode: "",
    specialisation: "",
    qualification: "",
    experience: "",
    consultFee: "",
    timeSlot: "",
  });
  const [pat, setPat] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
    dob: "",
    bloodGroup: "",
    address: "",
    emergencyContact: "",
    allergies: "",
    medicalHistory: "",
  });

  const handleDoc = (e) =>
    setDoc((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handlePat = (e) =>
    setPat((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (tab === "doctor") {
      if (
        !doc.name ||
        !doc.email ||
        !doc.password ||
        !doc.specialisation ||
        !doc.mode
      )
        return setError("Please fill in all required fields (marked *).");
      if (doc.password !== doc.confirmPassword)
        return setError("Passwords do not match.");
      if (doc.password.length < 6)
        return setError("Password must be at least 6 characters.");
      setLoading(true);
      try {
        const data = await registerDoctor({
          name: doc.name,
          email: doc.email.toLowerCase().trim(),
          password: doc.password,
          phone: doc.phone,
          gender: doc.gender,
          location: doc.location,
          mode: doc.mode,
          specialty: doc.specialisation,
          qualification: doc.qualification,
          experience: doc.experience,
          consultFee: doc.consultFee ? parseFloat(doc.consultFee) : null,
        });
        if (data.success === false)
          return setError(data.message || "Registration failed.");
        localStorage.setItem("user", JSON.stringify(data));
        nav("/doctor");
      } catch {
        setError("Cannot connect to server.");
      } finally {
        setLoading(false);
      }
    } else {
      if (!pat.name || !pat.email || !pat.password)
        return setError("Name, email and password are required.");
      if (pat.password !== pat.confirmPassword)
        return setError("Passwords do not match.");
      if (pat.password.length < 6)
        return setError("Password must be at least 6 characters.");
      setLoading(true);
      try {
        const data = await registerPatient({
          name: pat.name,
          email: pat.email.toLowerCase().trim(),
          password: pat.password,
          phone: pat.phone,
          gender: pat.gender,
          dob: pat.dob,
          bloodGroup: pat.bloodGroup,
          address: pat.address,
          emergencyContact: pat.emergencyContact,
          allergies: pat.allergies,
          medicalHistory: pat.medicalHistory,
        });
        if (data.success === false)
          return setError(data.message || "Registration failed.");
        localStorage.setItem("user", JSON.stringify(data));
        nav("/patient");
      } catch {
        setError("Cannot connect to server.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.headerIcon}>✚</div>
        <div>
          <div className={s.headerTitle}>PREMIUM HEALTHCARE PORTAL</div>
          <div className={s.headerSub}>REGISTRATION</div>
        </div>
      </div>

      <div className={s.card}>
        <div className={s.tabs}>
          {["doctor", "patient"].map((t) => (
            <button
              key={t}
              className={`${s.tab} ${tab === t ? s.tabActive : ""}`}
              onClick={() => {
                setTab(t);
                setError("");
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {error && <div className={s.errorBox}>⚠ {error}</div>}

        <form onSubmit={submit}>
          {/* ── DOCTOR ──────────────────────────────── */}
          {tab === "doctor" && (
            <div className={s.fields}>
              <Field icon="👤" label="Name *">
                <input
                  className={s.input}
                  name="name"
                  placeholder="Dr. Full Name"
                  value={doc.name}
                  onChange={handleDoc}
                />
              </Field>
              <Field icon="✉" label="Email *">
                <input
                  className={s.input}
                  type="email"
                  name="email"
                  placeholder="doctor@email.com"
                  value={doc.email}
                  onChange={handleDoc}
                />
              </Field>
              <Field icon="🔒" label="Password *">
                <div className={s.pwWrap}>
                  <input
                    className={s.input}
                    type={showPw ? "text" : "password"}
                    name="password"
                    placeholder="Min 6 characters"
                    value={doc.password}
                    onChange={handleDoc}
                  />
                  <button
                    type="button"
                    className={s.eye}
                    onClick={() => setShowPw((p) => !p)}
                  >
                    {showPw ? "🙈" : "👁"}
                  </button>
                </div>
              </Field>
              <Field icon="🔒" label="Confirm Password *">
                <div className={s.pwWrap}>
                  <input
                    className={s.input}
                    type={showCPw ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Repeat password"
                    value={doc.confirmPassword}
                    onChange={handleDoc}
                  />
                  <button
                    type="button"
                    className={s.eye}
                    onClick={() => setShowCPw((p) => !p)}
                  >
                    {showCPw ? "🙈" : "👁"}
                  </button>
                </div>
              </Field>
              <Field icon="📞" label="Phone Number">
                <input
                  className={s.input}
                  type="tel"
                  name="phone"
                  placeholder="10-digit number"
                  value={doc.phone}
                  onChange={handleDoc}
                />
              </Field>
              <Field icon="📍" label="Location / Clinic">
                <input
                  className={s.input}
                  name="location"
                  placeholder="City, Hospital"
                  value={doc.location}
                  onChange={handleDoc}
                />
              </Field>
              <Field icon="⚧" label="Gender">
                <select
                  className={s.input}
                  name="gender"
                  value={doc.gender}
                  onChange={handleDoc}
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </Field>
              <Field icon="🕐" label="Consultation Mode *">
                <select
                  className={s.input}
                  name="mode"
                  value={doc.mode}
                  onChange={handleDoc}
                >
                  <option value="">Select Mode</option>
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Offline (In-Person)</option>
                
                </select>
              </Field>
              <Field icon="🎓" label="Specialisation *">
                <SelectOrOther
                  name="specialisation"
                  value={doc.specialisation}
                  onChange={handleDoc}
                  options={SPECIALTIES}
                  placeholder="Select Specialisation"
                  customPlaceholder="Enter your specialisation..."
                />
              </Field>
              <Field icon="📜" label="Qualification">
                <SelectOrOther
                  name="qualification"
                  value={doc.qualification}
                  onChange={handleDoc}
                  options={QUALIFICATIONS}
                  placeholder="Select Qualification"
                  customPlaceholder="Enter qualification..."
                />
              </Field>
              <Field icon="💼" label="Experience">
                <SelectOrOther
                  name="experience"
                  value={doc.experience}
                  onChange={handleDoc}
                  options={EXPERIENCES}
                  placeholder="Select Experience"
                  customPlaceholder="Describe experience..."
                />
              </Field>
              <Field icon="💰" label="Consultation Fee (₹)">
                <input
                  className={s.input}
                  type="number"
                  name="consultFee"
                  placeholder="e.g. 500"
                  value={doc.consultFee}
                  onChange={handleDoc}
                />
              </Field>
            </div>
          )}

          {/* ── PATIENT ─────────────────────────────── */}
          {tab === "patient" && (
            <div className={s.fields}>
              <Field icon="👤" label="Full Name *">
                <input
                  className={s.input}
                  name="name"
                  placeholder="Your full name"
                  value={pat.name}
                  onChange={handlePat}
                />
              </Field>
              <Field icon="✉" label="Email *">
                <input
                  className={s.input}
                  type="email"
                  name="email"
                  placeholder="you@email.com"
                  value={pat.email}
                  onChange={handlePat}
                />
              </Field>
              <Field icon="🔒" label="Password *">
                <div className={s.pwWrap}>
                  <input
                    className={s.input}
                    type={showPw ? "text" : "password"}
                    name="password"
                    placeholder="Min 6 characters"
                    value={pat.password}
                    onChange={handlePat}
                  />
                  <button
                    type="button"
                    className={s.eye}
                    onClick={() => setShowPw((p) => !p)}
                  >
                    {showPw ? "🙈" : "👁"}
                  </button>
                </div>
              </Field>
              <Field icon="🔒" label="Confirm Password *">
                <div className={s.pwWrap}>
                  <input
                    className={s.input}
                    type={showCPw ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Repeat password"
                    value={pat.confirmPassword}
                    onChange={handlePat}
                  />
                  <button
                    type="button"
                    className={s.eye}
                    onClick={() => setShowCPw((p) => !p)}
                  >
                    {showCPw ? "🙈" : "👁"}
                  </button>
                </div>
              </Field>
              <Field icon="📞" label="Phone Number">
                <input
                  className={s.input}
                  type="tel"
                  name="phone"
                  placeholder="10-digit number"
                  value={pat.phone}
                  onChange={handlePat}
                />
              </Field>
              <Field icon="⚧" label="Gender">
                <select
                  className={s.input}
                  name="gender"
                  value={pat.gender}
                  onChange={handlePat}
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </Field>
              <Field icon="📅" label="Date of Birth">
                <input
                  className={s.input}
                  type="date"
                  name="dob"
                  value={pat.dob}
                  onChange={handlePat}
                />
              </Field>
              <Field icon="🩸" label="Blood Group">
                <select
                  className={s.input}
                  name="bloodGroup"
                  value={pat.bloodGroup}
                  onChange={handlePat}
                >
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </Field>
              <Field icon="🏠" label="Address">
                <input
                  className={s.input}
                  name="address"
                  placeholder="Your address"
                  value={pat.address}
                  onChange={handlePat}
                />
              </Field>
              <Field icon="🆘" label="Emergency Contact">
                <input
                  className={s.input}
                  name="emergencyContact"
                  placeholder="Name & phone"
                  value={pat.emergencyContact}
                  onChange={handlePat}
                />
              </Field>
              <Field icon="⚠" label="Known Allergies">
                <input
                  className={s.input}
                  name="allergies"
                  placeholder="e.g. Penicillin (or None)"
                  value={pat.allergies}
                  onChange={handlePat}
                />
              </Field>
              <Field icon="📋" label="Medical History">
                <textarea
                  className={s.textarea}
                  name="medicalHistory"
                  rows={3}
                  placeholder="Existing conditions, past surgeries..."
                  value={pat.medicalHistory}
                  onChange={handlePat}
                />
              </Field>
            </div>
          )}

          <button className={s.submitBtn} type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className={s.switchText}>
          Already have an account?{" "}
          <span className={s.switchLink} onClick={() => nav("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
