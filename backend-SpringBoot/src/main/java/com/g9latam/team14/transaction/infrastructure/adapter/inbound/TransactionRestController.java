package com.g9latam.team14.transaction.infrastructure.adapter.inbound;

import com.g9latam.team14.auth.domain.model.User;
import com.g9latam.team14.auth.domain.ports.inbound.GetAuthenticatedUserUseCase;
import com.g9latam.team14.transaction.domain.model.Transaction;
import com.g9latam.team14.transaction.domain.ports.inbound.ClassifyTransactionUseCase;
import com.g9latam.team14.transaction.domain.ports.inbound.CreateTransactionUseCase;
import com.g9latam.team14.transaction.domain.ports.inbound.GetTransactionsUseCase;
import com.g9latam.team14.transaction.infrastructure.adapter.inbound.dto.CreateTransactionRequest;
import com.g9latam.team14.transaction.infrastructure.adapter.outbound.database.mapper.TransactionDtoMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.g9latam.team14.transaction.domain.ports.inbound.ConfirmTransactionUseCase;
import com.g9latam.team14.transaction.infrastructure.adapter.inbound.dto.ConfirmTransactionRequest;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionRestController {

    private final CreateTransactionUseCase createTransactionUseCase;
    private final GetTransactionsUseCase getTransactionsUseCase;
    private final TransactionDtoMapper transactionDtoMapper;
    private final GetAuthenticatedUserUseCase getAuthenticatedUserUseCase;
    private final ClassifyTransactionUseCase classifyTransactionUseCase;
    private final ConfirmTransactionUseCase confirmTransactionUseCase;

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(
            @Valid @RequestBody CreateTransactionRequest request,
            Authentication authentication
    ) {

        User user = getAuthenticatedUserUseCase.getUserByEmail(
                authentication.getName()
        );

        Transaction transaction = createTransactionUseCase.createTransaction(
                transactionDtoMapper.toDomain(request, user.getId())
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(transaction);
    }

    @PostMapping("/{id}/classify")
    public ResponseEntity<Transaction> classifyTransaction(
            @PathVariable Integer id
    ) {

        Transaction transaction =
                classifyTransactionUseCase.classifyTransaction(id);

        return ResponseEntity.ok(transaction);
    }
    @PostMapping("/{id}/confirm")
    public ResponseEntity<Transaction> confirmTransaction(
            @PathVariable Integer id,
            @Valid @RequestBody ConfirmTransactionRequest request
    ) {

        Transaction transaction = confirmTransactionUseCase.confirmTransaction(
                id,
                request.category(),
                request.purpose(),
                request.regularity()
        );

        return ResponseEntity.ok(transaction);
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions(
            Authentication authentication
    ) {

        User user = getAuthenticatedUserUseCase.getUserByEmail(
                authentication.getName()
        );

        List<Transaction> transactions =
                getTransactionsUseCase.getTransactionsByUser(user.getId());

        return ResponseEntity.ok(transactions);
    }
}