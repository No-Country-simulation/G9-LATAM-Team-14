/**
 * Excepción personalizada para lanzar errores de negocio controlados.
 * Permite definir un mensaje descriptivo y un código de estado HTTP específico (400, 401, 404, etc.)
 * para que el GlobalExceptionHandler los procese y responda al cliente de forma limpia.
 */

package com.g9latam.team14.shared.infrastructure.exception;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class CustomException extends RuntimeException {

    private final HttpStatus status;

    public CustomException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
