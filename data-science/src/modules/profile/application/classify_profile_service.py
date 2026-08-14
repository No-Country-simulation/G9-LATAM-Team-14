from modules.profile.domain.profile_classifier import classify_profile_domain

class ClassifyProfileUseCase:
    """Use case for processing and classifying user financial profiles."""
    
    def execute(self, payload: dict) -> dict:
        try:
            return classify_profile_domain(payload)
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise e

