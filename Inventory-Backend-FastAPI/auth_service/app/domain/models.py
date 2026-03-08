from common.domain.entity import Entity
from enum import Enum
from pydantic import Field

from common.domain.enums import Role

class User(Entity):
    username: str
    password_hash: str
    role: Role = Role.STAFF
    email: str
    is_active: bool = True

    model_config = {"from_attributes": True, "use_enum_values": True}
