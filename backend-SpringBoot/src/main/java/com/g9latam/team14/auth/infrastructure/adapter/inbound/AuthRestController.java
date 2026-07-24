package com.g9latam.team14.auth.infrastructure.adapter.inbound;
import com.g9latam.team14.auth.domain.model.User;
import com.g9latam.team14.auth.domain.ports.inbound.GetAuthenticatedUserUseCase;
import com.g9latam.team14.auth.domain.ports.inbound.LoginUseCase;
import com.g9latam.team14.auth.domain.ports.outbound.TokenProviderPort;
import com.g9latam.team14.auth.infrastructure.adapter.inbound.dtos.AuthResponse;
import com.g9latam.team14.auth.infrastructure.adapter.inbound.dtos.LoginRequest;
import com.g9latam.team14.auth.infrastructure.adapter.inbound.mapper.AuthDtoMapper;
import com.g9latam.team14.auth.infrastructure.config.security.JwtProperties;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthRestController {
    private final LoginUseCase loginUseCase;
    private final GetAuthenticatedUserUseCase getAuthenticatedUserUseCase;
    private final TokenProviderPort tokenProvider;
    private final AuthDtoMapper authDtoMapper;
    private final JwtProperties jwtProperties;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        User user = loginUseCase.login(request.email(), request.password());
        return createAuthResponseWithCookie(user, response);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> checkSession(
            @CookieValue(name = "jwt", required = false) String token,
            HttpServletResponse response
    ) {
        if (token == null || !tokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = tokenProvider.extractEmail(token);
        User user = getAuthenticatedUserUseCase.getUserByEmail(email);
        return createAuthResponseWithCookie(user, response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok().build();
    }

    private ResponseEntity<AuthResponse> createAuthResponseWithCookie(User user, HttpServletResponse response) {
        String token = tokenProvider.generateToken(user);
        long expiresInSeconds = jwtProperties.getExpirationMs() / 1000;
        ResponseCookie cookie = ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(expiresInSeconds)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(authDtoMapper.toAuthResponse(user, token, expiresInSeconds));
    }
}