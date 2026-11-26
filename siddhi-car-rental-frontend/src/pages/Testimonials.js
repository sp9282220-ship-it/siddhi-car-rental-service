import { useEffect, useState } from "react";
import { FaQuoteLeft, FaStar } from "react-icons/fa";
import { FiMessageSquare } from "react-icons/fi";
import { PageHeader, Stars, Loading, EmptyState } from "../components/common";
import { useAuth } from "../context/AuthContext";
import { getTestimonials, submitTestimonial, errorMessage, fieldErrors } from "../services/api";
import { formatDate } from "../utils/format";

export default function Testimonials() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState({ customerName: user?.role === "CUSTOMER" ? user.fullName : "", rating: 0, message: "" });
  const [hover, setHover] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getTestimonials()
      .then((r) => setList(r.data))
      .catch((err) => setLoadError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = "Name is required";
    if (!form.rating) e.rating = "Please select a rating";
    if (form.message.trim().length < 10) e.message = "Please write at least 10 characters";
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setStatus(null);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setSending(true);
    try {
      await submitTestimonial(form);
      setStatus({ type: "success", text: "Thank you for your review! It will appear here after approval by our team." });
      setForm({ customerName: user?.role === "CUSTOMER" ? user.fullName : "", rating: 0, message: "" });
    } catch (err) {
      setErrors(fieldErrors(err));
      setStatus({ type: "danger", text: errorMessage(err, "Could not submit your review.") });
    } finally { setSending(false); }
  };

  const avg = list.length ? (list.reduce((s, t) => s + t.rating, 0) / list.length).toFixed(1) : null;

  return (
    <>
      <PageHeader title="Customer Reviews" subtitle="What our customers say about travelling with us" />
      <section className="section container-fluid px-3 px-lg-5">
        {avg && (
          <div className="rating-summary mb-4">
            <FaStar className="text-warning" /> <strong>{avg}</strong> average from {list.length} review{list.length > 1 ? "s" : ""}
          </div>
        )}
        {loading && <Loading text="Loading reviews..." />}
        {loadError && <div className="alert alert-danger">{loadError}</div>}
        {!loading && !loadError && list.length === 0 && (
          <EmptyState icon={<FiMessageSquare />} title="No reviews yet">
            <p className="text-muted-site">Be the first to share your experience using the form below.</p>
          </EmptyState>
        )}
        <div className="row g-4">
          {list.map((t) => (
            <div className="col-12 col-md-6 col-lg-4" key={t.id}>
              <div className="testimonial-card h-100">
                <FaQuoteLeft className="quote-icon" />
                <p className="testimonial-text">{t.message}</p>
                <div className="d-flex justify-content-between align-items-end mt-auto">
                  <div>
                    <div className="fw-semibold">{t.customerName}</div>
                    <small className="text-muted-site">{formatDate(t.createdAt)}</small>
                  </div>
                  <Stars value={t.rating} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-alt" id="write-review">
        <div className="container-fluid px-3 px-lg-5">
          <div className="contact-card mx-auto" style={{ maxWidth: 760 }}>
            <h2 className="section-title">Share Your Experience</h2>
            {status && <div className={`alert alert-${status.type}`}>{status.text}</div>}
            <form onSubmit={submit} noValidate>
              <label className="form-label-site" htmlFor="tm-name">Your Name</label>
              <input id="tm-name" className={`form-control form-control-site ${errors.customerName ? "is-invalid" : ""}`} value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))} />
              <div className="invalid-feedback">{errors.customerName}</div>

              <label className="form-label-site mt-3">Rating</label>
              <div className={`star-input ${errors.rating ? "is-invalid" : ""}`} onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    className={(hover || form.rating) >= n ? "on" : ""} onMouseEnter={() => setHover(n)}
                    onClick={() => setForm((f) => ({ ...f, rating: n }))}><FaStar /></button>
                ))}
              </div>
              {errors.rating && <div className="text-danger small mt-1">{errors.rating}</div>}

              <label className="form-label-site mt-3" htmlFor="tm-message">Your Review</label>
              <textarea id="tm-message" rows="4" maxLength={1000} className={`form-control form-control-site ${errors.message ? "is-invalid" : ""}`} value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
              <div className="invalid-feedback">{errors.message}</div>

              <button className="btn btn-primary-site w-100 mt-4 py-2" disabled={sending}>{sending ? "Submitting..." : "Submit Review"}</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
