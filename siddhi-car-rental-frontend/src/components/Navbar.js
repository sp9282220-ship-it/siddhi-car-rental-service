import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { FiHome, FiInfo, FiBriefcase, FiStar, FiUser, FiMenu, FiX, FiPhoneCall, FiGrid, FiLogOut } from "react-icons/fi";
import { FaCarSide } from "react-icons/fa";
import siteConfig from "../config/siteConfig";
import { useAuth, dashboardPath } from "../context/AuthContext";

const links = [
  { to: "/", label: "Home", icon: <FiHome /> },
  { to: "/about", label: "About", icon: <FiInfo /> },
  { to: "/services", label: "Services", icon: <FiBriefcase /> },
  { to: "/testimonials", label: "Testimonials", icon: <FiStar /> },
  { to: "/contact", label: "Contact", icon: <FiPhoneCall /> },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const close = () => setOpen(false);

  const doLogout = async () => {
    close();
    navigate("/"); // leave protected pages first so they don't redirect to /login
    await logout();
  };

  return (
    <header className="site-nav">
      <div className="container-fluid px-3 px-lg-4 d-flex align-items-center justify-content-between">
        <Link to="/" className="brand" onClick={close}>
          <FaCarSide className="brand-icon" /> {siteConfig.brandShort}
        </Link>

        <button className="nav-toggle d-lg-none" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <FiX size={26} /> : <FiMenu size={26} />}
        </button>

        <nav className={`nav-links ${open ? "show" : ""}`}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} onClick={close}
              className={({ isActive }) => "nav-item-link" + (isActive ? " active" : "")}>
              {l.icon} <span>{l.label}</span>
            </NavLink>
          ))}
          {user ? (
            <div className="nav-user">
              <NavLink to={dashboardPath(user)} onClick={close} className="btn btn-primary-site login-btn">
                <FiGrid /> {user.role === "ADMIN" ? "Admin Panel" : "My Dashboard"}
              </NavLink>
              <button className="btn btn-outline-site logout-btn" onClick={doLogout} title="Logout">
                <FiLogOut /> <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary-site login-btn" onClick={close}>
              <FiUser /> Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
