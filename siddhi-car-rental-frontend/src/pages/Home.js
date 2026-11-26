import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/Hero";
import FeaturedCars from "../components/FeaturedCars";
import ContactSection from "../components/ContactSection";

export default function Home() {
  const { hash } = useLocation();
  // allows footer link "/#contact" to scroll to the contact section
  useEffect(() => {
    if (hash) document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  return (
    <>
      <Hero />
      <FeaturedCars />
      <ContactSection />
    </>
  );
}
