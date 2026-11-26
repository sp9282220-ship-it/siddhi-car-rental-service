import { Link } from "react-router-dom";
import { FiMapPin, FiPhone, FiCheckCircle } from "react-icons/fi";
import { FaCarSide, FaHandshake, FaRoute, FaUserTie } from "react-icons/fa";
import siteConfig from "../config/siteConfig";
import { PageHeader } from "../components/common";
import { useBooking } from "../context/BookingContext";

const reasons = [
  { icon: <FaCarSide />, title: "Cars & Buses", text: "Choose from 5 and 7 seater cars and buses for every kind of trip." },
  { icon: <FaRoute />, title: "Local & Outstation", text: "City rides, outstation journeys, airport pickup/drop and corporate travel." },
  { icon: <FaHandshake />, title: "Negotiable Pricing", text: "Talk to us about your trip. Price can be negotiable." },
  { icon: <FaUserTie />, title: "Easy Booking", text: "Book online in a minute and track your booking status anytime." },
];

export default function About() {
  const { openBooking } = useBooking();
  return (
    <>
      <PageHeader title="About Us" subtitle={siteConfig.heroText} />

      <section className="section container-fluid px-3 px-lg-5">
        <div className="row g-5 align-items-center">
          <div className="col-12 col-lg-6">
            <h2 className="section-title">Who We Are</h2>
            <p className="lead-site">
              <strong>{siteConfig.brandFull}</strong> is a Pune based car rental service. {siteConfig.heroText}
            </p>
            <p className="text-muted-site">{siteConfig.footerText}</p>
            <ul className="list-unstyled check-list">
              {siteConfig.travelTypes.map((t) => <li key={t}><FiCheckCircle /> {t}</li>)}
            </ul>
            <div className="d-flex gap-2 flex-wrap mt-4">
              <button className="btn btn-primary-site px-4 py-2" onClick={() => openBooking()}>Book Now</button>
              <a className="btn btn-outline-site px-4 py-2" href={siteConfig.phoneLink}><FiPhone /> {siteConfig.phone}</a>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="about-image">
              <img src="/cars/crysta.jpg" alt="Innova Crysta from our fleet" onError={(e) => { e.target.style.display = "none"; }} />
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container-fluid px-3 px-lg-5">
          <h2 className="section-title text-center">Why Choose Us</h2>
          <div className="row g-4">
            {reasons.map((r) => (
              <div className="col-12 col-sm-6 col-lg-3" key={r.title}>
                <div className="feature-card h-100">
                  <div className="feature-icon">{r.icon}</div>
                  <h3>{r.title}</h3>
                  <p>{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section container-fluid px-3 px-lg-5">
        <h2 className="section-title text-center">Our Locations</h2>
        <div className="row g-4 justify-content-center">
          {siteConfig.locations.map((l) => (
            <div className="col-12 col-md-4" key={l}>
              <div className="feature-card text-center h-100">
                <div className="feature-icon mx-auto"><FiMapPin /></div>
                <h3 className="fs-5">{l}</h3>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <Link to="/contact" className="btn btn-primary-site px-4 py-2">Contact Us</Link>
        </div>
      </section>
    </>
  );
}
