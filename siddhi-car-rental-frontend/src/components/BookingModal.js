import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCarSide } from "react-icons/fa";
import { FiCalendar, FiClock, FiMapPin, FiUser, FiPhone, FiMail, FiMap, FiEdit3, FiCheckCircle } from "react-icons/fi";
import siteConfig from "../config/siteConfig";
import { useBooking } from "../context/BookingContext";
import { useAuth, dashboardPath } from "../context/AuthContext";
import { getCars, createBooking, errorMessage, fieldErrors } from "../services/api";
import { bookingRef, emailRegex, formatDate, formatTime, nowTimeLocal, phoneRegex, todayLocal } from "../utils/format";
import { StatusBadge } from "./common";

const emptyForm = {
  carId: "", pickupDate: "", pickupTime: "", pickupLocation: "",
  returnDate: "", returnTime: "", returnLocation: "",
  customerName: "", phone: "", email: "", travelType: "", additionalRequirements: "",
};

export default function BookingModal() {
  const { open, carId, preset, closeBooking, bookingSaved } = useBooking();
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [cars, setCars] = useState([]);
  const [carsError, setCarsError] = useState("");
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(null); // booking returned by the backend after it was stored in MySQL

  // load available cars when the modal opens, pre-select the clicked car and prefill the logged-in user's details
  useEffect(() => {
    if (!open) return;
    setStatus(null); setErrors({}); setSaved(null); setCarsError("");
    setForm({
      ...emptyForm, carId, travelType: preset?.travelType || "",
      customerName: user?.role === "CUSTOMER" ? user.fullName : "",
      phone: user?.role === "CUSTOMER" ? user.phone : "",
      email: user?.role === "CUSTOMER" ? user.email : "",
    });
    getCars(true).then((r) => setCars(r.data)).catch((err) => { setCars([]); setCarsError(errorMessage(err)); });
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, carId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && closeBooking();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeBooking]);

  if (!open) return null;

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validate = () => {
    const e = {};
    const today = todayLocal();
    if (!form.carId) e.carId = "Please select a car";
    else if (cars.length && !cars.some((c) => String(c.id) === String(form.carId))) e.carId = "This car is not available right now. Please choose another car.";
    if (!form.pickupDate) e.pickupDate = "Pickup date is required";
    else if (form.pickupDate < today) e.pickupDate = "Pickup date cannot be in the past";
    if (!form.pickupTime) e.pickupTime = "Pickup time is required";
    else if (form.pickupDate === today && form.pickupTime <= nowTimeLocal()) e.pickupTime = "Pickup time has already passed";
    if (!form.pickupLocation) e.pickupLocation = "Select pickup location";
    if (!form.returnDate) e.returnDate = "Return date is required";
    else if (form.pickupDate && form.returnDate < form.pickupDate) e.returnDate = "Return date cannot be earlier than pickup date";
    if (!form.returnTime) e.returnTime = "Return time is required";
    else if (form.pickupDate && form.pickupDate === form.returnDate && form.pickupTime && form.returnTime <= form.pickupTime)
      e.returnTime = "Return time must be after pickup time";
    if (!form.returnLocation) e.returnLocation = "Select return location";
    if (!form.customerName.trim()) e.customerName = "Customer name is required";
    if (!form.phone.trim()) e.phone = "Mobile number is required";
    else if (!phoneRegex.test(form.phone.trim())) e.phone = "Enter a valid 10-digit mobile number";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!emailRegex.test(form.email.trim())) e.email = "Enter a valid email address";
    if (!form.travelType) e.travelType = "Select travel type";
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setStatus(null);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      setStatus({ type: "danger", text: "Please correct the highlighted fields." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await createBooking({ ...form, carId: Number(form.carId) });
      // only reached when the backend answered 201 Created, i.e. the booking row exists in MySQL
      setSaved(res.data);
      bookingSaved();
    } catch (err) {
      setErrors(fieldErrors(err));
      setStatus({ type: "danger", text: errorMessage(err, "Booking failed. Please check your details and try again.") });
    } finally { setSubmitting(false); }
  };

  const field = (name) => `form-control form-control-site ${errors[name] ? "is-invalid" : ""}`;
  const select = (name) => `form-select form-control-site ${errors[name] ? "is-invalid" : ""}`;
  const err = (name) => <div className="invalid-feedback">{errors[name]}</div>;

  const locationSelect = (name, label) => (
    <div className="mb-3">
      <label className="form-label-site" htmlFor={`bk-${name}`}><FiMapPin /> {label}</label>
      <select id={`bk-${name}`} name={name} className={select(name)} value={form[name]} onChange={change}>
        <option value="">Select location</option>
        {siteConfig.locations.map((l) => <option key={l} value={l}>{l}</option>)}
      </select>
      {err(name)}
    </div>
  );

  if (saved) {
    const isCustomer = user?.role === "CUSTOMER";
    return (
      <div className="modal-backdrop-site" onClick={closeBooking}>
        <div className="booking-modal booking-confirm" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
          <div className="text-center mb-4">
            <FiCheckCircle className="confirm-icon" />
            <h2 className="modal-title-site mb-2">Booking Submitted!</h2>
            <p className="text-muted-site mb-0">Your booking has been saved. We will contact you shortly to confirm it.</p>
          </div>
          <div className="confirm-grid">
            <div><span>Booking ID</span><strong>{bookingRef(saved.id)}</strong></div>
            <div><span>Status</span><StatusBadge status={saved.status} /></div>
            <div><span>Car</span><strong>{saved.carName}</strong></div>
            <div><span>Travel Type</span><strong>{saved.travelType}</strong></div>
            <div><span>Pickup</span><strong>{formatDate(saved.pickupDate)}, {formatTime(saved.pickupTime)}</strong><small>{saved.pickupLocation}</small></div>
            <div><span>Return</span><strong>{formatDate(saved.returnDate)}, {formatTime(saved.returnTime)}</strong><small>{saved.returnLocation}</small></div>
            <div><span>Name</span><strong>{saved.customerName}</strong></div>
            <div><span>Contact</span><strong>{saved.phone}</strong><small>{saved.email}</small></div>
          </div>
          <p className="small text-muted-site mt-3 mb-4">
            {isCustomer
              ? "You can follow this booking in your dashboard."
              : <>Save your Booking ID. You can check the status anytime on the <strong>Track Booking</strong> page using the ID and your email.</>}
          </p>
          <div className="d-flex gap-2 flex-wrap">
            {isCustomer
              ? <Link to={dashboardPath(user)} state={{ tab: "bookings" }} className="btn btn-primary-site flex-grow-1 py-2" onClick={closeBooking}>Go to My Bookings</Link>
              : <Link to={`/track?id=${saved.id}&email=${encodeURIComponent(saved.email)}`} className="btn btn-primary-site flex-grow-1 py-2" onClick={closeBooking}>Track Booking</Link>}
            <button type="button" className="btn btn-outline-secondary px-4" onClick={closeBooking}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop-site" onClick={closeBooking}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <h2 className="modal-title-site" id="booking-title">Book Your Car</h2>
        {carsError && <div className="alert alert-warning">{carsError}</div>}
        {status && <div className={`alert alert-${status.type}`}>{status.text}</div>}
        <form onSubmit={submit} noValidate>
          <div className="mb-3">
            <label className="form-label-site" htmlFor="bk-carId"><FaCarSide /> Select Car</label>
            <select id="bk-carId" name="carId" className={select("carId")} value={form.carId} onChange={change}>
              <option value="">Select a car</option>
              {cars.map((c) => <option key={c.id} value={c.id}>{c.carName} ({c.category}, {c.seatingCapacity} seats)</option>)}
            </select>
            {err("carId")}
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label-site" htmlFor="bk-pickupDate"><FiCalendar /> Pickup Date</label>
              <input id="bk-pickupDate" type="date" name="pickupDate" min={todayLocal()} className={field("pickupDate")} value={form.pickupDate} onChange={change} />
              {err("pickupDate")}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label-site" htmlFor="bk-pickupTime"><FiClock /> Pickup Time</label>
              <input id="bk-pickupTime" type="time" name="pickupTime" className={field("pickupTime")} value={form.pickupTime} onChange={change} />
              {err("pickupTime")}
            </div>
          </div>
          {locationSelect("pickupLocation", "Pickup Location")}

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label-site" htmlFor="bk-returnDate"><FiCalendar /> Return Date</label>
              <input id="bk-returnDate" type="date" name="returnDate" min={form.pickupDate || todayLocal()} className={field("returnDate")} value={form.returnDate} onChange={change} />
              {err("returnDate")}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label-site" htmlFor="bk-returnTime"><FiClock /> Return Time</label>
              <input id="bk-returnTime" type="time" name="returnTime" className={field("returnTime")} value={form.returnTime} onChange={change} />
              {err("returnTime")}
            </div>
          </div>
          {locationSelect("returnLocation", "Return Location")}

          <div className="mb-3">
            <label className="form-label-site" htmlFor="bk-customerName"><FiUser /> Customer Name</label>
            <input id="bk-customerName" name="customerName" className={field("customerName")} value={form.customerName} onChange={change} />
            {err("customerName")}
          </div>
          <div className="mb-3">
            <label className="form-label-site" htmlFor="bk-phone"><FiPhone /> Mobile Number</label>
            <input id="bk-phone" name="phone" inputMode="numeric" maxLength={10} className={field("phone")} value={form.phone} onChange={change} />
            {err("phone")}
          </div>
          <div className="mb-3">
            <label className="form-label-site" htmlFor="bk-email"><FiMail /> Email Address</label>
            <input id="bk-email" name="email" type="email" className={field("email")} value={form.email} onChange={change} />
            {err("email")}
          </div>
          <div className="mb-3">
            <label className="form-label-site" htmlFor="bk-travelType"><FiMap /> Travel Type</label>
            <select id="bk-travelType" name="travelType" className={select("travelType")} value={form.travelType} onChange={change}>
              <option value="">Select travel type</option>
              {siteConfig.travelTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {err("travelType")}
          </div>
          <div className="mb-4">
            <label className="form-label-site" htmlFor="bk-additionalRequirements"><FiEdit3 /> Additional Requirements</label>
            <textarea id="bk-additionalRequirements" rows="3" maxLength={1000} name="additionalRequirements" className={field("additionalRequirements")} value={form.additionalRequirements} onChange={change} />
            {err("additionalRequirements")}
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-primary-site flex-grow-1 py-2" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Booking"}
            </button>
            <button type="button" className="btn btn-outline-secondary px-4" onClick={closeBooking}>Close</button>
          </div>
        </form>
      </div>
    </div>
  );
}
