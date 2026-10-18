-- RAGEX COMPLETE DATABASE BACKUP
-- Created at: 2026-10-18T12:16:25.988Z

CREATE DATABASE IF NOT EXISTS `ragex_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ragex_db`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `store_settings`;
CREATE TABLE `store_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=1220 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (1, 'whatsapp_mode', 'test', '2026-10-01 01:37:07.000');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (2, 'whatsapp_meta_token', '', '2026-10-01 01:37:07.000');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (3, 'whatsapp_phone_number_id', '', '2026-10-01 01:37:07.000');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (4, 'whatsapp_waba_id', '', '2026-10-01 01:37:07.000');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (5, 'whatsapp_template_name', 'ragex_otp_auth', '2026-10-18 17:39:07.000');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (26, 'smtp_mode', 'test', '2026-10-01 01:42:28.000');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (27, 'smtp_host', 'smtp.gmail.com', '2026-10-01 01:42:28.000');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (28, 'smtp_port', '465', '2026-10-01 01:42:28.000');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (29, 'smtp_secure', 'true', '2026-10-01 01:42:28.000');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (30, 'smtp_user', '', '2026-10-01 01:42:28.000');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (31, 'smtp_pass', '', '2026-10-01 01:42:28.000');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (32, 'smtp_sender_name', 'RageX Athletics', '2026-10-18 17:39:07.000');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (304, 'cloudinary_cloud_name', 'fwlidd7t', '2026-10-01 02:39:31.000');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (305, 'cloudinary_api_key', '887531852538712', '2026-10-01 02:39:31.000');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (306, 'cloudinary_api_secret', 'lkB-KXtVa7j9Zi8pzhTn1VhT5xU', '2026-10-01 02:39:31.000');
INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES (829, 'google_maps_api_key', 'AIzaSyAWnFjD1hsIsyYB7nQs_fAUd2BVuziu0xE', '2026-10-01 23:30:29.000');

DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'Super Admin',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `admins` (`id`, `name`, `email`, `password`, `role`, `created_at`, `last_login`) VALUES (1, 'Master Admin', 'admin@xavonic.com', '$2b$10$19Q0zDXBEASnvzvYa8xm..6AiKHMspjlAsaHqKXsvODVeFgUQhSru', 'Super Admin', '2026-10-01 01:27:29.000', '2026-10-01 01:27:41.000');

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` varchar(50) DEFAULT NULL,
  `name` varchar(100) DEFAULT 'Athlete',
  `phone` varchar(20) DEFAULT NULL,
  `phone_verified` tinyint(1) DEFAULT '0',
  `email` varchar(150) DEFAULT NULL,
  `email_verified` tinyint(1) DEFAULT '0',
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'customer',
  `gender` varchar(20) DEFAULT 'Male',
  `tier` varchar(50) DEFAULT 'VIP Athlete Club',
  `points` int DEFAULT '100',
  `chest_size` varchar(20) DEFAULT 'L (42")',
  `lower_size` varchar(20) DEFAULT 'M (32")',
  `addresses_json` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `customer_id` (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `parent_id` int DEFAULT NULL,
  `level` enum('main','sub','item_type') DEFAULT 'main',
  `gender_target` enum('Men','Women','Unisex') DEFAULT 'Men',
  `image_url` varchar(500) DEFAULT NULL,
  `show_title_overlay` tinyint(1) DEFAULT '1',
  `subtitle` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `show_in_dual_section` tinyint(1) DEFAULT '0',
  `kicker_title` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT '',
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `stock` int DEFAULT '0',
  `size_stock_json` json DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `status` enum('active','draft','archived') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `category_slug` varchar(150) NOT NULL DEFAULT '',
  `category_name` varchar(150) NOT NULL DEFAULT '',
  `gender_target` enum('Men','Women','Unisex') DEFAULT 'Men',
  `discount_label` varchar(50) DEFAULT '',
  `in_stock` tinyint(1) DEFAULT '1',
  `rating` decimal(3,2) DEFAULT '4.90',
  `reviews_count` int DEFAULT '0',
  `sizes_json` json DEFAULT NULL,
  `colors_json` json DEFAULT NULL,
  `features_json` json DEFAULT NULL,
  `fabric` varchar(255) DEFAULT '',
  `fit` varchar(255) DEFAULT '',
  `model_stats` varchar(255) DEFAULT '',
  `description` text,
  `care_instructions` text,
  `category_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `sku` (`sku`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `user_id` int DEFAULT NULL,
  `customer_id` varchar(50) DEFAULT NULL,
  `customer_name` varchar(150) NOT NULL,
  `customer_email` varchar(150) NOT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `items_json` json DEFAULT NULL,
  `items_count` int DEFAULT '1',
  `subtotal` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `coupon_code` varchar(50) DEFAULT NULL,
  `shipping_fee` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT 'UPI',
  `payment_status` enum('Pending','Paid','Failed','Refunded') DEFAULT 'Pending',
  `order_status` enum('Processing','In Transit','Delivered','Cancelled') DEFAULT 'Processing',
  `shipping_address` text,
  `tracking_number` varchar(100) DEFAULT NULL,
  `courier_partner` varchar(100) DEFAULT 'Bluedart Express',
  `delivery_notes` text,
  `cancellation_reason` varchar(255) DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `return_status` enum('None','Requested','Approved','Rejected','Item Picked Up','Item Received','Completed') DEFAULT 'None',
  `return_reason` varchar(255) DEFAULT NULL,
  `return_comment` text,
  `return_requested_at` timestamp NULL DEFAULT NULL,
  `refund_status` enum('None','Initiated','Processing','Refunded','Failed') DEFAULT 'None',
  `refund_amount` decimal(10,2) DEFAULT '0.00',
  `refund_method` varchar(50) DEFAULT NULL,
  `refund_transaction_id` varchar(100) DEFAULT NULL,
  `refund_notes` text,
  `refunded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `orders` (`id`, `order_number`, `user_id`, `customer_id`, `customer_name`, `customer_email`, `customer_phone`, `items_json`, `items_count`, `subtotal`, `discount_amount`, `coupon_code`, `shipping_fee`, `total_amount`, `payment_method`, `payment_status`, `order_status`, `shipping_address`, `tracking_number`, `courier_partner`, `delivery_notes`, `cancellation_reason`, `cancelled_at`, `return_status`, `return_reason`, `return_comment`, `return_requested_at`, `refund_status`, `refund_amount`, `refund_method`, `refund_transaction_id`, `refund_notes`, `refunded_at`, `created_at`) VALUES (1, 'ORD-36016861', NULL, NULL, 'Test Customer', '', '9876543210', '[{\"id\":1,\"size\":\"M\",\"slug\":\"\",\"color\":\"Standard\",\"image\":\"\",\"price\":999,\"title\":\"Tee\",\"quantity\":1,\"lineTotal\":999,\"originalPrice\":999}]', 1, '999.00', '0.00', NULL, '0.00', '999.00', 'COD', 'Pending', 'Processing', '{\"addressLine\":\"Sector 18\",\"city\":\"Gurugram\",\"state\":\"Haryana\",\"pincode\":\"122002\"}', 'XAV-14858674', 'Bluedart Express', NULL, NULL, NULL, 'None', NULL, NULL, NULL, 'None', '0.00', NULL, NULL, NULL, NULL, '2026-10-01 23:33:33.000');
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `customer_id`, `customer_name`, `customer_email`, `customer_phone`, `items_json`, `items_count`, `subtotal`, `discount_amount`, `coupon_code`, `shipping_fee`, `total_amount`, `payment_method`, `payment_status`, `order_status`, `shipping_address`, `tracking_number`, `courier_partner`, `delivery_notes`, `cancellation_reason`, `cancelled_at`, `return_status`, `return_reason`, `return_comment`, `return_requested_at`, `refund_status`, `refund_amount`, `refund_method`, `refund_transaction_id`, `refund_notes`, `refunded_at`, `created_at`) VALUES (2, 'ORD-43329016', 1, 'GDL-00001', 'Nikhil singh', 'abcd@gmail.com', '917317788940', '[{\"id\":\"16\",\"size\":\"M\",\"slug\":\"\",\"color\":\"Charcoal Black\",\"image\":\"https://res.cloudinary.com/fwlidd7t/image/upload/v1790805024/guidelya/products/h9enotzzgh15wdjjjiwx.jpg\",\"price\":1199,\"title\":\"Curved Drop Cut Athletic Performance Tee\",\"quantity\":1,\"lineTotal\":1199,\"originalPrice\":1699},{\"id\":\"17\",\"size\":\"M\",\"slug\":\"\",\"color\":\"Acid Charcoal\",\"image\":\"https://res.cloudinary.com/fwlidd7t/image/upload/v1790805013/guidelya/products/gqwngjz1uq8dzmmcdbdf.jpg\",\"price\":1499,\"title\":\"Acid Wash Charcoal Drop-Shoulder Tee\",\"quantity\":1,\"lineTotal\":1499,\"originalPrice\":2199},{\"id\":\"18\",\"size\":\"L\",\"slug\":\"\",\"color\":\"Deep Grey\",\"image\":\"https://res.cloudinary.com/fwlidd7t/image/upload/v1790805022/guidelya/products/hgancqvvcmhneb3pmf8l.jpg\",\"price\":1599,\"title\":\"Athletic Lightweight Trackpants\",\"quantity\":1,\"lineTotal\":1599,\"originalPrice\":2299}]', 3, '4297.00', '430.00', 'AUTO10', '0.00', '3917.00', 'Cash on Delivery (COD)', 'Pending', 'Processing', '{\"id\":\"addr-1790877713563\",\"type\":\"Home (Noida)\",\"name\":\"Nikhil singh\",\"addressLine\":\"b1402 , apex\",\"city\":\"Noida\",\"state\":\"Uttar Pradesh\",\"pincode\":\"201316\",\"phone\":\"917317788940\",\"latitude\":28.590990505252336,\"longitude\":77.38441455985115,\"isDefault\":false}', 'XAV-11012103', 'Bluedart Express', NULL, NULL, NULL, 'None', NULL, NULL, NULL, 'None', '0.00', NULL, NULL, NULL, NULL, '2026-10-01 23:33:44.000');
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `customer_id`, `customer_name`, `customer_email`, `customer_phone`, `items_json`, `items_count`, `subtotal`, `discount_amount`, `coupon_code`, `shipping_fee`, `total_amount`, `payment_method`, `payment_status`, `order_status`, `shipping_address`, `tracking_number`, `courier_partner`, `delivery_notes`, `cancellation_reason`, `cancelled_at`, `return_status`, `return_reason`, `return_comment`, `return_requested_at`, `refund_status`, `refund_amount`, `refund_method`, `refund_transaction_id`, `refund_notes`, `refunded_at`, `created_at`) VALUES (3, 'ORD-26143158', 1, 'GDL-00001', 'Nikhil singh', 'abcd@gmail.com', '917317788940', '[{\"id\":\"16\",\"size\":\"M\",\"slug\":\"\",\"color\":\"Charcoal Black\",\"image\":\"https://res.cloudinary.com/fwlidd7t/image/upload/v1790805024/guidelya/products/h9enotzzgh15wdjjjiwx.jpg\",\"price\":1199,\"title\":\"Curved Drop Cut Athletic Performance Tee\",\"quantity\":1,\"lineTotal\":1199,\"originalPrice\":1699},{\"id\":\"17\",\"size\":\"M\",\"slug\":\"\",\"color\":\"Acid Charcoal\",\"image\":\"https://res.cloudinary.com/fwlidd7t/image/upload/v1790805013/guidelya/products/gqwngjz1uq8dzmmcdbdf.jpg\",\"price\":1499,\"title\":\"Acid Wash Charcoal Drop-Shoulder Tee\",\"quantity\":1,\"lineTotal\":1499,\"originalPrice\":2199},{\"id\":\"18\",\"size\":\"L\",\"slug\":\"\",\"color\":\"Deep Grey\",\"image\":\"https://res.cloudinary.com/fwlidd7t/image/upload/v1790805022/guidelya/products/hgancqvvcmhneb3pmf8l.jpg\",\"price\":1599,\"title\":\"Athletic Lightweight Trackpants\",\"quantity\":1,\"lineTotal\":1599,\"originalPrice\":2299}]', 3, '4297.00', '430.00', 'AUTO10', '0.00', '3917.00', 'Cash on Delivery (COD)', 'Pending', 'Processing', '{\"id\":\"addr-1790877713563\",\"type\":\"Home (Noida)\",\"name\":\"Nikhil singh\",\"addressLine\":\"b1402 , apex\",\"city\":\"Noida\",\"state\":\"Uttar Pradesh\",\"pincode\":\"201316\",\"phone\":\"917317788940\",\"latitude\":28.590990505252336,\"longitude\":77.38441455985115,\"isDefault\":false}', 'XAV-35579095', 'Bluedart Express', NULL, NULL, NULL, 'None', NULL, NULL, NULL, 'None', '0.00', NULL, NULL, NULL, NULL, '2026-10-01 23:34:02.000');
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `customer_id`, `customer_name`, `customer_email`, `customer_phone`, `items_json`, `items_count`, `subtotal`, `discount_amount`, `coupon_code`, `shipping_fee`, `total_amount`, `payment_method`, `payment_status`, `order_status`, `shipping_address`, `tracking_number`, `courier_partner`, `delivery_notes`, `cancellation_reason`, `cancelled_at`, `return_status`, `return_reason`, `return_comment`, `return_requested_at`, `refund_status`, `refund_amount`, `refund_method`, `refund_transaction_id`, `refund_notes`, `refunded_at`, `created_at`) VALUES (4, 'ORD-59868191', 1, 'GDL-00001', 'Nikhil singh', 'abcd@gmail.com', '917317788940', '[{\"id\":\"16\",\"size\":\"M\",\"slug\":\"\",\"color\":\"Charcoal Black\",\"image\":\"https://res.cloudinary.com/fwlidd7t/image/upload/v1790805024/guidelya/products/h9enotzzgh15wdjjjiwx.jpg\",\"price\":1199,\"title\":\"Curved Drop Cut Athletic Performance Tee\",\"quantity\":1,\"lineTotal\":1199,\"originalPrice\":1699},{\"id\":\"17\",\"size\":\"M\",\"slug\":\"\",\"color\":\"Acid Charcoal\",\"image\":\"https://res.cloudinary.com/fwlidd7t/image/upload/v1790805013/guidelya/products/gqwngjz1uq8dzmmcdbdf.jpg\",\"price\":1499,\"title\":\"Acid Wash Charcoal Drop-Shoulder Tee\",\"quantity\":1,\"lineTotal\":1499,\"originalPrice\":2199},{\"id\":\"18\",\"size\":\"L\",\"slug\":\"\",\"color\":\"Deep Grey\",\"image\":\"https://res.cloudinary.com/fwlidd7t/image/upload/v1790805022/guidelya/products/hgancqvvcmhneb3pmf8l.jpg\",\"price\":1599,\"title\":\"Athletic Lightweight Trackpants\",\"quantity\":1,\"lineTotal\":1599,\"originalPrice\":2299}]', 3, '4297.00', '430.00', 'AUTO10', '0.00', '3917.00', 'Cash on Delivery (COD)', 'Pending', 'Processing', '{\"id\":\"addr-1790877713563\",\"type\":\"Home (Noida)\",\"name\":\"Nikhil singh\",\"addressLine\":\"b1402 , apex\",\"city\":\"Noida\",\"state\":\"Uttar Pradesh\",\"pincode\":\"201316\",\"phone\":\"917317788940\",\"latitude\":28.590990505252336,\"longitude\":77.38441455985115,\"isDefault\":false}', 'XAV-90214812', 'Bluedart Express', NULL, NULL, NULL, 'None', NULL, NULL, NULL, 'None', '0.00', NULL, NULL, NULL, NULL, '2026-10-01 23:34:25.000');
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `customer_id`, `customer_name`, `customer_email`, `customer_phone`, `items_json`, `items_count`, `subtotal`, `discount_amount`, `coupon_code`, `shipping_fee`, `total_amount`, `payment_method`, `payment_status`, `order_status`, `shipping_address`, `tracking_number`, `courier_partner`, `delivery_notes`, `cancellation_reason`, `cancelled_at`, `return_status`, `return_reason`, `return_comment`, `return_requested_at`, `refund_status`, `refund_amount`, `refund_method`, `refund_transaction_id`, `refund_notes`, `refunded_at`, `created_at`) VALUES (5, 'ORD-32145430', 1, 'GDL-00001', 'Nikhil singh', 'abcd@gmail.com', '917317788940', '[{\"id\":\"16\",\"size\":\"M\",\"slug\":\"\",\"color\":\"Charcoal Black\",\"image\":\"https://res.cloudinary.com/fwlidd7t/image/upload/v1790805024/guidelya/products/h9enotzzgh15wdjjjiwx.jpg\",\"price\":1199,\"title\":\"Curved Drop Cut Athletic Performance Tee\",\"quantity\":1,\"lineTotal\":1199,\"originalPrice\":1699},{\"id\":\"17\",\"size\":\"M\",\"slug\":\"\",\"color\":\"Acid Charcoal\",\"image\":\"https://res.cloudinary.com/fwlidd7t/image/upload/v1790805013/guidelya/products/gqwngjz1uq8dzmmcdbdf.jpg\",\"price\":1499,\"title\":\"Acid Wash Charcoal Drop-Shoulder Tee\",\"quantity\":1,\"lineTotal\":1499,\"originalPrice\":2199},{\"id\":\"18\",\"size\":\"L\",\"slug\":\"\",\"color\":\"Deep Grey\",\"image\":\"https://res.cloudinary.com/fwlidd7t/image/upload/v1790805022/guidelya/products/hgancqvvcmhneb3pmf8l.jpg\",\"price\":1599,\"title\":\"Athletic Lightweight Trackpants\",\"quantity\":1,\"lineTotal\":1599,\"originalPrice\":2299}]', 3, '4297.00', '430.00', 'AUTO10', '0.00', '3917.00', 'Cash on Delivery (COD)', 'Pending', 'Processing', '{\"id\":\"addr-1790877713563\",\"type\":\"Home (Noida)\",\"name\":\"Nikhil singh\",\"addressLine\":\"b1402 , apex\",\"city\":\"Noida\",\"state\":\"Uttar Pradesh\",\"pincode\":\"201316\",\"phone\":\"917317788940\",\"latitude\":28.590990505252336,\"longitude\":77.38441455985115,\"isDefault\":false}', 'XAV-30863505', 'Bluedart Express', NULL, NULL, NULL, 'None', NULL, NULL, NULL, 'None', '0.00', NULL, NULL, NULL, NULL, '2026-10-01 23:35:23.000');
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `customer_id`, `customer_name`, `customer_email`, `customer_phone`, `items_json`, `items_count`, `subtotal`, `discount_amount`, `coupon_code`, `shipping_fee`, `total_amount`, `payment_method`, `payment_status`, `order_status`, `shipping_address`, `tracking_number`, `courier_partner`, `delivery_notes`, `cancellation_reason`, `cancelled_at`, `return_status`, `return_reason`, `return_comment`, `return_requested_at`, `refund_status`, `refund_amount`, `refund_method`, `refund_transaction_id`, `refund_notes`, `refunded_at`, `created_at`) VALUES (6, 'ORD-72797733', 1, 'GDL-00001', 'Nikhil singh', 'abcd@gmail.com', '917317788940', '[{\"id\":\"16\",\"size\":\"M\",\"slug\":\"\",\"color\":\"Charcoal Black\",\"image\":\"https://res.cloudinary.com/fwlidd7t/image/upload/v1790805024/guidelya/products/h9enotzzgh15wdjjjiwx.jpg\",\"price\":1199,\"title\":\"Curved Drop Cut Athletic Performance Tee\",\"quantity\":1,\"lineTotal\":1199,\"originalPrice\":1699},{\"id\":\"17\",\"size\":\"M\",\"slug\":\"\",\"color\":\"Acid Charcoal\",\"image\":\"https://res.cloudinary.com/fwlidd7t/image/upload/v1790805013/guidelya/products/gqwngjz1uq8dzmmcdbdf.jpg\",\"price\":1499,\"title\":\"Acid Wash Charcoal Drop-Shoulder Tee\",\"quantity\":1,\"lineTotal\":1499,\"originalPrice\":2199},{\"id\":\"18\",\"size\":\"L\",\"slug\":\"\",\"color\":\"Deep Grey\",\"image\":\"https://res.cloudinary.com/fwlidd7t/image/upload/v1790805022/guidelya/products/hgancqvvcmhneb3pmf8l.jpg\",\"price\":1599,\"title\":\"Athletic Lightweight Trackpants\",\"quantity\":1,\"lineTotal\":1599,\"originalPrice\":2299}]', 3, '4297.00', '430.00', 'AUTO10', '0.00', '3917.00', 'Cash on Delivery (COD)', 'Pending', 'Processing', '{\"id\":\"addr-1790877713563\",\"type\":\"Home (Noida)\",\"name\":\"Nikhil singh\",\"addressLine\":\"b1402 , apex\",\"city\":\"Noida\",\"state\":\"Uttar Pradesh\",\"pincode\":\"201316\",\"phone\":\"917317788940\",\"latitude\":28.590990505252336,\"longitude\":77.38441455985115,\"isDefault\":false}', 'XAV-27026681', 'Bluedart Express', NULL, NULL, NULL, 'None', NULL, NULL, NULL, 'None', '0.00', NULL, NULL, NULL, NULL, '2026-10-01 23:37:27.000');
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `customer_id`, `customer_name`, `customer_email`, `customer_phone`, `items_json`, `items_count`, `subtotal`, `discount_amount`, `coupon_code`, `shipping_fee`, `total_amount`, `payment_method`, `payment_status`, `order_status`, `shipping_address`, `tracking_number`, `courier_partner`, `delivery_notes`, `cancellation_reason`, `cancelled_at`, `return_status`, `return_reason`, `return_comment`, `return_requested_at`, `refund_status`, `refund_amount`, `refund_method`, `refund_transaction_id`, `refund_notes`, `refunded_at`, `created_at`) VALUES (7, 'ORD-46548137', 1, 'GDL-00001', 'Nikhil singh', 'abcd@gmail.com', '917317788940', '[{\"id\":\"14\",\"size\":\"M\",\"slug\":\"\",\"color\":\"Onyx Black\",\"image\":\"https://res.cloudinary.com/fwlidd7t/image/upload/v1790805021/guidelya/products/xcrkibtuhgweokp0tkot.jpg\",\"price\":1599,\"title\":\"French Terry Relaxed Aesthetic Gym Joggers\",\"quantity\":1,\"lineTotal\":1599,\"originalPrice\":2299}]', 1, '1599.00', '160.00', 'AUTO10', '0.00', '1489.00', 'Cash on Delivery (COD)', 'Pending', 'Processing', '{\"id\":\"addr-1790877713563\",\"type\":\"Home (Noida)\",\"name\":\"Nikhil singh\",\"addressLine\":\"b1402 , apex\",\"city\":\"Noida\",\"state\":\"Uttar Pradesh\",\"pincode\":\"201316\",\"phone\":\"917317788940\",\"latitude\":28.590990505252336,\"longitude\":77.38441455985115,\"isDefault\":false}', 'XAV-32861408', 'Bluedart Express', NULL, NULL, NULL, 'None', NULL, NULL, NULL, 'None', '0.00', NULL, NULL, NULL, NULL, '2026-10-01 23:42:54.000');
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `customer_id`, `customer_name`, `customer_email`, `customer_phone`, `items_json`, `items_count`, `subtotal`, `discount_amount`, `coupon_code`, `shipping_fee`, `total_amount`, `payment_method`, `payment_status`, `order_status`, `shipping_address`, `tracking_number`, `courier_partner`, `delivery_notes`, `cancellation_reason`, `cancelled_at`, `return_status`, `return_reason`, `return_comment`, `return_requested_at`, `refund_status`, `refund_amount`, `refund_method`, `refund_transaction_id`, `refund_notes`, `refunded_at`, `created_at`) VALUES (8, 'ORD-00016540', 1, 'GDL-00001', 'Nikhil singh', 'abcd@gmail.com', '917317788940', '[{\"id\":\"14\",\"size\":\"M\",\"slug\":\"\",\"color\":\"Onyx Black\",\"image\":\"https://res.cloudinary.com/fwlidd7t/image/upload/v1790805021/guidelya/products/xcrkibtuhgweokp0tkot.jpg\",\"price\":1599,\"title\":\"French Terry Relaxed Aesthetic Gym Joggers\",\"quantity\":1,\"lineTotal\":1599,\"originalPrice\":2299}]', 1, '1599.00', '160.00', 'AUTO10', '0.00', '1489.00', 'Cash on Delivery (COD)', 'Pending', 'Cancelled', '{\"id\":\"addr-1790877713563\",\"type\":\"Home (Noida)\",\"name\":\"Nikhil singh\",\"addressLine\":\"b1402 , apex\",\"city\":\"Noida\",\"state\":\"Uttar Pradesh\",\"pincode\":\"201316\",\"phone\":\"917317788940\",\"latitude\":28.590990505252336,\"longitude\":77.38441455985115,\"isDefault\":false}', 'XAV-88533921', 'Bluedart Express', NULL, 'Found better price / offer', '2026-10-02 00:21:44.000', 'None', NULL, NULL, NULL, 'None', '0.00', NULL, NULL, NULL, NULL, '2026-10-01 23:43:40.000');
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `customer_id`, `customer_name`, `customer_email`, `customer_phone`, `items_json`, `items_count`, `subtotal`, `discount_amount`, `coupon_code`, `shipping_fee`, `total_amount`, `payment_method`, `payment_status`, `order_status`, `shipping_address`, `tracking_number`, `courier_partner`, `delivery_notes`, `cancellation_reason`, `cancelled_at`, `return_status`, `return_reason`, `return_comment`, `return_requested_at`, `refund_status`, `refund_amount`, `refund_method`, `refund_transaction_id`, `refund_notes`, `refunded_at`, `created_at`) VALUES (9, 'ORD-58582319', NULL, 'GDL-9842', 'Nikhil Sharma', '', '+91 98765 43210', '[{\"id\":\"prod-7\",\"size\":\"L\",\"slug\":\"\",\"color\":\"Charcoal Black\",\"image\":\"/src/assets/hero_oversized.jpg\",\"price\":1399,\"title\":\"Vintage Distressed Heavyweight Pump Cover\",\"quantity\":1,\"lineTotal\":1399,\"originalPrice\":1999},{\"id\":\"19\",\"size\":\"L\",\"slug\":\"\",\"color\":\"Combat Black\",\"image\":\"https://res.cloudinary.com/fwlidd7t/image/upload/v1790805022/guidelya/products/hgancqvvcmhneb3pmf8l.jpg\",\"price\":1799,\"title\":\"Tactical Multi-Pocket Gym Cargo Lowers\",\"quantity\":1,\"lineTotal\":1799,\"originalPrice\":2599}]', 2, '3198.00', '608.00', 'AUTO10', '0.00', '2590.00', 'UPI (PHONEPE)', 'Paid', 'Processing', '{\"id\":\"addr-default-1\",\"type\":\"Home (Default)\",\"name\":\"Nikhil Sharma\",\"addressLine\":\"Plot 42, Sector 18, Cyber City\",\"city\":\"Gurugram\",\"pincode\":\"122002\",\"state\":\"Haryana\",\"phone\":\"+91 98765 43210\",\"isDefault\":true,\"latitude\":28.4908,\"longitude\":77.0856}', 'XAV-94423124', 'Bluedart Express', NULL, NULL, NULL, 'None', NULL, NULL, NULL, 'None', '0.00', NULL, NULL, NULL, NULL, '2026-10-03 03:19:05.000');

DROP TABLE IF EXISTS `banners`;
CREATE TABLE `banners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `slot` enum('hero','mid_banner','mid_feature','last_mid','announcement') DEFAULT 'hero',
  `image_url` varchar(500) NOT NULL,
  `mobile_image_url` varchar(500) DEFAULT NULL,
  `link_url` varchar(255) DEFAULT '/collections',
  `button_text` varchar(100) DEFAULT 'Shop Collection',
  `badge_text` varchar(50) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `status` enum('active','inactive') DEFAULT 'active',
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_slot_status` (`slot`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `banners` (`id`, `title`, `subtitle`, `slot`, `image_url`, `mobile_image_url`, `link_url`, `button_text`, `badge_text`, `sort_order`, `status`, `start_date`, `end_date`, `created_at`, `updated_at`) VALUES (1, 'RageX Xtreme Compression Gymwear', 'Second-Skin Ultra Flex Performance', 'hero', 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=1600&q=85', NULL, '/collections/men-compression-tees', 'Shop Compression', 'Best Seller', 1, 'active', NULL, NULL, '2026-10-02 01:38:33.000', '2026-10-18 17:39:49.000');
INSERT INTO `banners` (`id`, `title`, `subtitle`, `slot`, `image_url`, `mobile_image_url`, `link_url`, `button_text`, `badge_text`, `sort_order`, `status`, `start_date`, `end_date`, `created_at`, `updated_at`) VALUES (2, 'Heavyweight Aesthetic Oversized Drop', '260 GSM French Terry Cotton', 'hero', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1600&q=85', NULL, '/collections/men-dropcut-tees', 'Shop Oversized', 'New Arrival', 2, 'active', NULL, NULL, '2026-10-02 01:38:33.000', '2026-10-02 01:38:33.000');
INSERT INTO `banners` (`id`, `title`, `subtitle`, `slot`, `image_url`, `mobile_image_url`, `link_url`, `button_text`, `badge_text`, `sort_order`, `status`, `start_date`, `end_date`, `created_at`, `updated_at`) VALUES (3, 'Performance Tapered Gym Joggers', 'Engineered For Elite Aesthetics', 'hero', 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=1600&q=85', NULL, '/collections/men-compression-lowers', 'Shop Joggers', 'Trending', 3, 'active', NULL, NULL, '2026-10-02 01:38:33.000', '2026-10-02 01:38:33.000');
INSERT INTO `banners` (`id`, `title`, `subtitle`, `slot`, `image_url`, `mobile_image_url`, `link_url`, `button_text`, `badge_text`, `sort_order`, `status`, `start_date`, `end_date`, `created_at`, `updated_at`) VALUES (4, 'Nothing Fits Like RageX', 'Gear That Moves With You', 'mid_banner', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=85', NULL, '/collections', 'Explore All', 'Spotlight', 1, 'active', NULL, NULL, '2026-10-02 01:38:33.000', '2026-10-18 17:39:49.000');

DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `product_title` varchar(255) DEFAULT '',
  `user_id` int DEFAULT NULL,
  `customer_id` varchar(50) DEFAULT NULL,
  `author_name` varchar(150) NOT NULL,
  `author_phone` varchar(50) DEFAULT NULL,
  `author_email` varchar(150) DEFAULT '',
  `rating` int NOT NULL DEFAULT '5',
  `title` varchar(255) DEFAULT '',
  `comment` text NOT NULL,
  `size_purchased` varchar(50) DEFAULT 'M',
  `fit_feedback` varchar(50) DEFAULT 'True to Size',
  `images_json` json DEFAULT NULL,
  `is_verified_buyer` tinyint(1) DEFAULT '1',
  `order_number` varchar(50) DEFAULT NULL,
  `order_date` varchar(50) DEFAULT NULL,
  `order_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('approved','pending','rejected') DEFAULT 'approved',
  `helpful_votes` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_prod` (`product_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `stock_notifications`;
CREATE TABLE `stock_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `product_title` varchar(255) NOT NULL,
  `variant_size` varchar(50) DEFAULT 'All',
  `variant_color` varchar(100) DEFAULT '',
  `customer_email` varchar(150) DEFAULT NULL,
  `customer_phone` varchar(50) DEFAULT NULL,
  `customer_name` varchar(150) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `status` enum('pending','notified','cancelled') DEFAULT 'pending',
  `notified_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_prod_status` (`product_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `admin_notifications`;
CREATE TABLE `admin_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('order','inventory','customer','stock_alert','review','system') DEFAULT 'order',
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `reference_id` varchar(100) DEFAULT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_read` (`is_read`),
  KEY `idx_type` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `admin_notifications` (`id`, `type`, `title`, `description`, `reference_id`, `link_url`, `is_read`, `created_at`) VALUES (1, 'customer', '👤 New Customer Joined', 'Customer with phone +914478764746 (ID: GDL-00002) registered on Guidelya.', '2', '/admin', 0, '2026-10-02 03:00:16.000');
INSERT INTO `admin_notifications` (`id`, `type`, `title`, `description`, `reference_id`, `link_url`, `is_read`, `created_at`) VALUES (2, 'customer', '👤 New Customer Joined', 'Customer with phone +914678546845 (ID: GDL-00003) registered on Guidelya.', '3', '/admin', 0, '2026-10-02 03:00:35.000');
INSERT INTO `admin_notifications` (`id`, `type`, `title`, `description`, `reference_id`, `link_url`, `is_read`, `created_at`) VALUES (3, 'customer', '👤 New Customer Joined', 'Customer with phone +914654564564 (ID: GDL-00004) registered on Guidelya.', '4', '/admin', 0, '2026-10-02 03:05:47.000');
INSERT INTO `admin_notifications` (`id`, `type`, `title`, `description`, `reference_id`, `link_url`, `is_read`, `created_at`) VALUES (4, 'order', '🛍️ New Order #ORD-58582319', 'Nikhil Sharma placed an order for ₹2,590 (2 items via UPI (PHONEPE)).', 'ORD-58582319', '/admin', 0, '2026-10-03 03:19:05.000');

DROP TABLE IF EXISTS `otp_verifications`;
CREATE TABLE `otp_verifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `identifier` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `otp` varchar(10) NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `otp_verifications` (`id`, `identifier`, `phone`, `email`, `otp`, `expires_at`, `is_used`, `created_at`) VALUES (1, '917317788940', '917317788940', NULL, '1234', '2026-10-01 02:31:08.000', 0, '2026-10-01 02:26:08.000');
INSERT INTO `otp_verifications` (`id`, `identifier`, `phone`, `email`, `otp`, `expires_at`, `is_used`, `created_at`) VALUES (2, 'link_abcd@gmail.com', NULL, 'abcd@gmail.com', '1234', '2026-10-01 02:31:21.000', 0, '2026-10-01 02:26:20.000');
INSERT INTO `otp_verifications` (`id`, `identifier`, `phone`, `email`, `otp`, `expires_at`, `is_used`, `created_at`) VALUES (3, '914478764746', '914478764746', NULL, '1234', '2026-10-02 03:05:15.000', 0, '2026-10-02 03:00:14.000');
INSERT INTO `otp_verifications` (`id`, `identifier`, `phone`, `email`, `otp`, `expires_at`, `is_used`, `created_at`) VALUES (4, '914678546845', '914678546845', NULL, '1234', '2026-10-02 03:05:27.000', 0, '2026-10-02 03:00:27.000');
INSERT INTO `otp_verifications` (`id`, `identifier`, `phone`, `email`, `otp`, `expires_at`, `is_used`, `created_at`) VALUES (5, '914654564564', '914654564564', NULL, '1234', '2026-10-02 03:10:45.000', 0, '2026-10-02 03:05:45.000');
INSERT INTO `otp_verifications` (`id`, `identifier`, `phone`, `email`, `otp`, `expires_at`, `is_used`, `created_at`) VALUES (6, 'link_abcd@gmail.com', NULL, 'abcd@gmail.com', '1234', '2026-10-02 03:11:01.000', 0, '2026-10-02 03:06:00.000');

SET FOREIGN_KEY_CHECKS = 1;
