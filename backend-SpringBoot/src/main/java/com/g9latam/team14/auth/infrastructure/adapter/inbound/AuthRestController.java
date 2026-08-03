package com.g9latam.team14.auth.infrastructure.adapter.inbound;
import com.g9latam.team14.auth.domain.model.User;
import com.g9latam.team14.auth.domain.ports.inbound.GetAuthenticatedUserUseCase;
import com.g9latam.team14.auth.domain.ports.inbound.LoginUseCase;
import com.g9latam.team14.auth.domain.ports.inbound.RegisterUserUseCase;
import com.g9latam.team14.auth.domain.ports.outbound.TokenBlacklistPort;
import com.g9latam.team14.auth.domain.ports.outbound.TokenProviderPort;
import com.g9latam.team14.auth.infrastructure.adapter.inbound.dtos.AuthResponse;
import com.g9latam.team14.auth.infrastructure.adapter.inbound.dtos.LoginRequest;
import com.g9latam.team14.auth.infrastructure.adapter.inbound.dtos.RegisterRequest;
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
    private final RegisterUserUseCase registerUserUseCase;
    private final GetAuthenticatedUserUseCase getAuthenticatedUserUseCase;
    private final TokenProviderPort tokenProvider;
    private final TokenBlacklistPort tokenBlacklistPort;
    private final AuthDtoMapper authDtoMapper;
    private final JwtProperties jwtProperties;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response
    ) {
        User user = registerUserUseCase.register(
                request.username(),
                request.email(),
                request.password(),
                request.ingresoMensual()
        );
        AuthResponse authResponse = generateAuthCookieAndResponse(user, response);
        return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
    }

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
        if (token == null || tokenBlacklistPort.isBlacklisted(token) || !tokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = tokenProvider.extractEmail(token);
        User user = getAuthenticatedUserUseCase.getUserByEmail(email);
        return createAuthResponseWithCookie(user, response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = "jwt", required = false) String token,
            HttpServletResponse response
    ) {
        if (token != null && !token.isBlank()) {
            long expiresInSeconds = jwtProperties.getExpirationMs() / 1000;
            tokenBlacklistPort.blacklistToken(token, expiresInSeconds);
        }

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
        return ResponseEntity.ok(generateAuthCookieAndResponse(user, response));
    }

    private AuthResponse generateAuthCookieAndResponse(User user, HttpServletResponse response) {
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
        return authDtoMapper.toAuthResponse(user, token, expiresInSeconds);
    }
}