from pydantic import BaseModel
from typing import Optional, List

class SupplierCreateDTO(BaseModel):
    name: str
    contact_email: str
    phone: str
    address: Optional[str] = None

class SupplierUpdateDTO(BaseModel):
    name: str
    contact_email: str
    phone: str
    address: Optional[str] = None

class LinkProductDTO(BaseModel):
    supplier_id: str
    product_id: str
