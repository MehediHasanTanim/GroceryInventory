from common.domain.entity import Entity
from typing import Optional, List
from pydantic import Field

class Supplier(Entity):
    name: str
    contact_email: str
    phone: str
    address: Optional[str] = None
    products: List[str] = Field(default_factory=list) # List of Product IDs
