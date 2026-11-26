import { FaCity, FaRoute, FaBriefcase, FaPlaneDeparture, FaBus } from "react-icons/fa";
import { FiPhone } from "react-icons/fi";
import siteConfig from "../config/siteConfig";
import { PageHeader } from "../components/common";
import { useBooking } from "../context/BookingContext";

// One card per travel type configured in siteConfig.travelTypes
const details = {
  "Local": { icon: <FaCity />, text: "Car on rent for city travel, shopping, functions and day-long local use within Pune." },
  "Outstation": { icon: <FaRoute />, text: "Comfortable cars for weekend getaways, family trips and long journeys outside the city." },
  "Corporate": { icon: <FaBriefcase />, text: "Reliable travel for employees, guests and business meetings." },
  "Airport Pickup/Drop": { icon: <FaPlaneDeparture />, text: "On-time pickup and drop to the airport so you never miss a flight." },
  "Bus Rental": { icon: <FaBus />, text: "Buses for group tours, weddings, events and staff transport." },
};

export default function Services() {
  const { openBooking } = useBooking();
  return (
    <>
      <PageHeader title="Our Services" subtitle={siteConfig.heroText} />
      <section className="section container-fluid px-3 px-lg-5">
        <div className="row g-4">
          {siteConfig.travelTypes.map((t) => (
            <div className="col-12 col-md-6 col-lg-4" key={t}>
              <div className="feature-card service-card h-100 d-flex flex-column">
                <div className="feature-icon">{details[t]?.icon || <FaRoute />}</div>
                <h3>{t}</h3>
                <p className="flex-grow-1">{details[t]?.text}</p>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary-site flex-grow-1" onClick={() => openBooking("", { travelType: t })}>Book Now</button>
                  <a className="btn btn-outline-site" href={siteConfig.phoneLink} aria-label={`Call for ${t}`}><FiPhone /></a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="section section-alt">
        <div className="container-fluid px-3 px-lg-5 text-center">
          <h2 className="section-title">Need something else?</h2>
          <p className="lead-site mb-4">Call us on <a href={siteConfig.phoneLink}>{siteConfig.phone}</a> or write to <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. Price can be negotiable.</p>
          <button className="btn btn-primary-site btn-lg-site" onClick={() => openBooking()}>Book Your Car</button>
        </div>
      </section>
    </>
  );
}
