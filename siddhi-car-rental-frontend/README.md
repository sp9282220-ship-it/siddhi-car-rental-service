# Siddhi Car Rental Service - Frontend

React 18 (JavaScript) · Bootstrap 5 · Vite · axios · react-router

1. Install Node.js 18+.
2. `npm install`
3. `npm start`  → http://localhost:3000   (the backend must run on http://localhost:8080)
4. Production build: `npm run build` (output in `dist/`)

Pages: Home, About, Services, Testimonials, Contact, Track Booking, Login, Register,
Customer Dashboard (`/dashboard`), Admin Dashboard (`/admin`).

- Contact details, locations, travel types and texts: `src/config/siteConfig.js`
- All API calls: `src/services/api.js`
- Login state: `src/context/AuthContext.js` (token kept in localStorage)
- Car photos: `public/cars/*.jpg`, hero/banner photo: `public/hero-car.jpg` (credits in the main README)

See the main `README.md` one folder up for full setup and demo steps.
