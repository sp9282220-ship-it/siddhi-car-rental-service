import { useEffect, useState } from "react";
import { getCars } from "../services/api";
import CarCard from "./CarCard";

export default function FeaturedCars() {
  const [cars, setCars] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCars()
      .then((res) => setCars(res.data))
      .catch(() => setError("Could not load cars. Please make sure the backend is running on port 8080."))
      .finally(() => setLoading(false));
  }, []);

  const visible = showAll ? cars : cars.slice(0, 3);

  return (
    <section className="section container-fluid px-3 px-lg-5">
      <h2 className="section-title">Featured Cars</h2>
      {loading && <p>Loading cars...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-4">
        {visible.map((car) => (
          <div className="col-12 col-md-6 col-lg-4" key={car.id}><CarCard car={car} /></div>
        ))}
      </div>
      {cars.length > 3 && (
        <div className="text-center mt-4">
          <button className="btn btn-primary-site px-4" onClick={() => setShowAll(!showAll)}>
            {showAll ? "View Less" : "View More"}
          </button>
        </div>
      )}
    </section>
  );
}
