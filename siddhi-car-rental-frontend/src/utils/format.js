// Small display helpers shared by the dashboards.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2025-11-24" -> "24 Nov 2025" */
export const formatDate = (iso) => {
  if (!iso) return "-";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
};

/** "14:30" -> "2:30 PM" */
export const formatTime = (t) => {
  if (!t) return "-";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

/** "2025-11-19T10:24:59.42" -> "19 Nov 2025, 10:24 AM" */
export const formatDateTime = (iso) => (iso ? `${formatDate(iso)}, ${formatTime(iso.slice(11, 16))}` : "-");

export const bookingRef = (id) => `SCR-${String(id).padStart(4, "0")}`;

/** Local date as yyyy-MM-dd (toISOString would use UTC and can give yesterday's date in India) */
export const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const nowTimeLocal = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^[6-9]\d{9}$/; // 10-digit Indian mobile number

export const STATUS_BADGE = {
  PENDING: "warning",
  CONFIRMED: "success",
  REJECTED: "danger",
  CANCELLED: "secondary",
  COMPLETED: "primary",
};
