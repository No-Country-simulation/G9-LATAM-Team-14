package com.g9latam.team14.profile.infrastructure.adapter.inbound;
import com.g9latam.team14.auth.infrastructure.adapter.outbound.database.UserEntity;
import com.g9latam.team14.auth.infrastructure.adapter.outbound.database.UserJpaRepository;
import com.g9latam.team14.profile.domain.model.PerfilFinanciero;
import com.g9latam.team14.profile.domain.ports.inbound.*;
import com.g9latam.team14.profile.infrastructure.adapter.inbound.dtos.ProfileResponse;
import com.g9latam.team14.profile.infrastructure.adapter.inbound.dtos.UpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileRestController {
    private final GetProfileUseCase getProfileUseCase;
    private final UpdateProfileUseCase updateProfileUseCase;
    private final GetPerfilFinancieroUseCase getPerfilFinancieroUseCase;
    private final UpdatePerfilFinancieroUseCase updatePerfilFinancieroUseCase;
    private final UserJpaRepository userJpaRepository;

    private Integer resolveUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String email = auth.getName();
                Optional<UserEntity> userOpt = userJpaRepository.findByEmail(email);
                if (userOpt.isPresent()) {
                    return userOpt.get().getId();
                }
            }
        } catch (Exception ignored) {}
        return 1;
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile() {
        Integer userId = resolveUserId();
        return ResponseEntity.ok(getProfileUseCase.getProfile(userId));
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(@RequestBody UpdateProfileRequest request) {
        Integer userId = resolveUserId();
        return ResponseEntity.ok(updateProfileUseCase.updateProfile(userId, request));
    }
    
    @GetMapping("/legacy")
    public ResponseEntity<PerfilFinanciero> getPerfilLegacy() {
        Integer userId = resolveUserId();
        return ResponseEntity.ok(getPerfilFinancieroUseCase.getPerfil(userId));
    }

    @PatchMapping("/legacy")
    public ResponseEntity<Void> updatePerfilLegacy(@RequestBody Map<String, Object> body) {
        Integer userId = resolveUserId();
        if (body.containsKey("ingresoMensual")) {
            Object valor = body.get("ingresoMensual");
            BigDecimal ingreso = valor instanceof Number
                    ? BigDecimal.valueOf(((Number) valor).doubleValue())
                    : new BigDecimal(valor.toString());
            updatePerfilFinancieroUseCase.updateIngresoMensual(userId, ingreso);
        }
        if (body.containsKey("frecuenciaAhorro")) {
            String frecuencia = body.get("frecuenciaAhorro").toString();
            updatePerfilFinancieroUseCase.updateFrecuenciaAhorro(userId, frecuencia);
        }
        return ResponseEntity.ok().build();
    }
}
