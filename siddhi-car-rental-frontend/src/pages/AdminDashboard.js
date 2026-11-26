import { useCallback, useEffect, useState } from "react";
import {
  FiGrid, FiCalendar, FiTruck, FiUsers, FiMail, FiStar, FiEye, FiEdit2, FiTrash2, FiPlus,
  FiCheck, FiX, FiRefreshCw, FiSearch, FiEyeOff,
} from "react-icons/fi";
import {
  getDashboardStats, getAllBookings, updateBookingStatus, getCars, addCar, updateCar, deleteCar,
  getCustomers, getContactMessages, markMessageRead, deleteMessage, getAllTestimonials,
  setTestimonialApproval, deleteTestimonial, errorMessage, fieldErrors,
} from "../services/api";
import { bookingRef, formatDate, formatDateTime, formatTime } from "../utils/format";
import { StatusBadge, Loading, EmptyState, ConfirmDialog, Dialog, Stars } from "../components/common";
import BookingDetails from "../components/BookingDetails";
import placeholder from "../assets/car-placeholder.svg";

const NEXT_STATUS = {
  PENDING: ["CONFIRMED", "REJECTED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
};

/** Loads data with loading/error state. reload() fetches again. */
function useApi(fn) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => {
    setLoading(true);
    return fn()
      .then((r) => { setData(r.data); setError(""); })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return { data, error, loading, reload, setData };
}

const Notice = ({ notice, onClose }) =>
  notice ? <div className={`alert alert-${notice.type} alert-dismissible`}>{notice.text}<button type="button" className="btn-close" aria-label="Close" onClick={onClose} /></div> : null;

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [counts, setCounts] = useState({});

  const refreshCounts = useCallback(() => {
    getDashboardStats().then((r) => setCounts(r.data)).catch(() => {});
  }, []);
  useEffect(refreshCounts, [refreshCounts, tab]);

  const tabs = [
    { key: "overview", label: "Overview", icon: <FiGrid /> },
    { key: "bookings", label: "Bookings", icon: <FiCalendar />, badge: counts.pendingBookings },
    { key: "cars", label: "Cars", icon: <FiTruck /> },
    { key: "customers", label: "Customers", icon: <FiUsers /> },
    { key: "messages", label: "Messages", icon: <FiMail />, badge: counts.unreadMessages },
    { key: "testimonials", label: "Testimonials", icon: <FiStar />, badge: counts.pendingTestimonials },
  ];

  return (
    <section className="section dashboard container-fluid px-3 px-lg-5">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Admin Dashboard</h1>
          <p className="text-muted-site mb-0">Manage cars, bookings, customers, messages and reviews</p>
        </div>
      </div>
      <ul className="nav dash-tabs mb-4" role="tablist">
        {tabs.map((t) => (
          <li className="nav-item" key={t.key}>
            <button className={`nav-link ${tab === t.key ? "active" : ""}`} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
              {t.icon} {t.label} {t.badge > 0 && <span className="badge rounded-pill text-bg-danger ms-1">{t.badge}</span>}
            </button>
          </li>
        ))}
      </ul>
      {tab === "overview" && <Overview goTo={setTab} />}
      {tab === "bookings" && <Bookings onChange={refreshCounts} />}
      {tab === "cars" && <Cars onChange={refreshCounts} />}
      {tab === "customers" && <Customers />}
      {tab === "messages" && <Messages onChange={refreshCounts} />}
      {tab === "testimonials" && <TestimonialsAdmin onChange={refreshCounts} />}
    </section>
  );
}

/* ---------------- Overview ---------------- */
function Overview({ goTo }) {
  const { data: s, error, loading, reload } = useApi(getDashboardStats);
  const [viewing, setViewing] = useState(null);
  if (loading && !s) return <Loading />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  const cards = [
    ["Total Cars", s.totalCars, "primary", "cars", `${s.availableCars} available`],
    ["Total Bookings", s.totalBookings, "info", "bookings"],
    ["Pending Bookings", s.pendingBookings, "warning", "bookings"],
    ["Confirmed Bookings", s.confirmedBookings, "success", "bookings"],
    ["Total Customers", s.totalCustomers, "primary", "customers"],
    ["Unread Messages", s.unreadMessages, "danger", "messages"],
    ["Reviews to Approve", s.pendingTestimonials, "warning", "testimonials"],
    ["Completed Trips", s.completedBookings, "info", "bookings"],
  ];
  return (
    <>
      <div className="row g-3 mb-4">
        {cards.map(([label, value, color, target, sub]) => (
          <div className="col-6 col-lg-3" key={label}>
            <button className={`stat-card stat-${color} w-100 text-start`} onClick={() => goTo(target)}>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
              {sub && <div className="stat-sub">{sub}</div>}
            </button>
          </div>
        ))}
      </div>
      <div className="panel">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h2 className="panel-title mb-0">Recent Bookings</h2>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-secondary" onClick={reload} title="Refresh"><FiRefreshCw /></button>
            <button className="btn btn-sm btn-primary-site" onClick={() => goTo("bookings")}>View all</button>
          </div>
        </div>
        {s.recentBookings.length === 0 ? <p className="text-muted-site mb-0">No bookings yet.</p> : (
          <div className="table-responsive">
            <table className="table table-site align-middle mb-0">
              <thead><tr><th>ID</th><th>Customer</th><th>Car</th><th>Pickup</th><th>Status</th><th /></tr></thead>
              <tbody>
                {s.recentBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="fw-semibold">{bookingRef(b.id)}</td>
                    <td>{b.customerName}<div className="small text-muted-site">{b.phone}</div></td>
                    <td>{b.carName}</td>
                    <td>{formatDate(b.pickupDate)}<div className="small text-muted-site">{formatTime(b.pickupTime)}</div></td>
                    <td><StatusBadge status={b.status} /></td>
                    <td className="text-end"><button className="btn btn-sm btn-outline-site" onClick={() => setViewing(b)} aria-label="View booking"><FiEye /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {viewing && <BookingDetails booking={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}

/* ---------------- Bookings ---------------- */
function Bookings({ onChange }) {
  const { data, error, loading, reload } = useApi(() => getAllBookings());
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null); // { booking, status }
  const [remarks, setRemarks] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const openStatus = (booking, status) => { setEditing({ booking, status }); setRemarks(booking.adminRemarks || ""); };

  const saveStatus = async () => {
    setBusy(true);
    try {
      await updateBookingStatus(editing.booking.id, editing.status, remarks);
      setNotice({ type: "success", text: `Booking ${bookingRef(editing.booking.id)} is now ${editing.status}.` });
      setEditing(null); setViewing(null);
      reload(); onChange();
    } catch (err) {
      setNotice({ type: "danger", text: errorMessage(err) });
      setEditing(null);
    } finally { setBusy(false); }
  };

  if (loading && !data) return <Loading text="Loading bookings..." />;
  const list = (data || [])
    .filter((b) => filter === "ALL" || b.status === filter)
    .filter((b) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return [bookingRef(b.id), String(b.id), b.customerName, b.phone, b.email, b.carName].some((v) => v.toLowerCase().includes(q));
    });

  const actions = (b) => (
    <div className="d-flex gap-1 justify-content-end flex-wrap">
      <button className="btn btn-sm btn-outline-site" onClick={() => setViewing(b)} title="View details" aria-label="View details"><FiEye /></button>
      {b.status === "PENDING" && <>
        <button className="btn btn-sm btn-success" onClick={() => openStatus(b, "CONFIRMED")} title="Confirm"><FiCheck /> Confirm</button>
        <button className="btn btn-sm btn-outline-danger" onClick={() => openStatus(b, "REJECTED")} title="Reject"><FiX /> Reject</button>
      </>}
      {NEXT_STATUS[b.status] && <button className="btn btn-sm btn-outline-secondary" onClick={() => openStatus(b, NEXT_STATUS[b.status][0])} title="Change status"><FiEdit2 /></button>}
    </div>
  );

  return (
    <>
      <Notice notice={notice} onClose={() => setNotice(null)} />
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED"].map((s) => (
          <button key={s} className={`btn btn-sm ${filter === s ? "btn-primary-site" : "btn-outline-secondary"}`} onClick={() => setFilter(s)}>
            {s} ({s === "ALL" ? (data || []).length : (data || []).filter((b) => b.status === s).length})
          </button>
        ))}
        <div className="input-group input-group-sm ms-md-auto search-box">
          <span className="input-group-text"><FiSearch /></span>
          <input className="form-control" placeholder="Search name, phone, email, ID" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search bookings" />
        </div>
        <button className="btn btn-sm btn-outline-secondary" onClick={reload} title="Refresh" aria-label="Refresh"><FiRefreshCw /></button>
      </div>
      {list.length === 0 ? <EmptyState icon={<FiCalendar />} title="No bookings found" /> : (
        <div className="panel p-0">
          <div className="table-responsive">
            <table className="table table-site align-middle mb-0">
              <thead><tr><th>ID</th><th>Customer</th><th>Car</th><th>Pickup</th><th>Return</th><th>Type</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
              <tbody>
                {list.map((b) => (
                  <tr key={b.id}>
                    <td className="fw-semibold">{bookingRef(b.id)}</td>
                    <td>{b.customerName}<div className="small text-muted-site">{b.phone}</div><div className="small text-muted-site text-break">{b.email}</div></td>
                    <td>{b.carName}</td>
                    <td className="text-nowrap">{formatDate(b.pickupDate)}<div className="small text-muted-site">{formatTime(b.pickupTime)}</div></td>
                    <td className="text-nowrap">{formatDate(b.returnDate)}<div className="small text-muted-site">{formatTime(b.returnTime)}</div></td>
                    <td>{b.travelType}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>{actions(b)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {viewing && <BookingDetails booking={viewing} onClose={() => setViewing(null)}
        footer={NEXT_STATUS[viewing.status] && <button className="btn btn-primary-site" onClick={() => openStatus(viewing, NEXT_STATUS[viewing.status][0])}><FiEdit2 /> Update Status</button>} />}
      {editing && (
        <Dialog title={`Update ${bookingRef(editing.booking.id)}`} onClose={() => setEditing(null)} footer={<>
          <button className="btn btn-outline-secondary" onClick={() => setEditing(null)} disabled={busy}>Back</button>
          <button className="btn btn-primary-site" onClick={saveStatus} disabled={busy}>{busy ? "Saving..." : "Save Status"}</button>
        </>}>
          <p className="text-muted-site">{editing.booking.customerName} &middot; {editing.booking.carName} &middot; {formatDate(editing.booking.pickupDate)}</p>
          <label className="form-label-site" htmlFor="st-status">New Status</label>
          <select id="st-status" className="form-select form-control-site" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
            {NEXT_STATUS[editing.booking.status].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <label className="form-label-site mt-3" htmlFor="st-remarks">Remarks for customer (optional)</label>
          <textarea id="st-remarks" rows="3" maxLength={500} className="form-control form-control-site" value={remarks} onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Driver details will be shared 1 hour before pickup" />
        </Dialog>
      )}
    </>
  );
}

/* ---------------- Cars ---------------- */
const emptyCar = { carName: "", category: "", seatingCapacity: "", fuelType: "Petrol", transmission: "Manual", imageUrl: "", description: "", availabilityStatus: "AVAILABLE" };

function Cars({ onChange }) {
  const { data, error, loading, reload } = useApi(() => getCars());
  const [form, setForm] = useState(null); // null = closed, {id?, ...fields}
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState(null);

  const openForm = (car) => {
    setErrors({}); setFormError("");
    setForm(car ? { ...emptyCar, ...car, imageUrl: car.imageUrl || "", description: car.description || "" } : { ...emptyCar });
  };

  const validate = () => {
    const e = {};
    if (!form.carName.trim()) e.carName = "Car name is required";
    if (!form.category.trim()) e.category = "Category is required";
    const seats = Number(form.seatingCapacity);
    if (!Number.isInteger(seats) || seats < 1 || seats > 60) e.seatingCapacity = "Enter seats between 1 and 60";
    if (!form.fuelType.trim()) e.fuelType = "Fuel type is required";
    if (!form.transmission.trim()) e.transmission = "Transmission is required";
    return e;
  };

  const save = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e); setFormError("");
    if (Object.keys(e).length) return;
    setBusy(true);
    const { id, ...body } = form;
    const payload = { ...body, seatingCapacity: Number(body.seatingCapacity) };
    try {
      if (id) await updateCar(id, payload); else await addCar(payload);
      setNotice({ type: "success", text: `${form.carName} ${id ? "updated" : "added"} successfully.` });
      setForm(null);
      reload(); onChange();
    } catch (err) {
      setErrors(fieldErrors(err));
      setFormError(errorMessage(err));
    } finally { setBusy(false); }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await deleteCar(deleting.id);
      setNotice({ type: "success", text: `${deleting.carName} deleted.` });
      reload(); onChange();
    } catch (err) {
      setNotice({ type: "danger", text: errorMessage(err) });
    } finally { setBusy(false); setDeleting(null); }
  };

  if (loading && !data) return <Loading text="Loading cars..." />;
  const f = (name) => `form-control form-control-site ${errors[name] ? "is-invalid" : ""}`;

  return (
    <>
      <Notice notice={notice} onClose={() => setNotice(null)} />
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted-site">{(data || []).length} cars in fleet</span>
        <button className="btn btn-primary-site" onClick={() => openForm(null)}><FiPlus /> Add Car</button>
      </div>
      <div className="panel p-0">
        <div className="table-responsive">
          <table className="table table-site align-middle mb-0">
            <thead><tr><th>Car</th><th>Category</th><th>Seats</th><th>Fuel</th><th>Transmission</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
            <tbody>
              {(data || []).map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img className="car-thumb" src={c.imageUrl || placeholder} alt="" onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }} />
                      <span className="fw-semibold">{c.carName}</span>
                    </div>
                  </td>
                  <td>{c.category}</td>
                  <td>{c.seatingCapacity}</td>
                  <td>{c.fuelType}</td>
                  <td>{c.transmission}</td>
                  <td><span className={`badge text-bg-${c.availabilityStatus === "AVAILABLE" ? "success" : c.availabilityStatus === "MAINTENANCE" ? "warning" : "secondary"}`}>{c.availabilityStatus}</span></td>
                  <td>
                    <div className="d-flex gap-1 justify-content-end">
                      <button className="btn btn-sm btn-outline-site" onClick={() => openForm(c)} aria-label={`Edit ${c.carName}`}><FiEdit2 /> Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleting(c)} aria-label={`Delete ${c.carName}`}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <Dialog title={form.id ? `Edit ${form.carName || "Car"}` : "Add New Car"} onClose={() => setForm(null)} size="dialog-lg">
          {formError && <div className="alert alert-danger py-2">{formError}</div>}
          <form onSubmit={save} noValidate>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label-site" htmlFor="car-name">Car Name</label>
                <input id="car-name" className={f("carName")} value={form.carName} onChange={(e) => setForm({ ...form, carName: e.target.value })} />
                <div className="invalid-feedback">{errors.carName}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label-site" htmlFor="car-cat">Category</label>
                <input id="car-cat" className={f("category")} placeholder="SUV, Sedan, Bus..." value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                <div className="invalid-feedback">{errors.category}</div>
              </div>
              <div className="col-md-4">
                <label className="form-label-site" htmlFor="car-seats">Seats</label>
                <input id="car-seats" type="number" min="1" max="60" className={f("seatingCapacity")} value={form.seatingCapacity} onChange={(e) => setForm({ ...form, seatingCapacity: e.target.value })} />
                <div className="invalid-feedback">{errors.seatingCapacity}</div>
              </div>
              <div className="col-md-4">
                <label className="form-label-site" htmlFor="car-fuel">Fuel Type</label>
                <select id="car-fuel" className={`form-select ${f("fuelType")}`} value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })}>
                  {["Petrol", "Diesel", "CNG", "Electric", "Hybrid"].map((x) => <option key={x}>{x}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label-site" htmlFor="car-trans">Transmission</label>
                <select id="car-trans" className={`form-select ${f("transmission")}`} value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })}>
                  {["Manual", "Automatic"].map((x) => <option key={x}>{x}</option>)}
                </select>
              </div>
              <div className="col-md-8">
                <label className="form-label-site" htmlFor="car-img">Image URL</label>
                <input id="car-img" className={f("imageUrl")} placeholder="/cars/ertiga.jpg or https://..." value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
                <div className="form-text">Put the photo in the frontend's <code>public/cars/</code> folder and enter <code>/cars/file-name.jpg</code>, or paste a full image link.</div>
                <div className="invalid-feedback">{errors.imageUrl}</div>
              </div>
              <div className="col-md-4">
                <label className="form-label-site" htmlFor="car-status">Availability</label>
                <select id="car-status" className="form-select form-control-site" value={form.availabilityStatus} onChange={(e) => setForm({ ...form, availabilityStatus: e.target.value })}>
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="UNAVAILABLE">UNAVAILABLE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label-site" htmlFor="car-desc">Description</label>
                <textarea id="car-desc" rows="2" maxLength={500} className={f("description")} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              {form.imageUrl && (
                <div className="col-12">
                  <img className="car-preview" src={form.imageUrl} alt="Preview" onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }} />
                </div>
              )}
            </div>
            <div className="d-flex gap-2 justify-content-end mt-4">
              <button type="button" className="btn btn-outline-secondary" onClick={() => setForm(null)} disabled={busy}>Cancel</button>
              <button className="btn btn-primary-site px-4" disabled={busy}>{busy ? "Saving..." : form.id ? "Save Changes" : "Add Car"}</button>
            </div>
          </form>
        </Dialog>
      )}
      {deleting && (
        <ConfirmDialog title="Delete car?" busy={busy} confirmText="Delete"
          message={`${deleting.carName} will be removed permanently. Cars that already have bookings cannot be deleted; mark them UNAVAILABLE instead.`}
          onConfirm={doDelete} onClose={() => setDeleting(null)} />
      )}
    </>
  );
}

/* ---------------- Customers ---------------- */
function Customers() {
  const { data, error, loading, reload } = useApi(getCustomers);
  const [search, setSearch] = useState("");
  if (loading && !data) return <Loading text="Loading customers..." />;
  const q = search.trim().toLowerCase();
  const list = (data || []).filter((u) => !q || [u.fullName, u.email, u.phone].some((v) => v.toLowerCase().includes(q)));
  return (
    <>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        <span className="text-muted-site">{(data || []).length} registered customers</span>
        <div className="input-group input-group-sm ms-md-auto search-box">
          <span className="input-group-text"><FiSearch /></span>
          <input className="form-control" placeholder="Search name, email, phone" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search customers" />
        </div>
        <button className="btn btn-sm btn-outline-secondary" onClick={reload} aria-label="Refresh"><FiRefreshCw /></button>
      </div>
      {list.length === 0 ? <EmptyState icon={<FiUsers />} title="No customers found" /> : (
        <div className="panel p-0">
          <div className="table-responsive">
            <table className="table table-site align-middle mb-0">
              <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Mobile</th><th>Registered</th><th>Bookings</th></tr></thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td className="fw-semibold">{u.fullName}</td>
                    <td className="text-break"><a href={`mailto:${u.email}`}>{u.email}</a></td>
                    <td><a href={`tel:${u.phone}`}>{u.phone}</a></td>
                    <td className="text-nowrap">{formatDate(u.createdAt)}</td>
                    <td><span className="badge text-bg-primary">{u.bookingCount}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- Contact messages ---------------- */
function Messages({ onChange }) {
  const { data, error, loading, reload } = useApi(getContactMessages);
  const [notice, setNotice] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const toggleRead = async (m) => {
    try { await markMessageRead(m.id, !m.read); reload(); onChange(); }
    catch (err) { setNotice({ type: "danger", text: errorMessage(err) }); }
  };
  const doDelete = async () => {
    setBusy(true);
    try { await deleteMessage(deleting.id); setNotice({ type: "success", text: "Message deleted." }); reload(); onChange(); }
    catch (err) { setNotice({ type: "danger", text: errorMessage(err) }); }
    finally { setBusy(false); setDeleting(null); }
  };

  if (loading && !data) return <Loading text="Loading messages..." />;
  return (
    <>
      <Notice notice={notice} onClose={() => setNotice(null)} />
      {error && <div className="alert alert-danger">{error}</div>}
      {(data || []).length === 0 ? <EmptyState icon={<FiMail />} title="No messages yet"><p className="text-muted-site">Messages sent from the Contact Us form appear here.</p></EmptyState> : (
        <div className="row g-3">
          {data.map((m) => (
            <div className="col-12 col-lg-6" key={m.id}>
              <div className={`message-card h-100 ${m.read ? "" : "unread"}`}>
                <div className="d-flex justify-content-between gap-2 flex-wrap">
                  <div>
                    <div className="fw-semibold">{m.name} {!m.read && <span className="badge text-bg-danger ms-1">New</span>}</div>
                    <a href={`mailto:${m.email}`} className="small text-break">{m.email}</a>
                  </div>
                  <small className="text-muted-site">{formatDateTime(m.createdAt)}</small>
                </div>
                <p className="my-3 message-text">{m.message}</p>
                <div className="d-flex gap-2 flex-wrap">
                  <a className="btn btn-sm btn-primary-site" href={`mailto:${m.email}?subject=${encodeURIComponent("Re: Your enquiry - Siddhi Cars")}`}>Reply</a>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleRead(m)}>{m.read ? <><FiEyeOff /> Mark unread</> : <><FiCheck /> Mark read</>}</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleting(m)} aria-label="Delete message"><FiTrash2 /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {deleting && <ConfirmDialog title="Delete message?" busy={busy} confirmText="Delete" message={`The message from ${deleting.name} will be deleted permanently.`} onConfirm={doDelete} onClose={() => setDeleting(null)} />}
    </>
  );
}

/* ---------------- Testimonials ---------------- */
function TestimonialsAdmin({ onChange }) {
  const { data, error, loading, reload } = useApi(getAllTestimonials);
  const [notice, setNotice] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const toggle = async (t) => {
    try {
      await setTestimonialApproval(t.id, !t.approved);
      setNotice({ type: "success", text: t.approved ? "Review hidden from the website." : "Review approved and now visible on the website." });
      reload(); onChange();
    } catch (err) { setNotice({ type: "danger", text: errorMessage(err) }); }
  };
  const doDelete = async () => {
    setBusy(true);
    try { await deleteTestimonial(deleting.id); setNotice({ type: "success", text: "Review deleted." }); reload(); onChange(); }
    catch (err) { setNotice({ type: "danger", text: errorMessage(err) }); }
    finally { setBusy(false); setDeleting(null); }
  };

  if (loading && !data) return <Loading text="Loading reviews..." />;
  return (
    <>
      <Notice notice={notice} onClose={() => setNotice(null)} />
      {error && <div className="alert alert-danger">{error}</div>}
      {(data || []).length === 0 ? <EmptyState icon={<FiStar />} title="No reviews yet"><p className="text-muted-site">Reviews submitted on the Testimonials page appear here for approval.</p></EmptyState> : (
        <div className="panel p-0">
          <div className="table-responsive">
            <table className="table table-site align-middle mb-0">
              <thead><tr><th>Customer</th><th>Rating</th><th>Review</th><th>Date</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
              <tbody>
                {data.map((t) => (
                  <tr key={t.id}>
                    <td className="fw-semibold">{t.customerName}</td>
                    <td className="text-nowrap"><Stars value={t.rating} size="0.85rem" /></td>
                    <td className="review-cell">{t.message}</td>
                    <td className="text-nowrap">{formatDate(t.createdAt)}</td>
                    <td><span className={`badge text-bg-${t.approved ? "success" : "warning"}`}>{t.approved ? "APPROVED" : "PENDING"}</span></td>
                    <td>
                      <div className="d-flex gap-1 justify-content-end">
                        <button className={`btn btn-sm ${t.approved ? "btn-outline-secondary" : "btn-success"}`} onClick={() => toggle(t)}>
                          {t.approved ? <><FiEyeOff /> Hide</> : <><FiCheck /> Approve</>}
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleting(t)} aria-label="Delete review"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {deleting && <ConfirmDialog title="Delete review?" busy={busy} confirmText="Delete" message={`The review by ${deleting.customerName} will be deleted permanently.`} onConfirm={doDelete} onClose={() => setDeleting(null)} />}
    </>
  );
}
