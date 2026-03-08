from sqlalchemy import Column, String, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
from common.infrastructure.database import Base

class CategoryModel(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)

    products = relationship("ProductModel", back_populates="category", cascade="all, delete-orphan")

class ProductModel(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    sku = Column(String, unique=True, nullable=False)
    category_id = Column(String, ForeignKey("categories.id"), nullable=False)

    # Relationships
    category = relationship("CategoryModel", back_populates="products")
    stock = relationship("StockModel", back_populates="product", uselist=False, cascade="all, delete-orphan")

class StockModel(Base):
    __tablename__ = "stock"

    id = Column(String, primary_key=True)
    product_id = Column(String, ForeignKey("products.id"), unique=True, nullable=False)
    quantity = Column(Integer, default=0, nullable=False)
    location = Column(String, default="Warehouse A")

    product = relationship("ProductModel", back_populates="stock")
