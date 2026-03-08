from sqlalchemy import Column, String, Table, ForeignKey
from sqlalchemy.orm import relationship
from common.infrastructure.database import Base

# Many-to-Many relationship table if we wanted strict FKs, but since Product is in another service, 
# we store a list of product IDs or a bridging table with loose coupling. 
# For simplicity, let's assume we store a JSON list or a simple association table 
# where product_id is just a generic string.

class SupplierModel(Base):
    __tablename__ = "suppliers"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    contact_email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    
    # Simple way to store related product IDs if we stick to Postgres features like ARRAY, 
    # but for generic SQL compatibility we might use a child table.
    # Let's use a child table for "SupplierProduct"
    products = relationship("SupplierProductModel", back_populates="supplier", cascade="all, delete-orphan")

class SupplierProductModel(Base):
    __tablename__ = "supplier_products"
    
    id = Column(String, primary_key=True)
    supplier_id = Column(String, ForeignKey("suppliers.id"), nullable=False)
    product_id = Column(String, nullable=False) # External ID from Inventory Service
    
    supplier = relationship("SupplierModel", back_populates="products")
