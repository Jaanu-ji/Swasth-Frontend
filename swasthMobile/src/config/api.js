// ✅ API Configuration - Migrated to React Native CLI
import axios from "axios";

/**
 * IMPORTANT:
 * - Real device pe localhost ❌ kaam nahi karta
 * - Laptop ka IPv4 address use karo
 * - Example: http://192.168.1.5:3000
 */
const API_BASE_URL = "https://swasth-bk.onrender.com/api"; // ⬅️ apna IP
const API_URL = API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/* ---------------- REQUEST INTERCEPTOR ---------------- */
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

/* ---------------- RESPONSE INTERCEPTOR ---------------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "Something went wrong. Please try again.";

    // ⛔ No response (network / server down)
    if (!error.response) {
      message = "Network error. Server not reachable.";
    }
    // ⛔ Timeout
    else if (error.code === "ECONNABORTED") {
      message = "Request timeout. Please try again.";
    }
    // ⛔ Server responded
    else {
      const status = error.response.status;
      const serverMessage = error.response.data?.message;

      if (status === 400) message = serverMessage || "Invalid request";
      else if (status === 401) message = "Invalid email or password";
      else if (status === 403) message = "Access denied";
      else if (status === 404) message = "API not found";
      else if (status >= 500) message = "Server error. Try later.";
    }

    // 🔥 Important: throw Error (Auth hook expects this)
    return Promise.reject(new Error(message));
  }
);

/* ---------------- AUTH ---------------- */
export const loginUser = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

/* ---------------- FORGOT PASSWORD ---------------- */
export const sendPasswordResetOTP = async (email) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

export const verifyPasswordResetOTP = async (email, otp) => {
  const res = await api.post("/auth/verify-otp", { email, otp });
  return res.data;
};

export const resetPassword = async (email, otp, newPassword) => {
  const res = await api.post("/auth/reset-password", { email, otp, newPassword });
  return res.data;
};

/* ---------------- CHAT ---------------- */
export const chat = async (email, message) => {
  const res = await api.post("/chat", { email, message });
  return res.data;
};

export const fetchChatHistory = async (email) => {
  const res = await api.get(`/chat/history/${email}`);
  return res.data;
};

/* ---------------- DIET ---------------- */
export const generateDiet = async (email) => {
  const res = await api.post("/diet", { email });
  return res.data;
};

export const fetchDietHistory = async (email) => {
  const res = await api.get(`/diet/history/${email}`);
  return res.data;
};

/* ---------------- MEALS ---------------- */

export const addMeal = async (data) => {
  const res = await api.post('/meals', data);
  return res.data;
};

export const fetchMealsByDate = async (email, date, memberId = null) => {
  const params = memberId ? `?memberId=${memberId}` : '';
  const res = await api.get(`/meals/${email}/${date}${params}`);
  return res.data;
};

export const getTodayMeals = async (email, memberId = null) => {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const today = `${yyyy}-${mm}-${dd}`;
  const params = memberId ? `?memberId=${memberId}` : '';
  const res = await api.get(`/meals/${email}/${today}${params}`);
  return res.data;
};

/* ---------------- EMERGENCY ---------------- */
export const getEmergencyCard = async (email) => {
  const res = await api.get(`/emergency/${email}`);
  return res.data;
};

export const createEmergencyCard = async (email, data) => {
  const res = await api.post("/emergency", { email, ...data });
  return res.data;
};

/* ---------------- OCR ---------------- */
export const uploadOCR = async (email, imageAsset, reportType = "General", memberId = null, memberName = "Self") => {
  const formData = new FormData();

  formData.append("email", email);
  formData.append("reportType", reportType);
  formData.append("memberId", memberId || '');
  formData.append("memberName", memberName || 'Self');

  // Attach file for React Native
  formData.append("file", {
    uri: imageAsset.uri,
    name: `report_${Date.now()}.jpg`,
    type: imageAsset.type || "image/jpeg",
  });

  const res = await fetch(`${API_URL}/ocr/upload`, {
    method: "POST",
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
};

export const getOCRStatus = async (scanId) => {
  const res = await api.get(`/ocr/status/${scanId}`);
  return res.data;
};

export const getOCRHistory = async (email, memberId = null) => {
  const params = memberId ? `?memberId=${memberId}` : '';
  const res = await api.get(`/ocr/history/${email}${params}`);
  return res.data;
};

/* ---------------- AI INSIGHTS ---------------- */
export const getAIInsights = async (email) => {
  const res = await api.get(`/insights/${email}`);
  return res.data;
};

export const generateAIInsights = async (email) => {
  const res = await api.post(`/insights/generate/${email}`);
  return res.data;
};

/* ---------------- FAMILY ---------------- */
export const getFamilyMembers = async (email) => {
  const res = await api.get(`/family/${email}`);
  return res.data;
};

export const addFamilyMember = async (email, data) => {
  const res = await api.post("/family", { email, ...data });
  return res.data;
};

export const updateFamilyMember = async (id, data) => {
  const res = await api.put(`/family/${id}`, data);
  return res.data;
};

export const deleteFamilyMember = async (id) => {
  const res = await api.delete(`/family/${id}`);
  return res.data;
};

/* ---------------- HEALTH (VITALS) ---------------- */

/**
 * GET all health logs of a user
 * Used in: HealthTrackerScreen
 * @param {string} email - User's email
 * @param {string|null} memberId - Optional family member ID
 */
export const getHealthLogs = async (email, memberId = null) => {
  const params = memberId ? `?memberId=${memberId}` : '';
  const res = await api.get(`/health/${email}${params}`);
  return res.data;
};

/**
 * ADD new health log
 * Used in: AddVitals Screen
 */
export const addHealthLog = async (data) => {
  const res = await api.post("/health", {
    userEmail: data.userEmail,
    type: data.type,
    value: data.value,
    notes: data.notes || "",
    memberId: data.memberId || null,
  });

  return res.data;
};

/* ---------------- WATER ---------------- */
export const addWaterLog = async (email, cups, memberId = null) => {
  const res = await api.post('/health', {
    userEmail: email,
    type: 'water',
    value: cups,
    memberId: memberId || null
  });
  return res.data;
};

export const fetchTodayWaterLogs = async (email, memberId = null) => {
  const params = memberId ? `?memberId=${memberId}` : '';
  const res = await api.get(`/health/${email}${params}`);
  const all = Array.isArray(res.data) ? res.data : [];
  // UTC-safe start/end of today
  const startOfTodayUTC = new Date();
  startOfTodayUTC.setUTCHours(0, 0, 0, 0);
  const endOfTodayUTC = new Date();
  endOfTodayUTC.setUTCHours(23, 59, 59, 999);

  const filtered = all.filter((log) => {
    try {
      if (!log) return false;
      if (log.type !== 'water') return false;
      const created = log.createdAt ? new Date(log.createdAt) : null;
      if (!created) return false;
      return created >= startOfTodayUTC && created <= endOfTodayUTC;
    } catch (e) {
      return false;
    }
  });

  return filtered;
};

export const removeLastWaterLog = async (email, memberId = null) => {
  const params = memberId ? `?memberId=${memberId}` : '';
  const res = await api.delete(`/health/water/last/${email}${params}`);
  return res.data;
};

/**
 * UPDATE existing health log
 */
export const updateHealthLog = async (id, data) => {
  const res = await api.put(`/health/${id}`, data);
  return res.data;
};

/**
 * DELETE health log
 */
export const deleteHealthLog = async (id) => {
  const res = await api.delete(`/health/${id}`);
  return res.data;
};

/* ---------------- WORKOUTS ---------------- */
export const getWorkouts = async (email, memberId = null) => {
  const params = memberId ? `?memberId=${memberId}` : '';
  const res = await api.get(`/workouts/${email}${params}`);
  return res.data;
};

export const getWorkoutsByDate = async (email, date, memberId = null) => {
  const params = memberId ? `?memberId=${memberId}` : '';
  const res = await api.get(`/workouts/${email}/${date}${params}`);
  return res.data;
};

export const addWorkout = async (data) => {
  const res = await api.post('/workouts', data);
  return res.data;
};

export const updateWorkout = async (id, data) => {
  const res = await api.put(`/workouts/${id}`, data);
  return res.data;
};

export const deleteWorkout = async (id) => {
  const res = await api.delete(`/workouts/${id}`);
  return res.data;
};

export const getWorkoutStats = async (email, memberId = null) => {
  const params = memberId ? `?memberId=${memberId}` : '';
  const res = await api.get(`/workouts/stats/${email}${params}`);
  return res.data;
};

/* ---------------- VACCINATIONS ---------------- */
export const getVaccinations = async (email) => {
  const res = await api.get(`/vaccinations/${email}`);
  return res.data;
};

export const getVaccinationsByMember = async (email, memberId) => {
  const res = await api.get(`/vaccinations/${email}/member/${memberId}`);
  return res.data;
};

export const addVaccination = async (data) => {
  const res = await api.post('/vaccinations', data);
  return res.data;
};

export const updateVaccination = async (id, data) => {
  const res = await api.put(`/vaccinations/${id}`, data);
  return res.data;
};

export const deleteVaccination = async (id) => {
  const res = await api.delete(`/vaccinations/${id}`);
  return res.data;
};

export const getUpcomingVaccinations = async (email) => {
  const res = await api.get(`/vaccinations/${email}/upcoming`);
  return res.data;
};

/* ---------------- REMINDERS ---------------- */
export const getReminders = async (email, memberId = null) => {
  const params = memberId ? `?memberId=${memberId}` : '';
  const res = await api.get(`/reminders/${email}${params}`);
  return res.data;
};

export const getActiveReminders = async (email, memberId = null) => {
  const params = memberId ? `?memberId=${memberId}` : '';
  const res = await api.get(`/reminders/${email}/active${params}`);
  return res.data;
};

export const addReminder = async (data) => {
  const res = await api.post('/reminders', data);
  return res.data;
};

export const updateReminder = async (id, data) => {
  const res = await api.put(`/reminders/${id}`, data);
  return res.data;
};

export const toggleReminder = async (id) => {
  const res = await api.patch(`/reminders/${id}/toggle`);
  return res.data;
};

export const deleteReminder = async (id) => {
  const res = await api.delete(`/reminders/${id}`);
  return res.data;
};

export const markReminderTriggered = async (id) => {
  const res = await api.post(`/reminders/${id}/trigger`);
  return res.data;
};

/* ---------------- HEALTH DOCUMENTS ---------------- */
export const getHealthDocuments = async (email, memberId = null) => {
  const params = memberId ? `?memberId=${memberId}` : '';
  const res = await api.get(`/health-documents/${email}${params}`);
  return res.data;
};

export const uploadHealthDocument = async (email, images, title, description, documentDate, category, memberId = null, memberName = 'Self') => {
  const formData = new FormData();

  formData.append("email", email);
  formData.append("title", title);
  formData.append("description", description || '');
  formData.append("documentDate", documentDate);
  formData.append("category", category || 'Other');
  formData.append("memberId", memberId || '');
  formData.append("memberName", memberName || 'Self');

  images.forEach((image, index) => {
    formData.append("images", {
      uri: image.uri,
      name: `health_doc_${Date.now()}_${index}.jpg`,
      type: image.type || "image/jpeg",
    });
  });

  const res = await fetch(`${API_URL}/health-documents/upload`, {
    method: "POST",
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
};

export const deleteHealthDocument = async (id) => {
  const res = await api.delete(`/health-documents/${id}`);
  return res.data;
};

export const addImagesToDocument = async (id, images) => {
  const formData = new FormData();

  images.forEach((image, index) => {
    formData.append("images", {
      uri: image.uri,
      name: `health_doc_${Date.now()}_${index}.jpg`,
      type: image.type || "image/jpeg",
    });
  });

  const res = await fetch(`${API_URL}/health-documents/${id}/images`, {
    method: "POST",
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
};

/* ---------------- MEDICAL HISTORY ---------------- */
export const getMedicalHistory = async (email, memberId = null) => {
  const url = memberId
    ? `/medical-history/${email}?memberId=${memberId}`
    : `/medical-history/${email}`;
  const res = await api.get(url);
  return res.data;
};

export const saveMedicalHistory = async (data) => {
  const res = await api.post('/medical-history', data);
  return res.data;
};

export const addChronicCondition = async (email, data) => {
  const res = await api.post(`/medical-history/${email}/chronic-condition`, data);
  return res.data;
};

export const addSurgery = async (email, data) => {
  const res = await api.post(`/medical-history/${email}/surgery`, data);
  return res.data;
};

export const addMedication = async (email, data) => {
  const res = await api.post(`/medical-history/${email}/medication`, data);
  return res.data;
};

export const addAllergy = async (email, data) => {
  const res = await api.post(`/medical-history/${email}/allergy`, data);
  return res.data;
};

export const addFamilyHistory = async (email, data) => {
  const res = await api.post(`/medical-history/${email}/family-history`, data);
  return res.data;
};

export const updateLifestyle = async (email, data) => {
  const res = await api.put(`/medical-history/${email}/lifestyle`, data);
  return res.data;
};

export const deleteMedicalHistoryItem = async (email, category, itemId, memberId = null) => {
  const url = memberId
    ? `/medical-history/${email}/${category}/${itemId}?memberId=${memberId}`
    : `/medical-history/${email}/${category}/${itemId}`;
  const res = await api.delete(url);
  return res.data;
};

export default api;
