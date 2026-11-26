import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiList, FiTruck, FiUser, FiCalendar, FiClock, FiMapPin, FiEye, FiXCircle, FiPlusCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import { getMyBookings, getCars, cancelBooking, updateProfile, changePassword, errorMessage, fieldErrors } from "../services/api";
import { bookingRef, formatDate, formatTime, phoneRegex, todayLocal, nowTimeLocal } from "../utils/format";
import { StatusBadge, Loading, EmptyState, ConfirmDialog } from "../components/common";
import BookingDetails from "../components/BookingDetails";
import CarCard from "../components/CarCard";

const canCancel = (b) =>
  (b.status === "PENDING" || b.status === "CONFIRMED") &&
  (b.pickupDate > todayLocal() || (b.pickupDate === todayLocal() && b.pickupTime > nowTimeLocal()));

export default function CustomerDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.tab || "bookings");

  // links like "Go to My Bookings" pass the tab to open
  useEffect(() => { if (location.state?.tab) setTab(location.state.tab); }, [location.state]);

  const tabs = [
    { key: "bookings", label: "My Bookings", icon: <FiList /> },
    { key: "cars", label: "Book a Car", icon: <FiTruck /> },
    { key: "profile", label: "My Profile", icon: <FiUser /> },
  ];

  return (
    <section className="section dashboard container-fluid px-3 px-lg-5">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Hello, {user.fullName.split(" ")[0]}</h1>
          <p className="text-muted-site mb-0">Manage your bookings and profile</p>
        </div>
      </div>
      {location.state?.welcome && <div className="alert alert-success">Your account has been created. You can now book a car!</div>}
      <ul className="nav dash-tabs mb-4" role="tablist">
        {tabs.map((t) => (
          <li className="nav-item" key={t.key}>
            <button className={`nav-link ${tab === t.key ? "active" : ""}`} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
              {t.icon} {t.label}
            </button>
          </li>
        ))}
      </ul>
      {tab === "bookings" && <MyBookings onBook={() => setTab("cars")} />}
      {tab === "cars" && <AvailableCars />}
      {tab === "profile" && <Profile />}
    </section>
  );
}

function MyBookings({ onBook }) {
  const { bookingVersion } = useBooking();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const load = useCallback(() => {
    setLoading(true);
    getMyBookings()
      .then((r) => { setBookings(r.data); setError(""); })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load, bookingVersion]);

  const doCancel = async () => {
    setBusy(true);
    try {
      await cancelBooking(cancelling.id);
      setNotice({ type: "success", text: `Booking ${bookingRef(cancelling.id)} has been cancelled.` });
      load();
    } catch (err) {
      setNotice({ type: "danger", text: errorMessage(err) });
    } finally { setBusy(false); setCancelling(null); }
  };

  const count = (s) => bookings.filter((b) => b.status === s).length;
  const shown = filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  if (loading && !bookings.length) return <Loading text="Loading your bookings..." />;

  return (
    <>
      <div className="row g-3 mb-4">
        {[["Total", bookings.length, "primary"], ["Pending", count("PENDING"), "warning"], ["Confirmed", count("CONFIRMED"), "success"], ["Completed", count("COMPLETED"), "info"]].map(([label, value, color]) => (
          <div className="col-6 col-md-3" key={label}>
            <div className={`stat-card stat-${color}`}><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>
          </div>
        ))}
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {notice && <div className={`alert alert-${notice.type} alert-dismissible`}>{notice.text}<button type="button" className="btn-close" onClick={() => setNotice(null)} aria-label="Close" /></div>}

      {bookings.length === 0 && !error ? (
        <EmptyState icon={<FiCalendar />} title="No bookings yet">
          <p className="text-muted-site">Your bookings will appear here with their live status.</p>
          <button className="btn btn-primary-site px-4" onClick={onBook}><FiPlusCircle /> Book a Car</button>
        </EmptyState>
      ) : (
        <>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED"].map((s) => (
              <button key={s} className={`btn btn-sm ${filter === s ? "btn-primary-site" : "btn-outline-secondary"}`} onClick={() => setFilter(s)}>{s}</button>
            ))}
          </div>
          <div className="row g-3">
            {shown.map((b) => (
              <div className="col-12 col-lg-6" key={b.id}>
                <div className="booking-item h-100">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <div className="booking-ref">{bookingRef(b.id)}</div>
                      <h3 className="booking-car">{b.carName}</h3>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="booking-meta">
                    <span><FiCalendar /> {formatDate(b.pickupDate)} {formatTime(b.pickupTime)} &rarr; {formatDate(b.returnDate)} {formatTime(b.returnTime)}</span>
                    <span><FiMapPin /> {b.pickupLocation}</span>
                    <span><FiClock /> {b.travelType}</span>
                  </div>
                  {b.adminRemarks && <div className="small alert alert-info py-1 px-2 mb-2">{b.adminRemarks}</div>}
                  <div className="d-flex gap-2 mt-auto">
                    <button className="btn btn-sm btn-outline-site" onClick={() => setViewing(b)}><FiEye /> Details</button>
                    {canCancel(b) && <button className="btn btn-sm btn-outline-danger" onClick={() => setCancelling(b)}><FiXCircle /> Cancel</button>}
                  </div>
                </div>
              </div>
            ))}
            {shown.length === 0 && <p className="text-muted-site">No {filter.toLowerCase()} bookings.</p>}
          </div>
        </>
      )}
      {viewing && <BookingDetails booking={viewing} onClose={() => setViewing(null)} />}
      {cancelling && (
        <ConfirmDialog title="Cancel booking?" busy={busy} confirmText="Yes, cancel booking"
          message={`Booking ${bookingRef(cancelling.id)} for ${cancelling.carName} on ${formatDate(cancelling.pickupDate)} will be cancelled. This cannot be undone.`}
          onConfirm={doCancel} onClose={() => setCancelling(null)} />
      )}
    </>
  );
}

function AvailableCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    getCars(true).then((r) => setCars(r.data)).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false));
  }, []);
  if (loading) return <Loading text="Loading available cars..." />;
  return (
    <>
      {error && <div className="alert alert-danger">{error}</div>}
      {!error && cars.length === 0 && <EmptyState icon={<FiTruck />} title="No cars available right now"><p className="text-muted-site">Please call us for availability.</p></EmptyState>}
      <div className="row g-4">
        {cars.map((c) => <div className="col-12 col-md-6 col-xl-4" key={c.id}><CarCard car={c} /></div>)}
      </div>
    </>
  );
}

function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ fullName: user.fullName, phone: user.phone });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [pwMsg, setPwMsg] = useState(null);
  const [pwBusy, setPwBusy] = useState(false);

  const saveProfile = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!phoneRegex.test(form.phone.trim())) e.phone = "Enter a valid 10-digit mobile number";
    setErrors(e); setMsg(null);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const res = await updateProfile({ fullName: form.fullName.trim(), phone: form.phone.trim() });
      setUser(res.data);
      setMsg({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      setErrors(fieldErrors(err));
      setMsg({ type: "danger", text: errorMessage(err) });
    } finally { setBusy(false); }
  };

  const savePassword = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!pw.currentPassword) e.currentPassword = "Current password is required";
    if (pw.newPassword.length < 6) e.newPassword = "New password must be at least 6 characters";
    if (pw.confirm !== pw.newPassword) e.confirm = "Passwords do not match";
    setPwErrors(e); setPwMsg(null);
    if (Object.keys(e).length) return;
    setPwBusy(true);
    try {
      await changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      setPwMsg({ type: "success", text: "Password changed successfully." });
    } catch (err) {
      setPwMsg({ type: "danger", text: errorMessage(err) });
    } finally { setPwBusy(false); }
  };

  const cls = (errs, name) => `form-control form-control-site ${errs[name] ? "is-invalid" : ""}`;

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-6">
        <div className="panel">
          <h2 className="panel-title">Profile Details</h2>
          {msg && <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>}
          <form onSubmit={saveProfile} noValidate>
            <label className="form-label-site" htmlFor="pf-name">Full Name</label>
            <input id="pf-name" className={cls(errors, "fullName")} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <div className="invalid-feedback">{errors.fullName}</div>
            <label className="form-label-site mt-3" htmlFor="pf-email">Email (cannot be changed)</label>
            <input id="pf-email" className="form-control form-control-site" value={user.email} disabled />
            <label className="form-label-site mt-3" htmlFor="pf-phone">Mobile Number</label>
            <input id="pf-phone" maxLength={10} inputMode="numeric" className={cls(errors, "phone")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <div className="invalid-feedback">{errors.phone}</div>
            <button className="btn btn-primary-site mt-4 px-4" disabled={busy}>{busy ? "Saving..." : "Save Changes"}</button>
          </form>
        </div>
      </div>
      <div className="col-12 col-lg-6">
        <div className="panel">
          <h2 className="panel-title">Change Password</h2>
          {pwMsg && <div className={`alert alert-${pwMsg.type} py-2`}>{pwMsg.text}</div>}
          <form onSubmit={savePassword} noValidate>
            <label className="form-label-site" htmlFor="pw-cur">Current Password</label>
            <input id="pw-cur" type="password" autoComplete="current-password" className={cls(pwErrors, "currentPassword")} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
            <div className="invalid-feedback">{pwErrors.currentPassword}</div>
            <label className="form-label-site mt-3" htmlFor="pw-new">New Password</label>
            <input id="pw-new" type="password" autoComplete="new-password" className={cls(pwErrors, "newPassword")} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
            <div className="invalid-feedback">{pwErrors.newPassword}</div>
            <label className="form-label-site mt-3" htmlFor="pw-conf">Confirm New Password</label>
            <input id="pw-conf" type="password" autoComplete="new-password" className={cls(pwErrors, "confirm")} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
            <div className="invalid-feedback">{pwErrors.confirm}</div>
            <button className="btn btn-primary-site mt-4 px-4" disabled={pwBusy}>{pwBusy ? "Updating..." : "Change Password"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
