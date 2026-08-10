import unicodedata

class TextNormalizer:
    @staticmethod
    def normalize(value: str) -> str:
        text = unicodedata.normalize('NFKD', str(value or '').lower())
        text = ''.join(c for c in text if not unicodedata.combining(c))
        text = text.replace('_', ' ').replace('-', ' ')
        return ' '.join(text.split())

    @staticmethod
    def detect_movement_type(description: str, direction: str) -> str:
        words = set(TextNormalizer.normalize(description).split())
        is_payment = bool({'pago', 'cuota'} & words)
        is_debt = bool({'credito', 'prestamo', 'deuda'} & words)

        if direction == 'salida' and is_payment and is_debt:
            return 'pago_deuda'
        return 'ingreso_generado' if direction == 'entrada' else 'gasto'

    @staticmethod
    def build_model_text(description: str, note: str, direction: str, movement_type: str) -> str:
        def text_val(val, rep='no_declarado'):
            return str(val).strip() if val and str(val).strip() else rep

        parts = [
            f"transaccion {TextNormalizer.normalize(description)}",
            f"nota {text_val(note)}",
            f"direccion {text_val(direction)}",
            f"tipo {text_val(movement_type)}",
            "actividad no_declarado",
            "actividad secundaria no_declarado",
            "estado ingreso no_declarado",
            "hobbies no_declarado",
            "meta no_declarada",
            "responsabilidad no_declarada",
            "deuda sin_deuda",
            "habito ahorro no_declarado",
        ]
        return ' | '.join(parts)
