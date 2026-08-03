package com.g9latam.team14.debt.infrastructure.adapter.outbound.database;
import com.g9latam.team14.debt.domain.model.Debt;
import com.g9latam.team14.debt.domain.model.DebtStatus;
import com.g9latam.team14.debt.domain.ports.outbound.DebtRepositoryPort;
import com.g9latam.team14.debt.infrastructure.adapter.outbound.database.entity.DebtEntity;
import com.g9latam.team14.debt.infrastructure.adapter.outbound.database.mapper.DebtEntityMapper;
import com.g9latam.team14.debt.infrastructure.adapter.outbound.database.repository.SpringDataDebtRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DebtRepositoryAdapter implements DebtRepositoryPort {
    private final SpringDataDebtRepository springDataDebtRepository;
    private final DebtEntityMapper debtEntityMapper;

    @Override
    public Debt save(Debt debt) {
        DebtEntity entity = debtEntityMapper.toEntity(debt);
        DebtEntity saved = springDataDebtRepository.save(entity);
        return debtEntityMapper.toDomain(saved);
    }

    @Override
    public List<Debt> saveAll(List<Debt> debts) {
        List<DebtEntity> entities = debtEntityMapper.toEntityList(debts);
        List<DebtEntity> savedList = springDataDebtRepository.saveAll(entities);
        return debtEntityMapper.toDomainList(savedList);
    }

    @Override
    public List<Debt> findByUserId(Integer userId) {
        List<DebtEntity> entities = springDataDebtRepository.findByUserId(userId);
        return debtEntityMapper.toDomainList(entities);
    }

    @Override
    public List<Debt> findByUserIdAndStatus(Integer userId, DebtStatus status) {
        List<DebtEntity> entities = springDataDebtRepository.findByUserIdAndStatus(userId, status);
        return debtEntityMapper.toDomainList(entities);
    }

    @Override
    public Optional<Debt> findById(Integer id) {
        return springDataDebtRepository.findById(id)
                .map(debtEntityMapper::toDomain);
    }

    @Override
    public void deleteById(Integer id) {
        springDataDebtRepository.deleteById(id);
    }
}
