import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { PageHeader, StatusBadge } from "../components/common";
import { trackBooking, errorMessage } from "../services/api";
import { bookingRef, emailRegex, formatDate, formatDateTime, formatTime } from "../utils/format";

const STATUS_TEXT = {
  PENDING: "We have received your booking and will confirm it shortly.",
  CONFIRMED: "Your booking is confirmed. Have a safe journey!",
  REJECTED: "Sorry, we could not accept this booking. Please call us for other options.",
  CANCELLED: "This booking has been cancelled.",
  COMPLETED: "This trip is completed. Thank you for travelling with us!",
};

/** Public booking-status check using Booking ID + email (works for guest bookings too). */
export default function TrackBooking() {
  const [params] = useSearchParams();
  const [id, setId] = useState(params.get("id") || "");
  const [email, setEmail] = useState(params.get("email") || "");
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async (bookingId, mail) => {
    const numeric = String(bookingId).replace(/^SCR-?/i, "").replace(/^0+/, "");
    if (!/^\d+$/.test(numeric)) { setError("Enter a valid Booking ID, e.g. SCR-0012 or 12"); return; }
    if (!emailRegex.test(mail.trim())) { setError("Enter the email address used for the booking"); return; }
    setLoading(true); setError(""); setBooking(null);
    try {
      const res = await trackBooking(numeric, mail.trim());
      setBooking(res.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (params.get("id") && params.get("email")) lookup(params.get("id"), params.get("email"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageHeader title="Track Booking" subtitle="Check the status of your booking with your Booking ID and email" />
      <section className="section container-fluid px-3 px-lg-5">
        <div className="contact-card mx-auto" style={{ maxWidth: 820 }}>
          <form className="row g-3 align-items-end" onSubmit={(e) => { e.preventDefault(); lookup(id, email); }} noValidate>
            <div className="col-12 col-md-4">
              <label className="form-label-site" htmlFor="tr-id">Booking ID</label>
              <input id="tr-id" className="form-control form-control-site" placeholder="SCR-0001" value={id} onChange={(e) => setId(e.target.value)} />
            </div>
            <div className="col-12 col-md-5">
              <label className="form-label-site" htmlFor="tr-email">Email used for booking</label>
              <input id="tr-email" type="email" className="form-control form-control-site" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="col-12 col-md-3">
              <button className="btn btn-primary-site w-100 py-2" disabled={loading}><FiSearch /> {loading ? "Checking..." : "Check Status"}</button>
            </div>
          </form>
          {error && <div className="alert alert-danger mt-4 mb-0">{error}</div>}
          {booking && (
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                <h3 className="h4 mb-0">{bookingRef(booking.id)}</h3>
                <StatusBadge status={booking.status} />
              </div>
              <p className="text-muted-site">{STATUS_TEXT[booking.status]}</p>
              {booking.adminRemarks && <div className="alert alert-info py-2"><strong>Note from Siddhi Cars:</strong> {booking.adminRemarks}</div>}
              <div className="confirm-grid">
                <div><span>Car</span><strong>{booking.carName}</strong></div>
                <div><span>Travel Type</span><strong>{booking.travelType}</strong></div>
                <div><span>Pickup</span><strong>{formatDate(booking.pickupDate)}, {formatTime(booking.pickupTime)}</strong><small>{booking.pickupLocation}</small></div>
                <div><span>Return</span><strong>{formatDate(booking.returnDate)}, {formatTime(booking.returnTime)}</strong><small>{booking.returnLocation}</small></div>
                <div><span>Name</span><strong>{booking.customerName}</strong></div>
                <div><span>Booked On</span><strong>{formatDateTime(booking.createdAt)}</strong></div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
