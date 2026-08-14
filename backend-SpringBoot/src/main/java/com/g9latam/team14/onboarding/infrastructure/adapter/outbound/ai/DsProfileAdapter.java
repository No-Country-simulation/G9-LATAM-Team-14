package com.g9latam.team14.onboarding.infrastructure.adapter.outbound.ai;

import com.g9latam.team14.auth.infrastructure.adapter.outbound.database.UserEntity;
import com.g9latam.team14.auth.infrastructure.adapter.outbound.database.UserJpaRepository;
import com.g9latam.team14.onboarding.domain.model.OnboardingData;
import com.g9latam.team14.onboarding.domain.model.OnboardingDebt;
import com.g9latam.team14.onboarding.domain.ports.outbound.DsProfilePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class DsProfileAdapter implements DsProfilePort {

    private final RestTemplate restTemplate;
    private final UserJpaRepository userJpaRepository;

    @Value("${ds.service.url:http://python-data-science:8000}")
    private String dsServiceUrl;

    @Override
    public void syncProfile(OnboardingData data) {
        String profileUrl = dsServiceUrl + "/api/v1/profiles/";
        Map<String, Object> payload = buildPayload(data);
        try {
            com.fasterxml.jackson.databind.ObjectMapper jsonMapper = new com.fasterxml.jackson.databind.ObjectMapper();
            String jsonBody = jsonMapper.writeValueAsString(payload);
            byte[] bodyBytes = jsonBody.getBytes(java.nio.charset.StandardCharsets.UTF_8);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setContentLength(bodyBytes.length);
            headers.set("X-FinCoach-Request", "1");
            HttpEntity<byte[]> request = new HttpEntity<>(bodyBytes, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    profileUrl, HttpMethod.POST, request, String.class
            );
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                parseAndSaveResult(data.getUserId(), response.getBody());
                log.info("[DS Modelo 1] Perfil registrado y guardado en MySQL para userId={}", data.getUserId());
            }
        } catch (HttpClientErrorException.Conflict e) {
            log.debug("[DS Modelo 1] Perfil ya existía en Django (409) para userId={}", data.getUserId());
        } catch (Exception e) {
            log.warn("[DS Modelo 1] No se pudo sincronizar perfil con Data Science para userId={}: {}", data.getUserId(), e.getMessage());
        }
    }



    private void parseAndSaveResult(Integer userId, String responseBody) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(responseBody);
            com.fasterxml.jackson.databind.JsonNode classification = root.path("classification");
            if (!classification.isMissingNode()) {
                String ocupacion = classification.path("ocupacion_cuoc").asText("");
                double confianza = classification.path("confianza_actividad_pct").asDouble(0.0);
                String actividad = classification.path("actividad_principal").asText("");

                userJpaRepository.findById(userId).ifPresent(user -> {
                    if (!ocupacion.isBlank()) user.setOcupacionCuoc(ocupacion);
                    if (confianza > 0) user.setConfianzaIaPct(confianza);
                    if (!actividad.isBlank()) user.setActividadPrincipal(actividad);
                    user.setResultadoIaJson(responseBody);
                    userJpaRepository.save(user);
                    log.info("[DS Modelo 1] Guardado en BD MySQL: userId={}, ocupacion={}, confianza={}%", userId, ocupacion, confianza);
                });
            }
        } catch (Exception e) {
            log.warn("[DS Modelo 1] Error al procesar JSON IA para userId={}: {}", userId, e.getMessage());
        }
    }


    private Map<String, Object> buildPayload(OnboardingData data) {
        Optional<UserEntity> userOpt = userJpaRepository.findById(data.getUserId());
        UserEntity user = userOpt.orElse(null);
        double income = data.getMonthlyNetIncome() != null ? data.getMonthlyNetIncome()
                : (user != null && user.getIngresoMensual() != null ? user.getIngresoMensual() : 0.0);

        String activity = data.getPrimaryActivity() != null && !data.getPrimaryActivity().isBlank()
                ? data.getPrimaryActivity()
                : "Profesional independiente";

        String modality = data.getPrimaryIncomeModality() != null && !data.getPrimaryIncomeModality().isBlank()
                ? data.getPrimaryIncomeModality() : "fijo";

        String goal = data.getNextGoal() != null && !data.getNextGoal().isBlank()
                ? data.getNextGoal() : "crear fondo de emergencia";

        List<String> debtTypes = data.getDebts() != null
                ? data.getDebts().stream()
                    .filter(d -> d.getCategory() != null && !d.getCategory().isBlank())
                    .map(OnboardingDebt::getCategory)
                    .distinct()
                    .collect(Collectors.toList())
                : List.of();

        String savingHabit = data.getSavingHabit() != null && !data.getSavingHabit().isBlank()
                ? data.getSavingHabit() : "media";

        List<String> hobbies = data.getHobbies() != null ? data.getHobbies() : List.of();
        String responsibility = data.getFinancialResponsibility() != null && !data.getFinancialResponsibility().isBlank()
                ? data.getFinancialResponsibility() : "";

        double debtRatioPct = 0.0;
        if (income > 0 && data.getDebts() != null) {
            double totalDebt = data.getDebts().stream()
                    .filter(d -> d.getAmount() != null)
                    .mapToDouble(OnboardingDebt::getAmount)
                    .sum();
            debtRatioPct = Math.min((totalDebt / income) * 100.0, 100.0);
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("monthly_net_income", income);
        payload.put("saving_habit", savingHabit.toLowerCase());
        payload.put("debt_ratio_percentage", debtRatioPct);
        payload.put("debt_types", debtTypes);
        payload.put("primary_activity", activity);
        payload.put("primary_income_modality", modality.toLowerCase());
        payload.put("has_additional_income", false);
        payload.put("additional_activity", "");
        payload.put("additional_income_modality", "");
        payload.put("next_goal", goal);
        payload.put("hobbies", hobbies);
        payload.put("financial_responsibility", responsibility);
        return payload;
    }

}
