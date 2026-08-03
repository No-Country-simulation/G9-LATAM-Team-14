CREATE DATABASE IF NOT EXISTS `financiero` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `financiero`;

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_usuario` varchar(45) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `ingreso_mensual` float DEFAULT NULL,
  `fecha_registro` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `tipo_gasto`;
CREATE TABLE `tipo_gasto` (
  `id_tipo` int NOT NULL,
  `categoria` varchar(10) DEFAULT NULL,
  `bancario` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '0',
  PRIMARY KEY (`id_tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `deuda_bancaria`;
CREATE TABLE `deuda_bancaria` (
  `id_deuda` int NOT NULL,
  `descripcion` varchar(45) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `monto_mensual` float DEFAULT NULL,
  `usuario` int DEFAULT NULL,
  PRIMARY KEY (`id_deuda`),
  KEY `usuario_idx` (`usuario`),
  CONSTRAINT `usuario` FOREIGN KEY (`usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `debts`;
CREATE TABLE `debts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(50) DEFAULT 'INSTALLMENT',
  `category` varchar(100) DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `monthly_amount` decimal(12,2) NOT NULL,
  `months_term` int DEFAULT 12,
  `paid_installments` int DEFAULT 0,
  `payment_mode` varchar(50) DEFAULT 'FIXED_TERM',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_indefinite` tinyint(1) DEFAULT 0,
  `status` varchar(50) DEFAULT 'ACTIVE',
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_debts_user_idx` (`user_id`),
  CONSTRAINT `fk_debts_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `gastos`;
CREATE TABLE `gastos` (
  `id_gasto` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(45) DEFAULT NULL,
  `monto` float DEFAULT NULL,
  `fecha_gasto` date DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `tipo_gasto` int DEFAULT NULL,
  PRIMARY KEY (`id_gasto`),
  KEY `user_id_idx` (`user_id`),
  KEY `tipo_gasto_idx` (`tipo_gasto`),
  CONSTRAINT `tipo_gasto` FOREIGN KEY (`tipo_gasto`) REFERENCES `tipo_gasto` (`id_tipo`),
  CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `ingresos`;
CREATE TABLE `ingresos` (
  `id_ingresos` int NOT NULL,
  `descripcion` varchar(15) DEFAULT NULL,
  `monto` float DEFAULT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `id_usuario` int DEFAULT NULL,
  PRIMARY KEY (`id_ingresos`),
  KEY `user_id_idx` (`id_usuario`),
  CONSTRAINT `id_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `movements`;
CREATE TABLE `movements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(255) DEFAULT NULL,
  `amount` decimal(38,2) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_movements_user_idx` (`user_id`),
  CONSTRAINT `fk_movements_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Usuario demo: demo@fincoach.com / password123
INSERT INTO `usuarios` (`id`, `nombre_usuario`, `password`, `email`, `ingreso_mensual`, `fecha_registro`) VALUES
(1, 'demo', '$2b$10$XxsfhmV1YxzgkaAvD8lGLeqR/UB3eKQVcrkzk2ZZlxgVtfLPWn77q', 'demo@fincoach.com', 5000, '2026-01-15');

-- Deudas iniciales para usuario demo
INSERT INTO `debts` (`id`, `type`, `category`, `total_amount`, `monthly_amount`, `months_term`, `paid_installments`, `payment_mode`, `start_date`, `end_date`, `is_indefinite`, `status`, `user_id`) VALUES
(1, 'INSTALLMENT', 'Préstamo personal', 6000.00, 500.00, 12, 6, 'FIXED_TERM', '2026-01-01', '2026-12-31', 0, 'ACTIVE', 1),
(2, 'INSTALLMENT', 'Tarjeta de crédito', 4000.00, 400.00, 10, 4, 'FIXED_TERM', '2026-02-01', '2026-11-30', 0, 'ACTIVE', 1),
(3, 'INSTALLMENT', 'Crédito vehicular', 5400.00, 225.00, 24, 8, 'FIXED_TERM', '2025-06-01', '2027-05-31', 0, 'ACTIVE', 1),
(4, 'INSTALLMENT', 'Crédito educativo', 2400.00, 200.00, 12, 12, 'FIXED_TERM', '2025-03-01', '2026-03-01', 0, 'PAID', 1);
