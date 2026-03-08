from pydantic import BaseModel
from typing import Optional, List

class CreateSupplierRequest(BaseModel):
    name: str
    contact_email: str
    phone: str
    address: Optional[str] = None

class UpdateSupplierRequest(BaseModel):
    name: str
    contact_email: str
    phone: str
    address: Optional[str] = None

class SupplierResponse(BaseModel):
    id: str
    name: str
    contact_email: str
    phone: str
    address: Optional[str]
    products: List[str]

    class Config:
        from_attributes = True

class LinkProductRequest(BaseModel):
    product_id: str
