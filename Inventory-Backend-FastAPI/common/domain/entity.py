from typing import Any
import uuid
from pydantic import BaseModel, Field

class Entity(BaseModel):
    """
    Base class for Domain Entities.
    Entities are identified by their ID, not their attributes.
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    def __eq__(self, other: Any) -> bool:
        if isinstance(other, Entity):
            return self.id == other.id
        return False

    def __hash__(self) -> int:
        return hash(self.id)
