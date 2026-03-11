from pydantic import BaseModel
from typing import Optional, List

# Category Schemas
class CreateCategoryRequest(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]

    class Config:
        from_attributes = True

# Create Product Request
class CreateProductRequest(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    sku: str
    category_id: str
    discount: float = 0.0

class UpdateProductRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    sku: Optional[str] = None
    category_id: Optional[str] = None
    discount: Optional[float] = None

# Stock Response
class StockResponse(BaseModel):
    id: str
    product_id: str
    quantity: int
    location: str

    class Config:
        from_attributes = True

# Product Response
class ProductResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    price: float
    discount: float
    sku: str
    category_id: str
    stock: Optional[StockResponse] = None

    class Config:
        from_attributes = True

# Stock Update Request
class UpdateStockRequest(BaseModel):
    quantity_change: int

# Stats Response
class InventoryStatsResponse(BaseModel):
    total_products: int
    low_stock_items: int
    total_value: float
