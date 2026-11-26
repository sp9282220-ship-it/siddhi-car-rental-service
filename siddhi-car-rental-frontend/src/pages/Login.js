import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";
import { FaCarSide } from "react-icons/fa";
import { useAuth, dashboardPath } from "../context/AuthContext";
import { errorMessage } from "../services/api";
import { emailRegex } from "../utils/format";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  // already logged in (but not in the middle of our own submit, which navigates by itself)
  if (user && !busy) return <Navigate to={dashboardPath(user)} replace />;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!emailRegex.test(form.email.trim())) e.email = "Enter a valid email address";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    setError("");
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const u = await login(form.email.trim(), form.password);
      const from = location.state?.from;
      const allowed = from && (u.role === "ADMIN" ? from.startsWith("/admin") : !from.startsWith("/admin"));
      navigate(allowed ? from : dashboardPath(u), { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Login failed"));
      setBusy(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-4">
          <FaCarSide className="auth-icon" />
          <h1 className="auth-title">Welcome Back</h1>
          <p className="text-muted-site mb-0">Login to book cars and manage your bookings</p>
        </div>
        {location.state?.from && !error && <div className="alert alert-info py-2">Please login to continue.</div>}
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={submit} noValidate>
          <label className="form-label-site" htmlFor="lg-email"><FiMail /> Email</label>
          <input id="lg-email" name="email" type="email" autoComplete="email" className={`form-control form-control-site ${errors.email ? "is-invalid" : ""}`}
            value={form.email} onChange={change} />
          <div className="invalid-feedback">{errors.email}</div>

          <label className="form-label-site mt-3" htmlFor="lg-password"><FiLock /> Password</label>
          <div className="input-group has-validation">
            <input id="lg-password" name="password" type={show ? "text" : "password"} autoComplete="current-password"
              className={`form-control form-control-site ${errors.password ? "is-invalid" : ""}`} value={form.password} onChange={change} />
            <button type="button" className="btn btn-outline-secondary" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
              {show ? <FiEyeOff /> : <FiEye />}
            </button>
            <div className="invalid-feedback">{errors.password}</div>
          </div>

          <button className="btn btn-primary-site w-100 mt-4 py-2" disabled={busy}><FiLogIn /> {busy ? "Logging in..." : "Login"}</button>
        </form>
        <p className="text-center mt-4 mb-0">New customer? <Link to="/register">Create an account</Link></p>
      </div>
    </section>
  );
}
