from modules.transaction.domain.transaction_classifier import classify_transaction_domain

class ClassifyTransactionUseCase:
    """Use case for processing and classifying transaction movements."""
    
    def execute(self, payload: dict) -> dict:
        return classify_transaction_domain(payload)
