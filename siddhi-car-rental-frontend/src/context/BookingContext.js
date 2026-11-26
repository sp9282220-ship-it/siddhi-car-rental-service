import { createContext, useContext, useState } from "react";

const BookingContext = createContext();

// Any component can call openBooking(carId, { travelType }) to show the booking modal.
// bookingVersion increases after every successful booking so dashboards can reload their lists.
export function BookingProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [carId, setCarId] = useState("");
  const [preset, setPreset] = useState({});
  const [bookingVersion, setBookingVersion] = useState(0);

  const openBooking = (id = "", options = {}) => { setCarId(id ? String(id) : ""); setPreset(options); setOpen(true); };
  const closeBooking = () => setOpen(false);
  const bookingSaved = () => setBookingVersion((v) => v + 1);

  return (
    <BookingContext.Provider value={{ open, carId, preset, openBooking, closeBooking, bookingVersion, bookingSaved }}>
      {children}
    </BookingContext.Provider>
  );
}
export const useBooking = () => useContext(BookingContext);
