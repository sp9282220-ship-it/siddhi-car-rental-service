# Siddhi Car Rental Service

Full-stack car rental website for **Siddhi Cars & Rentals**, Pune.

| Part      | Technology                                        | Runs on                  |
|-----------|---------------------------------------------------|--------------------------|
| Frontend  | React 18 (JavaScript ES6), HTML, CSS, Bootstrap 5, Vite | http://localhost:3000 |
| Backend   | Java 17, Spring Boot 3.3, Spring Data JPA / Hibernate, Spring Security | http://localhost:8080 |
| Database  | MySQL 8                                           | localhost:3306           |
| Testing   | JUnit 5 + Mockito (backend), Postman collection   |                          |

```
siddhi-car-rental-service/
├── database.sql                     <- creates the database, 5 tables, sample cars and the demo admin
├── postman/                         <- Postman collection (44 requests)
├── TESTING_REPORT.md                <- what was tested and the result of each test
├── siddhi-car-rental-backend/       <- Spring Boot REST API
│   └── src/main/java/com/siddhi/carrental/
│       ├── controller/  service/  repository/  entity/  dto/
│       ├── security/  (JWT token login, role checks)
│       ├── exception/ (clear JSON error messages)
│       └── config/    (security, CORS, default admin)
└── siddhi-car-rental-frontend/      <- React website
    ├── public/cars/  public/hero-car.jpg   (car photos)
    └── src/ pages/  components/  context/  services/api.js  config/siteConfig.js
```

---

## 1. Install the required software (one time)

| Software | Version | Check with |
|----------|---------|------------|
| Java JDK | 17 | `java -version` |
| Apache Maven | 3.8+ | `mvn -v` |
| Node.js | 18 or newer | `node -v` |
| MySQL Server | 8.x (with MySQL Workbench, optional) | `mysql --version` |

> **Tip (Windows):** extract the project to a short path such as `C:\Projects\siddhi-car-rental-service`.
> Very long folder paths (over 260 characters) can stop `npm` tools from starting.

---

## 2. Create the database

**Option A – MySQL Workbench:** open `database.sql`, click the ⚡ (Execute) button.

**Option B – command line** (from the project folder):

```bash
mysql -u root -p < database.sql
```

This creates the database `siddhi_car_rental` with the tables `users`, `cars`, `bookings`,
`contact_messages`, `testimonials` (with primary keys, foreign keys and checks), 3 sample cars and the demo admin.
The script is safe to run again – it never deletes data.

### Set your MySQL password

Open `siddhi-car-rental-backend/src/main/resources/application.properties` and change:

```properties
spring.datasource.username=root
spring.datasource.password=root      <- your MySQL root password
```

---

## 3. Start the backend (port 8080)

```bash
cd siddhi-car-rental-backend
```

```bash
mvn spring-boot:run
```

Wait for `Started SiddhiCarRentalApplication`. Check it in the browser: http://localhost:8080/api/cars

Run the JUnit tests:

```bash
mvn test
```

---

## 4. Start the frontend (port 3000)

Open a **second** terminal:

```bash
cd siddhi-car-rental-frontend
```

```bash
npm install
```

```bash
npm start
```

Open **http://localhost:3000**. (Production build: `npm run build`.)

---

## 5. Logins for the demonstration

| Role | How to log in |
|------|---------------|
| **Admin** | Email `rutikaparekar@gmail.com` / Password `Parekar@123` → opens **Admin Panel** |
| **Customer** | Click **Login → Create an account**, fill name, email, 10-digit mobile number (starting 6-9) and a password (min 6 characters). You are logged in straight away and taken to **My Dashboard**. |

The admin account is created by `database.sql`, and the backend also creates it automatically on start-up
if no admin exists. Change the admin email/password in `application.properties` (`app.admin.*`) **before the first start**.

### Suggested demo flow
1. Home → **Book Now** on a car → fill the form → *Booking Submitted* (Booking ID shown).
2. **Track Booking** (footer link) → enter the Booking ID + email → see status *PENDING*.
3. Login as **admin** → Admin Panel → **Bookings** → *Confirm* (add a remark).
4. Track again → status *CONFIRMED* with the admin's remark.
5. Register a customer → **Book a Car** tab → book → **My Bookings** → *Cancel*.
6. **Contact** page → send a message → Admin Panel → **Messages**.
7. **Testimonials** page → write a review → Admin Panel → **Testimonials** → *Approve* → it appears on the website.
8. Admin Panel → **Cars** → add / edit / delete a car → it appears on the Home page.

---

## 6. Features

**Website (public)**
- Home with hero, featured cars loaded from MySQL (View More/Less), contact section, footer – Phase 1/2 design kept
- About Us, Services (one card per travel type, *Book Now* pre-selects the travel type), Testimonials, Contact Us
- Track Booking page (Booking ID + email) – works for guest bookings
- Booking modal: available cars from the database, pickup/return date, time and location, name, mobile, email, travel type, requirements
- Validation in the browser **and** on the server: required fields, 10-digit Indian mobile, email format, pickup not in the past, return after pickup, car must be AVAILABLE, no overlap with a CONFIRMED booking of the same car
- Success screen is shown **only after the backend returns 201 Created**, i.e. the row is saved in MySQL
- Dark / light mode, fully responsive (mobile menu, tables scroll on small screens)

**Customer dashboard** (`/dashboard`, CUSTOMER only)
- Booking statistics, booking history with status filter, booking details, live status and admin remarks
- Cancel PENDING/CONFIRMED bookings before the pickup time (with confirmation)
- Book a car (available cars only, details pre-filled)
- Profile: change name and mobile, change password

**Admin dashboard** (`/admin`, ADMIN only)
- Overview: total/available cars, total/pending/confirmed/completed bookings, customers, unread messages, reviews waiting, 5 most recent bookings
- Bookings: filter by status, search, details, Confirm / Reject / Complete / Cancel with remarks
- Cars: add, edit (incl. availability AVAILABLE/UNAVAILABLE/MAINTENANCE), delete (blocked if the car has bookings)
- Customers: list with mobile, email, registration date and booking count
- Messages: read/unread, reply by email, delete
- Testimonials: approve/hide, delete

**Security**
- Passwords stored as BCrypt hashes; login returns a signed token (JWT, HMAC-SHA256, 8 hours)
- Logout invalidates the token on the server
- Role-based access: admin APIs return 403 for customers and 401 without login; admin pages redirect
- A customer can only see/cancel their own bookings (checked on the server)

---

## 7. REST API

| Method | URL | Access | Purpose |
|--------|-----|--------|---------|
| POST | /api/auth/register | public | Register customer (returns token) |
| POST | /api/auth/login | public | Login (customer or admin) |
| POST | /api/auth/logout | logged in | Logout (token stops working) |
| GET | /api/auth/me | logged in | Current user |
| GET / PUT | /api/users/me | logged in | View / update profile |
| PUT | /api/users/me/password | logged in | Change password |
| GET | /api/cars (`?available=true`) | public | All cars / available cars |
| GET | /api/cars/{id} | public | Car by ID |
| POST / PUT / DELETE | /api/cars, /api/cars/{id} | ADMIN | Add / update / delete car |
| POST | /api/bookings | public (linked to account if logged in) | Create booking |
| GET | /api/bookings (`?status=`) | ADMIN | All bookings |
| GET | /api/bookings/my | CUSTOMER | My bookings |
| GET | /api/bookings/{id} | owner or ADMIN | Booking by ID |
| GET | /api/bookings/track?id=&email= | public | Booking status check |
| PUT | /api/bookings/{id}/status | ADMIN | Update status `{status, adminRemarks}` |
| PUT | /api/bookings/{id}/cancel | owner or ADMIN | Cancel booking |
| POST | /api/contact | public | Send contact message |
| GET | /api/contact | ADMIN | All messages |
| PUT / DELETE | /api/contact/{id}/read, /api/contact/{id} | ADMIN | Mark read / delete |
| GET / POST | /api/testimonials | public | Approved reviews / submit review |
| GET | /api/testimonials/all | ADMIN | All reviews |
| PUT / DELETE | /api/testimonials/{id}/approval, /api/testimonials/{id} | ADMIN | Approve-hide / delete |
| GET | /api/admin/dashboard | ADMIN | Statistics + recent bookings |
| GET | /api/admin/customers | ADMIN | Registered customers |

Errors always look like `{"status":400,"error":"Bad Request","message":"Validation failed: ...","errors":{"phone":"..."}}`.

### Postman
Postman → **Import** → `postman/Siddhi-Car-Rental-API.postman_collection.json` → run the folders in order
(Collection Runner works too). Login requests store the tokens automatically.
To run it again, change the `customerEmail` collection variable (an email can only be registered once).

---

## 8. Database design

```
users (id PK, full_name, email UNIQUE, phone, password[BCrypt], role ADMIN|CUSTOMER, created_at)
cars (id PK, car_name, category, seating_capacity, fuel_type, transmission, image_url, description, availability_status)
bookings (id PK, car_id FK->cars ON DELETE RESTRICT, user_id FK->users ON DELETE SET NULL (NULL = guest),
          pickup_date/time/location, return_date/time/location, customer_name, phone, email,
          travel_type, additional_requirements, status PENDING|CONFIRMED|REJECTED|CANCELLED|COMPLETED,
          admin_remarks, created_at, updated_at)
contact_messages (id PK, name, email, message, is_read, created_at)
testimonials (id PK, user_id FK->users ON DELETE SET NULL, customer_name, rating 1-5, message, approved, created_at)
```
Relationships: one car → many bookings; one customer → many bookings; one customer → many testimonials.

---

## 9. Changing business details and images

- Phone, email, locations, travel types, texts: `siddhi-car-rental-frontend/src/config/siteConfig.js`
- Car photos: put the file in `siddhi-car-rental-frontend/public/cars/` and set the car's **Image URL** to `/cars/file-name.jpg` in Admin → Cars.
- Hero / page banner photo: `siddhi-car-rental-frontend/public/hero-car.jpg`

**Image credits (Wikimedia Commons):**
- `cars/ertiga.jpg` – "2022 Maruti Suzuki Ertiga LXi", Ramakrishna Mission Vidyapith, Public domain
- `cars/innova.jpg` – "Toyota Innova GCC front", Mohammed Hamad, CC BY-SA 4.0
- `cars/crysta.jpg` – "Toyota Innova Crysta 2.4 Z front right", Premnath Kudva, CC BY-SA 4.0
- `hero-car.jpg` – "Toyota Innova Crysta 2.4 Z side", Premnath Kudva, CC BY-SA 4.0

You may replace these with your own photos of your cars (same file names).

---

## 10. Troubleshooting

| Problem | Fix |
|---------|-----|
| `Access denied for user 'root'@'localhost'` | Wrong MySQL password in `application.properties`. |
| `Communications link failure` | MySQL service is not running. Start it (Windows: Services → MySQL80 → Start). |
| `Port 8080 was already in use` | Another program uses 8080. Close it, or set `server.port=8081` and change `apiBaseUrl` in `siteConfig.js`. |
| Website shows "Cannot reach the server" | Backend is not running – start it (step 3). |
| `Unable to establish loopback connection` (Windows) | Already handled in `SiddhiCarRentalApplication.java` (uses `%USERPROFILE%\.siddhi-car-rental` for Java's internal socket files). If it still appears, check antivirus/firewall rules for Java. |
| `npm start` fails with `spawn ... esbuild.exe ENOENT` | Project path is too long – move the folder to e.g. `C:\Projects\`, delete `node_modules`, run `npm install` again. |
| Logged out unexpectedly | Login tokens are valid for 8 hours (`app.jwt.expiration-minutes`). Logging in again fixes it. |
"# siddhi-car-rental-service" 
