import { Navigate, useLocation } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import { FaStar, FaRegStar } from "react-icons/fa";
import { useAuth, dashboardPath } from "../context/AuthContext";
import { STATUS_BADGE } from "../utils/format";

/** Only lets logged-in users with the right role see the page. */
export function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to={dashboardPath(user)} replace />;
  return children;
}

export const StatusBadge = ({ status }) => (
  <span className={`badge status-badge text-bg-${STATUS_BADGE[status] || "secondary"}`}>{status}</span>
);

export const Stars = ({ value, size = "1rem" }) => (
  <span className="stars" style={{ fontSize: size }} aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (n <= value ? <FaStar key={n} /> : <FaRegStar key={n} />))}
  </span>
);

/** Page title banner used on inner pages (About, Services ...) */
export const PageHeader = ({ title, subtitle }) => (
  <section className="page-header">
    <div className="hero-overlay" />
    <div className="container-fluid px-3 px-lg-5 position-relative">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  </section>
);

/** Simple confirm / form dialog. */
export function Dialog({ title, children, onClose, footer, size = "" }) {
  return (
    <div className="modal-backdrop-site" onClick={onClose}>
      <div className={`dialog-site ${size}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h3 className="dialog-title">{title}</h3>
          <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
        </div>
        {children}
        {footer && <div className="d-flex gap-2 justify-content-end mt-4 flex-wrap">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmText = "Confirm", variant = "danger", busy, onConfirm, onClose }) {
  return (
    <Dialog title={title} onClose={onClose} footer={<>
      <button className="btn btn-outline-secondary" onClick={onClose} disabled={busy}>Back</button>
      <button className={`btn btn-${variant}`} onClick={onConfirm} disabled={busy}>{busy ? "Please wait..." : confirmText}</button>
    </>}>
      <p className="d-flex gap-2 mb-0"><FiAlertTriangle className="text-warning flex-shrink-0 mt-1" /> <span>{message}</span></p>
    </Dialog>
  );
}

export const Loading = ({ text = "Loading..." }) => (
  <div className="d-flex align-items-center gap-2 py-4 text-muted-site">
    <div className="spinner-border spinner-border-sm text-primary" role="status" /> {text}
  </div>
);

export const EmptyState = ({ icon, title, children }) => (
  <div className="empty-state">
    <div className="empty-icon">{icon}</div>
    <h4>{title}</h4>
    {children}
  </div>
);
