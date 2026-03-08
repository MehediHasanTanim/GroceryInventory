from common.domain.entity import Entity
from typing import List
from datetime import datetime
from pydantic import Field
from common.domain.enums import SaleStatus

class SaleItem(Entity):
    product_id: str
    quantity: int = Field(gt=0)
    price_at_sale: float = Field(gt=0)

    model_config = {"from_attributes": True, "use_enum_values": True}

class Sale(Entity):
    items: List[SaleItem]
    total_amount: float
    status: SaleStatus = SaleStatus.COMPLETED
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"from_attributes": True, "use_enum_values": True}
