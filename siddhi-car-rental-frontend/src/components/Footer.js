import { Link } from "react-router-dom";
import { FiFacebook, FiInstagram, FiMapPin, FiPhone } from "react-icons/fi";
import siteConfig from "../config/siteConfig";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-fluid px-3 px-lg-5">
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <h4>{siteConfig.brandFull}</h4>
            <p className="footer-text">{siteConfig.footerText}</p>
          </div>
          <div className="col-12 col-md-4">
            <h4>Quick Links</h4>
            <ul className="list-unstyled footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/testimonials">Testimonials</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/track">Track Booking</Link></li>
            </ul>
          </div>
          <div className="col-12 col-md-4">
            <h4>Connect With Us</h4>
            <div className="footer-icons">
              <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FiFacebook /></a>
              <a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><FiInstagram /></a>
              <Link to="/contact" aria-label="Location"><FiMapPin /></Link>
              <a href={siteConfig.phoneLink} aria-label="Phone"><FiPhone /></a>
            </div>
          </div>
        </div>
        <hr className="footer-line" />
        <p className="text-center footer-text mb-0 pb-3">
          &copy; {siteConfig.year} {siteConfig.brandFull}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
