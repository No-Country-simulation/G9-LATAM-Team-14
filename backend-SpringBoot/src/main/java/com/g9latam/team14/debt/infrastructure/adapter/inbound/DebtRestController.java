package com.g9latam.team14.debt.infrastructure.adapter.inbound;
import com.g9latam.team14.debt.domain.model.Debt;
import com.g9latam.team14.debt.domain.model.DebtProjectionPoint;
import com.g9latam.team14.debt.domain.model.DebtStatus;
import com.g9latam.team14.debt.domain.model.DebtSummary;
import com.g9latam.team14.debt.domain.ports.inbound.*;
import com.g9latam.team14.debt.infrastructure.adapter.inbound.dtos.*;
import com.g9latam.team14.debt.infrastructure.adapter.inbound.mapper.DebtDtoMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/debts")
@RequiredArgsConstructor
public class DebtRestController {
    private final CreateDebtUseCase createDebtUseCase;
    private final GetDebtsUseCase getDebtsUseCase;
    private final GetDebtSummaryUseCase getDebtSummaryUseCase;
    private final GetDebtProjectionUseCase getDebtProjectionUseCase;
    private final UpdateDebtUseCase updateDebtUseCase;
    private final DeleteDebtUseCase deleteDebtUseCase;
    private final PayDebtInstallmentUseCase payDebtInstallmentUseCase;
    private final DebtDtoMapper debtDtoMapper;

    @PostMapping
    public ResponseEntity<DebtResponse> createDebt(@Valid @RequestBody CreateDebtRequest request) {
        Debt created = createDebtUseCase.createDebt(debtDtoMapper.toDomain(request));
        return ResponseEntity.status(HttpStatus.CREATED).body(debtDtoMapper.toResponse(created));
    }

    @GetMapping
    public ResponseEntity<List<DebtResponse>> getDebts(
            @RequestParam(required = false, defaultValue = "1") Integer userId,
            @RequestParam(required = false) DebtStatus status
    ) {
        List<Debt> debts = getDebtsUseCase.getDebtsByUserIdAndStatus(userId, status);
        return ResponseEntity.ok(debtDtoMapper.toResponseList(debts));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DebtResponse> getDebtById(@PathVariable Integer id) {
        return getDebtsUseCase.getDebtById(id)
                .map(debtDtoMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/summary")
    public ResponseEntity<DebtSummaryResponse> getSummary(
            @RequestParam(required = false, defaultValue = "1") Integer userId
    ) {
        DebtSummary summary = getDebtSummaryUseCase.getDebtSummaryByUserId(userId);
        return ResponseEntity.ok(debtDtoMapper.toResponse(summary));
    }

    @GetMapping("/projection")
    public ResponseEntity<DebtProjectionResponse> getProjection(
            @RequestParam(required = false, defaultValue = "1") Integer userId
    ) {
        List<DebtProjectionPoint> projection = getDebtProjectionUseCase.getDebtProjectionByUserId(userId);
        return ResponseEntity.ok(debtDtoMapper.toResponse(projection));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DebtResponse> updateDebt(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateDebtRequest request
    ) {
        Debt updated = updateDebtUseCase.updateDebt(id, debtDtoMapper.toDomain(request));
        return ResponseEntity.ok(debtDtoMapper.toResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDebt(@PathVariable Integer id) {
        deleteDebtUseCase.deleteDebt(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/pay-installment")
    public ResponseEntity<DebtResponse> payInstallment(@PathVariable Integer id) {
        Debt updated = payDebtInstallmentUseCase.payInstallment(id);
        return ResponseEntity.ok(debtDtoMapper.toResponse(updated));
    }
}
