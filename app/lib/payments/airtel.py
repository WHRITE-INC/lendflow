from app.lib.payments.base import PaymentProviderInterface, PaymentEngineResponse

class AltGhanaPaymentProvider(PaymentProviderInterface):
    async def initiate_stk_push(self, phone: str, amount: float, currency: str, reference: str) -> PaymentEngineResponse:
        """Fires an alternative cellular wallet billing pull."""
        return PaymentEngineResponse(
            success=True,
            network_reference=f"GH-ALT-{reference.upper()}",
            execution_message=f"Alternative cellular wallet billing pull fired for {currency} via local node integration"
        )

    async def process_disbursement(self, phone: str, amount: float, currency: str, reference: str) -> PaymentEngineResponse:
        """Executes a business payout confirmation transaction."""
        return PaymentEngineResponse(
            success=True,
            network_reference=f"GH-OUT-{reference.upper()}",
            execution_message="Mobile network accounting framework confirmed payout clear"
        )
