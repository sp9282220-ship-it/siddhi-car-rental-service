import { Link } from "react-router-dom";
import { FaCarSide } from "react-icons/fa";

export default function NotFound() {
  return (
    <section className="section container text-center" style={{ minHeight: "55vh" }}>
      <FaCarSide className="text-primary" style={{ fontSize: "4rem" }} />
      <h1 className="section-title mt-3">Page not found</h1>
      <p className="text-muted-site mb-4">The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="btn btn-primary-site px-4 py-2">Back to Home</Link>
    </section>
  );
}
