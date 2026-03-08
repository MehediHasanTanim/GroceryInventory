from pydantic import BaseModel
from typing import Optional

class CategoryCreateDTO(BaseModel):
    name: str
    description: Optional[str] = None

class ProductCreateDTO(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    sku: str
    category_id: str
    discount: float = 0.0

class ProductUpdateDTO(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    sku: Optional[str] = None
    category_id: Optional[str] = None
    discount: Optional[float] = None

class StockUpdateDTO(BaseModel):
    product_id: str
    quantity_change: int
