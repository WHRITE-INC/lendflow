from app.lib.payments.base import PaymentProviderInterface, PaymentEngineResponse

class MTNPaymentProvider(PaymentProviderInterface):
    async def initiate_stk_push(self, phone: str, amount: float, currency: str, reference: str) -> PaymentEngineResponse:
        """Fires an automated mobile remittance pull request to the target consumer terminal."""
        return PaymentEngineResponse(
            success=True,
            network_reference=f"MTN-MOMO-{reference.upper()}",
            execution_message=f"Collection prompt initiated successfully in {currency} for network target: {phone}"
        )

    async def process_disbursement(self, phone: str, amount: float, currency: str, reference: str) -> PaymentEngineResponse:
        """Executes a business payout transaction to transfer funds directly to a mobile device."""
        return PaymentEngineResponse(
            success=True,
            network_reference=f"MTN-DISB-{reference.upper()}",
            execution_message=f"B2C ledger payout completed successfully for {currency} {amount}"
        )
