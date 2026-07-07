from abc import ABC, abstractmethod
from pydantic import BaseModel

class PaymentEngineResponse(BaseModel):
    success: bool
    network_reference: str
    execution_message: str

class PaymentProviderInterface(ABC):
    @abstractmethod
    async def initiate_stk_push(self, phone: string, amount: float, currency: str, reference: str) -> PaymentEngineResponse:
        """Fires an automated mobile remittance pull request to the target consumer terminal."""
        pass

    @abstractmethod
    async def process_disbursement(self, phone: str, amount: float, currency: str, reference: str) -> PaymentEngineResponse:
        """Executes a business payout transaction to transfer funds directly to a mobile device."""
        pass
