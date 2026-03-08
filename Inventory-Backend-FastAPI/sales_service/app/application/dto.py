from pydantic import BaseModel
from typing import List

class SaleItemDTO(BaseModel):
    product_id: str
    quantity: int
    price: float

class RecordSaleDTO(BaseModel):
    items: List[SaleItemDTO]
