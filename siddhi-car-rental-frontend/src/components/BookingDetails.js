import { Dialog, StatusBadge } from "./common";
import { bookingRef, formatDate, formatDateTime, formatTime } from "../utils/format";

/** Read-only popup with every field of a booking. */
export default function BookingDetails({ booking: b, onClose, footer }) {
  return (
    <Dialog title={`Booking ${bookingRef(b.id)}`} onClose={onClose} size="dialog-lg" footer={footer}>
      <div className="d-flex align-items-center gap-2 mb-3"><span className="text-muted-site">Status:</span> <StatusBadge status={b.status} /></div>
      <div className="confirm-grid">
        <div><span>Car</span><strong>{b.carName}</strong><small>{b.carCategory}</small></div>
        <div><span>Travel Type</span><strong>{b.travelType}</strong></div>
        <div><span>Pickup</span><strong>{formatDate(b.pickupDate)}, {formatTime(b.pickupTime)}</strong><small>{b.pickupLocation}</small></div>
        <div><span>Return</span><strong>{formatDate(b.returnDate)}, {formatTime(b.returnTime)}</strong><small>{b.returnLocation}</small></div>
        <div><span>Customer</span><strong>{b.customerName}</strong><small>{b.userId ? "Registered customer" : "Guest booking"}</small></div>
        <div><span>Contact</span><strong><a href={`tel:${b.phone}`}>{b.phone}</a></strong><small className="text-break">{b.email}</small></div>
        <div><span>Booked On</span><strong>{formatDateTime(b.createdAt)}</strong></div>
        <div><span>Last Updated</span><strong>{formatDateTime(b.updatedAt)}</strong></div>
      </div>
      <div className="mt-3">
        <span className="text-muted-site small">Additional Requirements</span>
        <p className="mb-2">{b.additionalRequirements || "None"}</p>
        {b.adminRemarks && <div className="alert alert-info py-2 mb-0"><strong>Remarks:</strong> {b.adminRemarks}</div>}
      </div>
    </Dialog>
  );
}
