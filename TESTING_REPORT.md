# Testing Report – Siddhi Car Rental Service

**Date:** 19 Nov 2026 · **Machine:** Windows 11 Enterprise (this laptop)

**Test environment used**
- Java: Eclipse Temurin JDK 17.0.21 (portable copy)
- Maven: 3.9.9 (portable copy)
- MySQL: Community Server 8.4.3 (portable copy, `root` / `root`, port 3306)
- Node.js: v24.19.0 with npm (already installed)
- Browser: Claude desktop app's built-in Chromium browser at 1024 px, 768 px (tablet) and 375 px (mobile)

Result legend: **PASS** = ran and behaved correctly · **FAIL** = ran and did not work · **NOT RUN** = not executed (reason given).

---

## A. The 18 mandatory checks

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Run the frontend, fix all build errors | **PASS** | `npm run build`: 120 modules, 0 errors, 0 warnings. `npm start` serves http://localhost:3000. |
| 2 | Compile the complete Spring Boot backend | **PASS** | `mvn package` → BUILD SUCCESS, jar created. |
| 3 | Fix all Java compilation errors | **PASS** | 0 compilation errors or warnings. |
| 4 | Connect the application to MySQL | **PASS** | Backend connects through HikariCP and reads/writes `siddhi_car_rental`. |
| 5 | Verify all tables are created correctly | **PASS** | `database.sql` creates `users, cars, bookings, contact_messages, testimonials` + 3 foreign keys (`fk_bookings_car`, `fk_bookings_user`, `fk_testimonials_user`). Backend started with `ddl-auto=validate`, so Hibernate confirmed every table/column matches the entities. Also tested: an empty database without the script → the app creates all 5 tables and the admin itself. |
| 6 | Test every API | **PASS** | Automated end-to-end script: **80/80 checks passed** (all endpoints, success and error cases). Postman collection requests executed in order: **44/44 returned the expected status**. |
| 7 | Frontend ↔ backend integration | **PASS** | All pages load data via the REST API (cars, bookings, reviews, dashboards); no hardcoded data. |
| 8 | Customer registration and login | **PASS** | UI: password-mismatch caught → registered → auto-login → dashboard. API: duplicate email → 409, invalid fields → 400, wrong password → 401. |
| 9 | Admin login and authorization | **PASS** | Admin login → Admin Panel. Customer → `/admin` page redirects to `/dashboard`; customer → admin APIs → 403; no login → 401; forged token → 401; token after logout → 401. |
| 10 | Complete booking process | **PASS** | UI guest booking: empty form → 10 field errors; return-before-pickup and bad mobile caught; valid submit → "Booking Submitted" with ID SCR-0006 → Track page shows PENDING. Logged-in booking from dashboard (details pre-filled) → appears in My Bookings. |
| 11 | Bookings actually saved in MySQL | **PASS** | `SELECT` on `bookings` showed the UI booking row (car_id, user_id NULL for guest / set for customer, times, travel type, requirements, status). |
| 12 | Contact form submission | **PASS** | UI: invalid email caught; valid message → success; row in `contact_messages`; visible in Admin → Messages; mark read works. |
| 13 | Testimonial submission and display | **PASS** | UI: missing rating/short text caught; submitted review hidden until approved; after Admin → Approve it shows on the Testimonials page with stars and average. |
| 14 | All admin dashboard operations | **PASS** | Statistics; bookings confirm (with remark) / reject / filter; cars add (validation) / edit / delete; deleting a car with bookings blocked with a clear message; customers list with booking counts; messages read/unread/delete; testimonials approve/hide/delete. |
| 15 | Mobile responsiveness | **PASS** | 375 px and 768 px: no horizontal scrolling on Home, About, Services, Testimonials, Contact, Track, Login, Register, Admin; hamburger menu; booking modal and dashboards usable; tables scroll inside their card. Done in browser emulation (see section C). |
| 16 | Browser console errors | **PASS** | No JavaScript errors. Only entries: HTTP 401 and 409 logged by the browser for the deliberate negative tests (wrong password, delete car with bookings). React Router future-flag warnings were fixed. |
| 17 | Backend logs for exceptions | **PASS** | 0 WARN / 0 ERROR lines in the backend log after all API and UI tests. |
| 18 | Fix discovered errors and retest | **PASS** | See section D – every issue found was fixed and retested. |

## B. Automated tests

| Suite | Result |
|-------|--------|
| JUnit (`mvn test`): `BookingServiceTest` (13), `AuthServiceTest` (3), `JwtUtilTest` (4) | **PASS – 20/20** |
| End-to-end API script (80 checks, real MySQL) – run twice, second time on a freshly created database with the default configuration (`mvn spring-boot:run`) | **PASS – 80/80** |
| Postman collection – every request sent in order with a small runner, expected status codes compared | **PASS – 44/44** |

Highlights of the 80 API checks: car CRUD & validation; booking a MAINTENANCE car → 400; past pickup → 400;
return before pickup → 400; unknown car → 404; overlapping booking with a CONFIRMED one → 409;
confirming an overlapping booking → 409; customer B cannot view/cancel customer A's booking → 403;
customer cannot cancel a guest booking → 403; final statuses cannot change → 400; PENDING → COMPLETED → 400;
track with wrong email → 404; dashboard counts; profile & password change; logout invalidates the token.

## C. Not run / limits (please check on your side)

| Item | Result | Why / how to check |
|------|--------|--------------------|
| Postman collection inside the Postman app | **NOT RUN** | Postman is not installed here. The same requests were executed by a script (44/44). In Postman: Import → Run collection. |
| Your own MySQL installation (e.g. MySQL80 service, your password) | **NOT RUN** | Tested with a portable MySQL 8.4.3. Run `database.sql`, set your password in `application.properties`, start the backend. |
| Real phones / tablets, Firefox, Safari | **NOT RUN** | Responsiveness checked by viewport emulation in a Chromium browser only. |
| Match against your six reference screenshots | **NOT RUN** | The screenshots were not available to me – only the ZIP was. The existing Phase 1-2 design (navbar, hero, car cards, booking modal, contact section, footer) was kept, and new pages reuse the same colours, fonts and components. |

## D. Problems found during testing and fixed

1. **Backend would not start on this Windows machine** – `Unable to establish loopback connection`. Cause: Windows blocks Java's internal Unix-socket files inside `%TEMP%`. Fix: `SiddhiCarRentalApplication.main()` points them to `%USERPROFILE%\.siddhi-car-rental`. Retested: starts normally with `mvn spring-boot:run`.
2. **Date bug from Phase 2** – booking modal used `toISOString()` for "today", which gives the UTC date (wrong date in India before 5:30 AM). Fixed with local date; also blocks a pickup time that already passed today.
3. **Phase 2 success message without saved data was impossible to verify** – there was no bookings API. Now the success screen is shown only for HTTP 201 and displays the saved booking returned by the server.
4. Welcome message after registration did not show (redirect raced the navigation) – fixed and retested.
5. "Go to My Bookings" opened the wrong dashboard tab when already on the dashboard – fixed and retested.
6. Logout from a dashboard landed on the Login page instead of Home – fixed.
7. Review form could lose the star rating when fields changed quickly (stale React state) – fixed with functional state updates in the review and contact forms; retested.
8. Navbar wrapped onto two lines and the active "Admin Panel" button lost its colour at laptop widths – fixed with responsive CSS; retested.
9. React Router v7 warnings in the console – removed by opting in to the future flags.
10. Vite CJS deprecation warning during build – fixed (`"type": "module"`).
11. `npm` could not start esbuild in this session because the session folder path is longer than 260 characters – environment issue only; README tells you to keep the project in a short path such as `C:\Projects\`.

## E. Retest after changing the business contact details (19 Nov 2026)

New details: email/admin login `rutikaparekar@gmail.com`, phone `9022893153`, admin password `Parekar@123`
(changed in `siteConfig.js`, `application.properties`, `database.sql`, READMEs and the Postman collection).

| Check | Result |
|-------|--------|
| `database.sql` run on a database that still had the old demo admin → admin changed to the new email/phone/password (no second admin); run again → still 1 admin | **PASS** |
| `mvn test` | **PASS – 20/20** |
| API script with the new admin login | **PASS – 80/80** |
| Postman collection (regenerated) | **PASS – 44/44** |
| Login API: new admin → 200 ADMIN; old `admin@siddhicars.local / Admin@123` → 401 | **PASS** |
| Website: Contact page/footer show the new phone and email (`tel:` / `mailto:` links); old phone/email no longer on the page; admin login in the UI opens the Admin Dashboard | **PASS** |
