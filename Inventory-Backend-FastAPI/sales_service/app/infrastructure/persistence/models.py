from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from common.infrastructure.database import Base
from datetime import datetime

class SaleModel(Base):
    __tablename__ = "sales"

    id = Column(String, primary_key=True)
    total_amount = Column(Float, nullable=False)
    status = Column(String, default="completed")
    timestamp = Column(DateTime, default=datetime.utcnow)

    items = relationship("SaleItemModel", back_populates="sale", cascade="all, delete-orphan")

class SaleItemModel(Base):
    __tablename__ = "sale_items"

    id = Column(String, primary_key=True)
    sale_id = Column(String, ForeignKey("sales.id"), nullable=False)
    product_id = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    price_at_sale = Column(Float, nullable=False)

    sale = relationship("SaleModel", back_populates="items")
