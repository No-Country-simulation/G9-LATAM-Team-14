/**
 * Configuración del módulo de autenticación.
 * Habilita e inyecta las propiedades personalizadas de configuración (JwtProperties)
 * definidas en el archivo application.properties/yml para su uso en el módulo.
 */
package com.g9latam.team14.auth.infrastructure.config;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import com.g9latam.team14.auth.infrastructure.config.security.JwtProperties;

@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class AuthModuleConfig {
}
