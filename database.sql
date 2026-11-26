-- =====================================================================
--  Siddhi Car Rental Service - MySQL database
--  Run once:   mysql -u root -p < database.sql
--  (or open it in MySQL Workbench and press the lightning icon)
--  Safe to run again: it never deletes existing data.
-- =====================================================================
CREATE DATABASE IF NOT EXISTS siddhi_car_rental
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE siddhi_car_rental;

-- ---------------------------------------------------------------------
-- users : customers and admins. Passwords are stored as BCrypt hashes.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name   VARCHAR(100) NOT NULL,
  email       VARCHAR(120) NOT NULL,
  phone       VARCHAR(15)  NOT NULL,
  password    VARCHAR(100) NOT NULL,
  role        VARCHAR(20)  NOT NULL DEFAULT 'CUSTOMER',
  created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT uk_users_email UNIQUE (email),
  CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'CUSTOMER'))
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- cars : the fleet shown on the website
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cars (
  id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
  car_name            VARCHAR(100) NOT NULL,
  category            VARCHAR(50)  NOT NULL,
  seating_capacity    INT          NOT NULL,
  fuel_type           VARCHAR(30)  NOT NULL,
  transmission        VARCHAR(30)  NOT NULL,
  image_url           VARCHAR(255),
  description         VARCHAR(500),
  availability_status VARCHAR(20)  NOT NULL DEFAULT 'AVAILABLE',
  CONSTRAINT chk_cars_status CHECK (availability_status IN ('AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE'))
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- bookings : one row per booking request
--   car_id  -> cars.id   (a car with bookings cannot be deleted)
--   user_id -> users.id  (NULL for guest bookings made without login)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
  car_id                  BIGINT       NOT NULL,
  user_id                 BIGINT       NULL,
  pickup_date             DATE         NOT NULL,
  pickup_time             TIME         NOT NULL,
  pickup_location         VARCHAR(150) NOT NULL,
  return_date             DATE         NOT NULL,
  return_time             TIME         NOT NULL,
  return_location         VARCHAR(150) NOT NULL,
  customer_name           VARCHAR(100) NOT NULL,
  phone                   VARCHAR(15)  NOT NULL,
  email                   VARCHAR(120) NOT NULL,
  travel_type             VARCHAR(50)  NOT NULL,
  additional_requirements VARCHAR(1000),
  status                  VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
  admin_remarks           VARCHAR(500),
  created_at              DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at              DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_bookings_car  FOREIGN KEY (car_id)  REFERENCES cars (id)  ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT chk_bookings_status CHECK (status IN ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED')),
  INDEX idx_bookings_status (status),
  INDEX idx_bookings_email (email)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- contact_messages : "Contact Us" form submissions
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(120)  NOT NULL,
  message     VARCHAR(2000) NOT NULL,
  is_read     BIT(1)        NOT NULL DEFAULT b'0',
  created_at  DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- testimonials : customer reviews. Shown on the website only after admin approval.
--   user_id -> users.id (NULL when submitted without login)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS testimonials (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id        BIGINT        NULL,
  customer_name  VARCHAR(100)  NOT NULL,
  rating         INT           NOT NULL,
  message        VARCHAR(1000) NOT NULL,
  approved       BIT(1)        NOT NULL DEFAULT b'0',
  created_at     DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_testimonials_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT chk_testimonials_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Sample cars (same fleet as Phase 1). Images live in the frontend's public/cars/ folder.
-- INSERT IGNORE keeps existing rows if you run the script again.
-- ---------------------------------------------------------------------
INSERT IGNORE INTO cars (id, car_name, category, seating_capacity, fuel_type, transmission, image_url, description, availability_status) VALUES
(1, 'Ertiga',        'SUV',    7, 'Petrol', 'Automatic', '/cars/ertiga.jpg', 'Comfortable 7 seater for family trips',  'AVAILABLE'),
(2, 'Innova',        'Innova', 7, 'Petrol', 'Automatic', '/cars/innova.jpg', 'Spacious 7 seater for long journeys',     'AVAILABLE'),
(3, 'Innova Crysta', 'Crysta', 5, 'Petrol', 'Automatic', '/cars/crysta.jpg', 'Premium comfort for outstation travel',  'AVAILABLE');

-- ---------------------------------------------------------------------
-- Admin account
--   email:    rutikaparekar@gmail.com
--   password: Parekar@123      (BCrypt hash below)
-- The backend also creates this account automatically on start-up if no admin exists.
-- ---------------------------------------------------------------------
-- If this database was created with the older demo admin (admin@siddhicars.local),
-- change that account to the new details instead of adding a second admin.
UPDATE users
   SET email = 'rutikaparekar@gmail.com', phone = '9022893153',
       password = '$2a$10$QQaJx/y0BTi5dmcfPpQqQegXEYXjEzPzNZAlh2AufHdOuHBAeDZDS'
 WHERE email = 'admin@siddhicars.local' AND role = 'ADMIN'
   AND NOT EXISTS (SELECT 1 FROM (SELECT id FROM users WHERE email = 'rutikaparekar@gmail.com') AS taken);

INSERT IGNORE INTO users (full_name, email, phone, password, role) VALUES
('Siddhi Admin', 'rutikaparekar@gmail.com', '9022893153', '$2a$10$QQaJx/y0BTi5dmcfPpQqQegXEYXjEzPzNZAlh2AufHdOuHBAeDZDS', 'ADMIN');
