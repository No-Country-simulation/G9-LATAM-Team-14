package com.g9latam.team14.movement.infrastructure.adapter.inbound;
import java.util.List;
import com.g9latam.team14.movement.domain.ports.inbound.GetMovementsUseCase;
import com.g9latam.team14.movement.domain.model.Movement;
import com.g9latam.team14.movement.domain.ports.inbound.CreateMovementUseCase;
import com.g9latam.team14.movement.infrastructure.adapter.inbound.dtos.CreateMovementRequest;
import com.g9latam.team14.movement.infrastructure.adapter.inbound.dtos.MovementResponse;
import com.g9latam.team14.movement.infrastructure.adapter.inbound.mapper.MovementDtoMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.g9latam.team14.movement.infrastructure.adapter.inbound.dtos.AiClassificationResponse;
import com.g9latam.team14.movement.infrastructure.adapter.inbound.dtos.ConfirmMovementRequest;

@RestController
@RequestMapping("/api/movements")
@RequiredArgsConstructor
public class MovementRestController {
    private final CreateMovementUseCase createMovementUseCase;
    private final GetMovementsUseCase getMovementsUseCase;
    private final MovementDtoMapper movementDtoMapper;
    private final com.g9latam.team14.movement.domain.ports.inbound.ClassifyMovementUseCase classifyMovementUseCase;
    private final com.g9latam.team14.auth.domain.ports.inbound.GetAuthenticatedUserUseCase getAuthenticatedUserUseCase;

    @PostMapping
    public ResponseEntity<MovementResponse> createMovement(
            @Valid @RequestBody CreateMovementRequest request
    ) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        Integer userId = request.userId();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            var user = getAuthenticatedUserUseCase.getUserByEmail(auth.getName());
            if (user != null) {
                userId = user.getId();
            }
        }

        Movement domain = movementDtoMapper.toDomain(request);
        if (userId != null) {
            domain = Movement.builder()
                    .id(domain.getId())
                    .description(domain.getDescription())
                    .amount(domain.getAmount())
                    .type(domain.getType())
                    .category(domain.getCategory())
                    .date(domain.getDate())
                    .userId(userId)
                    .build();
        }

        Movement movement = createMovementUseCase.createMovement(domain);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(movementDtoMapper.toResponse(movement));
    }

    @PostMapping("/classify")
    public ResponseEntity<AiClassificationResponse> classifyMovement(
            @Valid @RequestBody CreateMovementRequest request
    ) {
        String direction = "INGRESO".equalsIgnoreCase(request.type()) ? "entrada" : "salida";

        var ai = classifyMovementUseCase.classifyMovement(
                request.description(),
                request.amount().doubleValue(),
                direction,
                ""
        );

        var dto = movementDtoMapper.aiToResponse(ai);
        return ResponseEntity.ok(dto);
    }
    @PatchMapping("/{id}/confirm")
    public ResponseEntity<MovementResponse> confirmMovement(
            @PathVariable Integer id,
            @Valid @RequestBody ConfirmMovementRequest request
    ) {
        Movement movement = createMovementUseCase.confirmMovement(
                id,
                request.category(),
                request.regularity(),
                request.debtId()
        );

        return ResponseEntity.ok(movementDtoMapper.toResponse(movement));
    }

    @GetMapping
    public ResponseEntity<List<MovementResponse>> getAllMovements() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        List<Movement> list;
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            var user = getAuthenticatedUserUseCase.getUserByEmail(auth.getName());
            list = (user != null) ? getMovementsUseCase.getMovementsByUserId(user.getId()) : getMovementsUseCase.getAllMovements();
        } else {
            list = getMovementsUseCase.getAllMovements();
        }

        List<MovementResponse> response = list.stream()
                .map(movementDtoMapper::toResponse)
                .toList();

        return ResponseEntity.ok(response);
    }
}
