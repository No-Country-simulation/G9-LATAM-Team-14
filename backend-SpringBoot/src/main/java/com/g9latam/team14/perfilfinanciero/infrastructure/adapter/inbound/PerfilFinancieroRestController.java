package com.g9latam.team14.perfilfinanciero.infrastructure.adapter.inbound;

import com.g9latam.team14.perfilfinanciero.domain.model.PerfilFinanciero;
import com.g9latam.team14.perfilfinanciero.domain.ports.inbound.GetPerfilFinancieroUseCase;
import com.g9latam.team14.perfilfinanciero.domain.ports.inbound.UpdatePerfilFinancieroUseCase;
import com.g9latam.team14.recommendation.infrastructure.adapter.inbound.AuthenticatedUserProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/perfil-financiero")
@RequiredArgsConstructor
public class PerfilFinancieroRestController {

    private final GetPerfilFinancieroUseCase getPerfilFinancieroUseCase;
    private final UpdatePerfilFinancieroUseCase updatePerfilFinancieroUseCase;
    private final AuthenticatedUserProvider authenticatedUserProvider;

    @GetMapping
    public ResponseEntity<PerfilFinanciero> getPerfil() {
        Integer userId = authenticatedUserProvider.currentUserId();
        return ResponseEntity.ok(getPerfilFinancieroUseCase.getPerfil(userId));
    }

    @PatchMapping
    public ResponseEntity<Void> updatePerfil(@RequestBody Map<String, Object> body) {
        Integer userId = authenticatedUserProvider.currentUserId();

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
