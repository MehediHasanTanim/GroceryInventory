from common.domain.entity import Entity
from typing import Optional
from pydantic import Field

class Category(Entity):
    name: str
    description: Optional[str] = None

    model_config = {"from_attributes": True, "use_enum_values": True}

class Product(Entity):
    name: str
    description: Optional[str] = None
    price: float = Field(gt=0, description="Price must be greater than zero")
    sku: str = Field(..., description="Stock Keeping Unit")
    category_id: str
    discount: float = Field(default=0.0, ge=0, description="Discount percentage or amount")
    stock: Optional['Stock'] = None

    model_config = {"from_attributes": True, "use_enum_values": True}

class Stock(Entity):
    product_id: str
    quantity: int = Field(ge=0, description="Quantity cannot be negative")
    location: str = "Warehouse A"

    model_config = {"from_attributes": True, "use_enum_values": True}
