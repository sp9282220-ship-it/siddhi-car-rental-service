import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiPhone, FiLock, FiUserPlus } from "react-icons/fi";
import { FaCarSide } from "react-icons/fa";
import { useAuth, dashboardPath } from "../context/AuthContext";
import { errorMessage, fieldErrors } from "../services/api";
import { emailRegex, phoneRegex } from "../utils/format";

const empty = { fullName: "", email: "", phone: "", password: "", confirmPassword: "" };

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // already logged in (but not in the middle of our own submit, which navigates by itself)
  if (user && !busy) return <Navigate to={dashboardPath(user)} replace />;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!emailRegex.test(form.email.trim())) e.email = "Enter a valid email address";
    if (!form.phone.trim()) e.phone = "Mobile number is required";
    else if (!phoneRegex.test(form.phone.trim())) e.phone = "Enter a valid 10-digit mobile number";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (form.confirmPassword !== form.password) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setError("");
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const { confirmPassword, ...data } = form;
      const u = await register({ ...data, fullName: data.fullName.trim(), email: data.email.trim(), phone: data.phone.trim() });
      navigate(dashboardPath(u), { replace: true, state: { welcome: true } });
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(errorMessage(err, "Registration failed"));
      setBusy(false);
    }
  };

  const input = (name, label, icon, props = {}) => (
    <div className="mb-3">
      <label className="form-label-site" htmlFor={`rg-${name}`}>{icon} {label}</label>
      <input id={`rg-${name}`} name={name} className={`form-control form-control-site ${errors[name] ? "is-invalid" : ""}`}
        value={form[name]} onChange={change} {...props} />
      <div className="invalid-feedback">{errors[name]}</div>
    </div>
  );

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-4">
          <FaCarSide className="auth-icon" />
          <h1 className="auth-title">Create Account</h1>
          <p className="text-muted-site mb-0">Register to book cars and track all your bookings</p>
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={submit} noValidate>
          {input("fullName", "Full Name", <FiUser />, { autoComplete: "name" })}
          {input("email", "Email", <FiMail />, { type: "email", autoComplete: "email" })}
          {input("phone", "Mobile Number", <FiPhone />, { inputMode: "numeric", maxLength: 10, autoComplete: "tel" })}
          <div className="row">
            <div className="col-sm-6">{input("password", "Password", <FiLock />, { type: "password", autoComplete: "new-password" })}</div>
            <div className="col-sm-6">{input("confirmPassword", "Confirm Password", <FiLock />, { type: "password", autoComplete: "new-password" })}</div>
          </div>
          <button className="btn btn-primary-site w-100 mt-2 py-2" disabled={busy}><FiUserPlus /> {busy ? "Creating account..." : "Register"}</button>
        </form>
        <p className="text-center mt-4 mb-0">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </section>
  );
}
