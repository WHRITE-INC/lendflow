from app.lib.payments.mtn import MTNPaymentProvider
from app.lib.payments.mpesa import MpesaPaymentProvider
from app.lib.payments.airtel import AltGhanaPaymentProvider
from app.lib.payments.base import PaymentProviderInterface

class PaymentEngineFactory:
    @staticmethod
    def get_provider(provider_token: str) -> PaymentProviderInterface:
        """Evaluates billing tags and dynamically returns the correct system network adapter instance."""
        token = provider_token.upper()
        if "MTN" in token:
            return MTNPaymentProvider()
        elif "MPESA" in token or "M-PESA" in token:
            return MpesaPaymentProvider()
        elif "TELECEL" in token or "AT_MONEY" in token or "AIRTEL" in token:
            return AltGhanaPaymentProvider()
        else:
            raise ValueError(f"Operational Exception: Unsupported transaction provider tag: {provider_token}")
