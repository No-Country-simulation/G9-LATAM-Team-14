package com.g9latam.team14.shared.infrastructure.exception;
import java.time.LocalDateTime;
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path
) {
}
