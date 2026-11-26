import { useState } from "react";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import siteConfig from "../config/siteConfig";
import { sendContactMessage, errorMessage, fieldErrors } from "../services/api";
import { emailRegex } from "../utils/format";

export default function ContactSection({ showTitle = true }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // {type, text}
  const [sending, setSending] = useState(false);

  const change = (e) => { const { name, value } = e.target; setForm((f) => ({ ...f, [name]: value })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!emailRegex.test(form.email.trim())) e.email = "Enter a valid email address";
    if (!form.message.trim()) e.message = "Message is required";
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
      const res = await sendContactMessage(form); // 201 only after the message is saved in MySQL
      setStatus({ type: "success", text: res.data.message || "Thank you! Your message has been sent." });
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setErrors(fieldErrors(err));
      setStatus({ type: "danger", text: errorMessage(err, "Could not send message. Please try again.") });
    } finally { setSending(false); }
  };

  return (
    <section className="section container-fluid px-3 px-lg-5" id="contact">
      <div className="contact-card">
        {showTitle && <h2 className="section-title">Contact Us</h2>}
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="contact-row"><FiPhone className="c-icon" /><a href={siteConfig.phoneLink} className="text-reset">{siteConfig.phone}</a></div>
            <div className="contact-row"><FiMail className="c-icon" /><a href={`mailto:${siteConfig.email}`} className="text-reset text-break">{siteConfig.email}</a></div>
            <div className="contact-row align-items-start">
              <FiMapPin className="c-icon mt-2" />
              <div>{siteConfig.locations.map((l) => <div key={l} className="loc-line">{l}</div>)}</div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <form onSubmit={submit} noValidate>
              {status && <div className={`alert alert-${status.type}`}>{status.text}</div>}
              <label className="form-label-site" htmlFor="ct-name">Name</label>
              <input id="ct-name" className={`form-control form-control-site ${errors.name ? "is-invalid" : ""}`} name="name" value={form.name} onChange={change} />
              <div className="invalid-feedback">{errors.name}</div>
              <label className="form-label-site mt-3" htmlFor="ct-email">Email</label>
              <input id="ct-email" type="email" className={`form-control form-control-site ${errors.email ? "is-invalid" : ""}`} name="email" value={form.email} onChange={change} />
              <div className="invalid-feedback">{errors.email}</div>
              <label className="form-label-site mt-3" htmlFor="ct-message">Message</label>
              <textarea id="ct-message" rows="5" maxLength={2000} className={`form-control form-control-site ${errors.message ? "is-invalid" : ""}`} name="message" value={form.message} onChange={change} />
              <div className="invalid-feedback">{errors.message}</div>
              <button className="btn btn-primary-site w-100 mt-4 py-2" disabled={sending}>
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
