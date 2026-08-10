/**
 * Capturador global de errores de la aplicación.
 * Intercepta cualquier excepción no controlada, error de validación o CustomException,
 * y los transforma en una respuesta JSON estandarizada (ErrorResponse) para el cliente.
 */
package com.g9latam.team14.shared.infrastructure.exception;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.util.stream.Collectors;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorResponse> handleCustomException(CustomException ex, HttpServletRequest request) {
        return buildResponse(ex.getStatus(), ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));

        return buildResponse(HttpStatus.BAD_REQUEST, message, request.getRequestURI());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        // Include exception message and stacktrace in 'details' for debugging
        StringWriter sw = new StringWriter();
        ex.printStackTrace(new PrintWriter(sw));
        String details = ex.getMessage() + "\n" + sw.toString();

        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "error interno del servidor", request.getRequestURI(), details);
    }

    // Backwards-compatible overload used by other handlers
    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String message, String path) {
        return buildResponse(status, message, path, null);
    }

    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String message, String path, String details) {
        ErrorResponse body = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                path,
                details
        );
        return ResponseEntity.status(status).body(body);
    }
}
