package com.g9latam.team14.recommendation.infrastructure.seed;

import com.g9latam.team14.recommendation.domain.model.Prioridad;
import com.g9latam.team14.recommendation.domain.model.Recommendation;
import com.g9latam.team14.recommendation.domain.ports.outbound.RecommendationRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Seeder de demostración. Inserta recomendaciones de ejemplo para el usuario demo (id 1)
 * SOLO si la tabla está vacía, de modo que los endpoints devuelvan datos sin depender aún
 * del motor de recomendaciones (tarea posterior).
 */
@Component
@RequiredArgsConstructor
public class RecommendationSeeder implements CommandLineRunner {

    private static final Integer DEMO_USER_ID = 1;

    private final RecommendationRepositoryPort recommendationRepository;

    @Override
    public void run(String... args) {
        if (recommendationRepository.count() > 0) {
            return;
        }

        LocalDate hoy = LocalDate.now();

        List<Recommendation> demo = List.of(
                Recommendation.builder()
                        .userId(DEMO_USER_ID)
                        .priority(Prioridad.ALTA)
                        .title("Reduce tus gastos de transporte")
                        .description("Tus gastos de transporte superan el presupuesto sugerido este mes.")
                        .insight("\"Pequeños ajustes en tus traslados diarios liberan dinero para tus metas.\"")
                        .actionLabel("Implementar")
                        .impactPoints(8)
                        .completed(false)
                        .date(hoy)
                        .build(),
                Recommendation.builder()
                        .userId(DEMO_USER_ID)
                        .priority(Prioridad.ALTA)
                        .title("Aumenta tu reserva de ahorro mensual")
                        .description("Tu frecuencia de ahorro es baja frente a tu capacidad disponible.")
                        .insight("\"Ahorrar de forma constante es el primer paso hacia tu tranquilidad financiera.\"")
                        .actionLabel("Configurar")
                        .impactPoints(10)
                        .completed(false)
                        .date(hoy)
                        .build(),
                Recommendation.builder()
                        .userId(DEMO_USER_ID)
                        .priority(Prioridad.MEDIA)
                        .title("Revisa tus suscripciones de ocio")
                        .description("Detectamos gastos recurrentes de entretenimiento que podrías optimizar.")
                        .insight("\"Cancelar lo que no usas es la forma más rápida de ahorrar sin esfuerzo.\"")
                        .actionLabel("Verificar")
                        .impactPoints(5)
                        .completed(false)
                        .date(hoy)
                        .build(),
                Recommendation.builder()
                        .userId(DEMO_USER_ID)
                        .priority(Prioridad.BAJA)
                        .title("Adelanta la cuota de tu deuda con tasa alta")
                        .description("Amortizar la deuda más cara reduce el interés total que pagas.")
                        .insight("\"Priorizar la deuda cara acelera tu camino hacia la libertad financiera.\"")
                        .actionLabel("Pagar")
                        .impactPoints(4)
                        .completed(false)
                        .date(hoy)
                        .build()
        );

        recommendationRepository.saveAll(demo);
    }
}
