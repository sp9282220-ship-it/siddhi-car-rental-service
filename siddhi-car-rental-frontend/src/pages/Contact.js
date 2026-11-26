import { Link } from "react-router-dom";
import { PageHeader } from "../components/common";
import ContactSection from "../components/ContactSection";

export default function Contact() {
  return (
    <>
      <PageHeader title="Contact Us" subtitle="Call, email or send us a message. We will get back to you shortly." />
      <ContactSection showTitle={false} />
      <div className="container-fluid px-3 px-lg-5 pb-4 text-center">
        <p className="text-muted-site mb-0">Already booked? <Link to="/track">Check your booking status</Link></p>
      </div>
    </>
  );
}
