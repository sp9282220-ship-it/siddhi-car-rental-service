import siteConfig from "../config/siteConfig";
import { useBooking } from "../context/BookingContext";

export default function Hero() {
  const { openBooking } = useBooking();
  return (
    <section className="hero" id="home">
      <div className="hero-overlay" />
      <div className="container-fluid px-3 px-lg-5 hero-content">
        <h1>{siteConfig.heroTitle}</h1>
        <p>{siteConfig.heroText}</p>
        <button className="btn btn-primary-site btn-lg-site" onClick={() => openBooking()}>
          Book Now
        </button>
      </div>
    </section>
  );
}
