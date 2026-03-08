from pydantic import BaseModel
from typing import List
from datetime import datetime

from common.domain.enums import SaleStatus

class SaleItemRequest(BaseModel):
    product_id: str
    quantity: int
    price: float

class RecordSaleRequest(BaseModel):
    items: List[SaleItemRequest]

class SaleItemResponse(BaseModel):
    product_id: str
    quantity: int
    price_at_sale: float

class SaleResponse(BaseModel):
    id: str
    total_amount: float
    status: SaleStatus
    timestamp: datetime
    items: List[SaleItemResponse]

    class Config:
        from_attributes = True
