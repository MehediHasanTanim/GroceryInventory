from enum import Enum

class Role(str, Enum):
    ADMIN = "admin"
    STAFF = "staff"

class SaleStatus(str, Enum):
    COMPLETED = "completed"
    VOIDED = "voided"
