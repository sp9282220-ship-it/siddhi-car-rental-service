import { FiUsers, FiPhone } from "react-icons/fi";
import { BsFuelPump, BsSpeedometer2 } from "react-icons/bs";
import placeholder from "../assets/car-placeholder.svg";
import siteConfig from "../config/siteConfig";
import { useBooking } from "../context/BookingContext";

export default function CarCard({ car }) {
  const { openBooking } = useBooking();
  const available = car.availabilityStatus === "AVAILABLE";
  return (
    <div className="car-card">
      <div className="car-img-wrap">
        <img src={car.imageUrl || placeholder} alt={car.carName} loading="lazy"
          onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }} />
        {!available && <span className="car-unavailable">Currently unavailable</span>}
      </div>
      <div className="car-body">
        <h3>{car.carName}</h3>
        <div className="car-category">{car.category}</div>
        <div className="car-specs">
          <span><FiUsers /> {car.seatingCapacity} Seats</span>
          <span><BsFuelPump /> {car.fuelType}</span>
          <span><BsSpeedometer2 /> {car.transmission}</span>
        </div>
        <div className="price-note">Price can be negotiable</div>
        <div className="car-actions">
          <a className="btn btn-outline-site" href={siteConfig.phoneLink}><FiPhone /> Call</a>
          <button className="btn btn-primary-site" disabled={!available} onClick={() => openBooking(car.id)}>
            {available ? "Book Now" : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
}
