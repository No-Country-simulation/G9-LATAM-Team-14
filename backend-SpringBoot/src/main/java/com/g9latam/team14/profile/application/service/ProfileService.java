package com.g9latam.team14.profile.application.service;

import com.g9latam.team14.auth.infrastructure.adapter.outbound.database.UserEntity;
import com.g9latam.team14.auth.infrastructure.adapter.outbound.database.UserJpaRepository;
import com.g9latam.team14.debt.domain.model.Debt;
import com.g9latam.team14.debt.domain.model.DebtStatus;
import com.g9latam.team14.debt.domain.ports.inbound.GetDebtsUseCase;
import com.g9latam.team14.onboarding.domain.model.OnboardingData;
import com.g9latam.team14.onboarding.domain.ports.outbound.DsProfilePort;
import com.g9latam.team14.profile.domain.model.*;
import com.g9latam.team14.profile.domain.ports.inbound.*;
import com.g9latam.team14.profile.domain.ports.outbound.PerfilFinancieroRepositoryPort;
import com.g9latam.team14.profile.infrastructure.adapter.inbound.dtos.ProfileResponse;
import com.g9latam.team14.profile.infrastructure.adapter.inbound.dtos.UpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileService implements GetPerfilFinancieroUseCase, UpdatePerfilFinancieroUseCase, GetProfileUseCase, UpdateProfileUseCase {
    private static final BigDecimal CERO = BigDecimal.ZERO;
    private final PerfilFinancieroRepositoryPort perfilRepository;
    private final GetDebtsUseCase getDebtsUseCase;
    private final UserJpaRepository userJpaRepository;
    private final DsProfilePort dsProfilePort;

    @Override
    public ProfileResponse getProfile(Integer userId) {
        UserEntity user = userJpaRepository.findById(userId).orElse(null);
        if (user == null) {
            return new ProfileResponse(userId, "", "", BigDecimal.ZERO, "", "MEDIA", "", 0.0, "", false, "Fijo", "vivienda", List.of(), "");
        }
        BigDecimal ingreso = user.getIngresoMensual() != null ? BigDecimal.valueOf(user.getIngresoMensual()) : BigDecimal.ZERO;

        String modality = "Fijo";
        String goal = "vivienda";
        List<String> hobbies = List.of();
        String responsibility = "";

        if (user.getResultadoIaJson() != null && !user.getResultadoIaJson().isBlank()) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(user.getResultadoIaJson());
                com.fasterxml.jackson.databind.JsonNode c = root.path("classification");
                if (c.isMissingNode()) c = root;

                if (c.has("modalidad_ingreso_principal")) {
                    modality = c.path("modalidad_ingreso_principal").asText("Fijo");
                }
                if (c.has("meta")) {
                    goal = c.path("meta").asText("vivienda");
                }
                if (c.has("hobbies_fuera_mvp") && c.path("hobbies_fuera_mvp").isArray()) {
                    List<String> list = new java.util.ArrayList<>();
                    c.path("hobbies_fuera_mvp").forEach(node -> list.add(node.asText()));
                    if (c.has("hobbies_intereses") && c.path("hobbies_intereses").isArray()) {
                        c.path("hobbies_intereses").forEach(node -> {
                            String h = node.asText();
                            if (!"no_declarado".equalsIgnoreCase(h) && !list.contains(h)) {
                                list.add(h);
                            }
                        });
                    }
                    hobbies = list;
                } else if (c.has("hobbies_intereses") && c.path("hobbies_intereses").isArray()) {
                    List<String> list = new java.util.ArrayList<>();
                    c.path("hobbies_intereses").forEach(node -> {
                        String h = node.asText();
                        if (!"no_declarado".equalsIgnoreCase(h)) list.add(h);
                    });
                    hobbies = list;
                }
                if (c.has("responsabilidad")) {
                    responsibility = c.path("responsabilidad").asText("");
                }
            } catch (Exception e) {
                log.warn("[ProfileService] Error extrayendo detalles del JSON para userId={}: {}", userId, e.getMessage());
            }
        }

        return new ProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getNombreUsuario(),
                ingreso,
                user.getActividadPrincipal(),
                user.getFrecuenciaAhorro() != null ? user.getFrecuenciaAhorro() : "MEDIA",
                user.getOcupacionCuoc(),
                user.getConfianzaIaPct(),
                user.getResultadoIaJson(),
                user.getOnboardingCompleted(),
                modality,
                goal,
                hobbies,
                responsibility
        );
    }

    @Override
    public ProfileResponse updateProfile(Integer userId, UpdateProfileRequest request) {
        UserEntity user = userJpaRepository.findById(userId).orElse(null);
        if (user != null) {
            if (request.monthlyNetIncome() != null && request.monthlyNetIncome().compareTo(BigDecimal.ZERO) > 0) {
                user.setIngresoMensual(request.monthlyNetIncome().floatValue());
            }
            if (request.primaryActivity() != null && !request.primaryActivity().isBlank()) {
                user.setActividadPrincipal(request.primaryActivity());
            }
            if (request.savingHabit() != null && !request.savingHabit().isBlank()) {
                user.setFrecuenciaAhorro(request.savingHabit());
            }
            userJpaRepository.save(user);

            try {
                OnboardingData data = OnboardingData.builder()
                        .userId(userId)
                        .monthlyNetIncome(request.monthlyNetIncome() != null ? request.monthlyNetIncome().doubleValue() : (double) user.getIngresoMensual())
                        .primaryActivity(user.getActividadPrincipal())
                        .primaryIncomeModality(request.primaryIncomeModality() != null ? request.primaryIncomeModality() : "fijo")
                        .nextGoal(request.nextGoal() != null ? request.nextGoal() : "")
                        .hobbies(request.hobbies() != null ? request.hobbies() : List.of())
                        .financialResponsibility(request.financialResponsibility() != null ? request.financialResponsibility() : "")
                        .savingHabit(user.getFrecuenciaAhorro())
                        .build();

                dsProfilePort.syncProfile(data);
            } catch (Exception e) {
                log.warn("[ProfileService] Error al re-sincronizar perfil con la IA para userId={}: {}", userId, e.getMessage());
            }
        }
        return getProfile(userId);
    }

    @Override
    public PerfilFinanciero getPerfil(Integer userId) {
        BigDecimal ingresoMensual = perfilRepository.getIngresoMensual(userId);
        if (ingresoMensual == null) {
            ingresoMensual = CERO;
        }

        List<Debt> deudasModerna = getDebtsUseCase.getAllDebtsByUserId(userId);
        List<DebtProfile> deudasModernaPerfil = deudasModerna.stream()
                .filter(d -> d.getStatus() == DebtStatus.ACTIVE)
                .map(d -> new DebtProfile(
                        d.getId(),
                        d.getCategory(),
                        d.getMonthlyAmount() != null ? d.getMonthlyAmount() : CERO,
                        d.getMonthsTerm(),
                        d.getPaidInstallments()
                ))
                .toList();

        List<DebtProfile> deudasLegacy = perfilRepository.getDeudasLegacy(userId);

        List<DebtProfile> todasDeudas = new java.util.ArrayList<>(deudasModernaPerfil);
        todasDeudas.addAll(deudasLegacy);

        BigDecimal totalCuotas = todasDeudas.stream()
                .map(DebtProfile::monthlyAmount)
                .reduce(CERO, BigDecimal::add);

        Double porcentajeIngreso = ingresoMensual.compareTo(CERO) > 0
                ? totalCuotas.multiply(new BigDecimal("100"))
                        .divide(ingresoMensual, 1, RoundingMode.HALF_UP)
                        .doubleValue()
                : 0.0;

        NivelEndeudamiento nivelEndeudamiento = new NivelEndeudamiento(
                totalCuotas.setScale(2, RoundingMode.HALF_UP),
                porcentajeIngreso,
                calcularNivel(porcentajeIngreso)
        );

        String frecuenciaAhorro = perfilRepository.getFrecuenciaAhorro(userId);
        if (frecuenciaAhorro == null) {
            frecuenciaAhorro = "MEDIA";
        }

        BigDecimal gastoPromedio = perfilRepository.promedioGastosMensuales(userId, 3);
        BigDecimal cuotasDeuda = totalCuotas.setScale(2, RoundingMode.HALF_UP);
        BigDecimal capacidadAhorro = ingresoMensual
                .subtract(cuotasDeuda)
                .subtract(gastoPromedio)
                .setScale(2, RoundingMode.HALF_UP);

        ProyeccionMensual proyeccion = new ProyeccionMensual(
                ingresoMensual.setScale(2, RoundingMode.HALF_UP),
                cuotasDeuda,
                gastoPromedio,
                capacidadAhorro
        );

        return new PerfilFinanciero(
                ingresoMensual.setScale(2, RoundingMode.HALF_UP),
                todasDeudas,
                nivelEndeudamiento,
                frecuenciaAhorro,
                proyeccion
        );
    }

    @Override
    public void updateIngresoMensual(Integer userId, BigDecimal ingresoMensual) {
        perfilRepository.updateIngresoMensual(userId, ingresoMensual);
    }

    @Override
    public void updateFrecuenciaAhorro(Integer userId, String frecuenciaAhorro) {
        perfilRepository.updateFrecuenciaAhorro(userId, frecuenciaAhorro);
    }

    private String calcularNivel(double porcentaje) {
        if (porcentaje >= 60) return "Crítico";
        if (porcentaje >= 35) return "Riesgoso";
        if (porcentaje >= 25) return "Manejable";
        return "Saludable";
    }
}
