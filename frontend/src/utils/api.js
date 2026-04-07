const BASE = "http://localhost:8080/api";

const req = async (method, url, body) => {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(BASE + url, opts);
  return await res.json();
};

// ── Auth ──────────────────────────
export const loginUser = (body) => req("POST", "/auth/login", body);
export const registerPatient = (body) =>
  req("POST", "/auth/register/patient", body);
export const registerDoctor = (body) =>
  req("POST", "/auth/register/doctor", body);

// ── Doctors ───────────────────────
export const getSpecialties = () => req("GET", "/doctors/specialties");
export const getDoctors = (sp, mode) =>
  req("GET", `/doctors?specialty=${sp}&mode=${mode}`);
export const getAllDoctors = () => req("GET", "/doctors");

// ── Availability ──────────────────
export const getAvailableSlots = (docId, mode) =>
  req("GET", `/availability/${docId}?mode=${mode}`);
export const getDoctorSlots = (docId) =>
  req("GET", `/availability/doctor/${docId}`);
export const addSlot = (body) => req("POST", "/availability", body);
export const deleteSlot = (id) =>
  req("DELETE", `/availability/${id}`);

// ── Appointments ──────────────────
export const bookAppointment = (body) =>
  req("POST", "/appointments/book", body);

export const getPatientAppts = (userId) =>
  req("GET", `/appointments/patient/${userId}`);

export const getDoctorAppts = (docId) =>
  req("GET", `/appointments/doctor/${docId}`);

export const updateApptStatus = (id, status) =>
  req("PUT", `/appointments/${id}/status`, { status });

// ✅ NEW CONFIRM API
export const confirmAppointment = (id) =>
  req("PUT", `/appointments/${id}/confirm`);

export const getDoctorSummary = (docId) =>
  req("GET", `/appointments/summary/doctor/${docId}`);

export const getAllAppts = () => req("GET", "/appointments");