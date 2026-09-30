-- ========================================================
-- Guidelya / Xavonic Aesthetics Database Schema
-- Compatible with phpMyAdmin / MySQL / MariaDB (XAMPP / WAMP)
-- ========================================================

-- 1. Create Database
CREATE DATABASE IF NOT EXISTS `guidelya_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `guidelya_db`;

-- 2. Create Admins Table
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'Super Admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_login` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Create Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) UNIQUE NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `original_price` DECIMAL(10, 2) NULL,
  `stock` INT DEFAULT 0,
  `sku` VARCHAR(100) UNIQUE NULL,
  `status` ENUM('active', 'draft', 'archived') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Create Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) UNIQUE NOT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_email` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(20) NULL,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'UPI',
  `payment_status` ENUM('Pending', 'Paid', 'Failed', 'Refunded') DEFAULT 'Pending',
  `order_status` ENUM('Processing', 'In Transit', 'Delivered', 'Cancelled') DEFAULT 'Processing',
  `shipping_address` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Insert Default Admin (Password: admin123 -> Bcrypt Hashed)
INSERT INTO `admins` (`name`, `email`, `password`, `role`)
VALUES (
  'Master Admin',
  'admin@xavonic.com',
  '$2a$10$iM.o50bZ4qGgP6wKzEZZCe2v6FhVlqJpW9dDq7k.YdG8.u9yH6X9S',
  'Super Admin'
)
ON DUPLICATE KEY UPDATE `email`=`email`;
