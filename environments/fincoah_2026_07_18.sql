CREATE DATABASE IF NOT EXISTS `financiero` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `financiero`;

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` int NOT NULL,
  `nombre_usuario` varchar(45) DEFAULT NULL,
  `password` varchar(10) DEFAULT NULL, -- Cambiado a password
  `email` varchar(20) DEFAULT NULL,
  `ingreso_mensual` float DEFAULT NULL,
  `fecha_registro` date DEFAULT NULL,
  PRIMARY KEY (`id`)
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