from typing import Optional, List
import logging
from sqlalchemy.orm import Session, joinedload
import uuid
from common.domain.repository import Repository
from inventory_service.app.domain.models import Product, Stock, Category
from inventory_service.app.infrastructure.persistence.models import ProductModel, StockModel, CategoryModel

logger = logging.getLogger(__name__)

class SqlAlchemyCategoryRepository(Repository[Category]):
    def __init__(self, db: Session):
        self.db = db

    def add(self, entity: Category) -> Category:
        logger.info(f"Adding new category: {entity.name}")
        db_category = CategoryModel(**entity.model_dump())
        self.db.add(db_category)
        return entity

    def get_by_id(self, id: str) -> Optional[Category]:
        logger.debug(f"Getting category by id: {id}")
        db_category = self.db.query(CategoryModel).filter(CategoryModel.id == id).first()
        return Category.model_validate(db_category) if db_category else None

    def get_by_name(self, name: str) -> Optional[Category]:
        logger.debug(f"Getting category by name: {name}")
        db_category = self.db.query(CategoryModel).filter(CategoryModel.name == name).first()
        return Category.model_validate(db_category) if db_category else None

    def list(self, limit: int = 100, offset: int = 0) -> List[Category]:
        logger.debug(f"Listing categories with limit={limit}, offset={offset}")
        db_categories = self.db.query(CategoryModel).limit(limit).offset(offset).all()
        return [Category.model_validate(c) for c in db_categories]

    def update(self, entity: Category) -> Category:
        logger.info(f"Updating category: {entity.name}")
        db_category = self.db.query(CategoryModel).filter(CategoryModel.id == entity.id).first()
        if db_category:
            for key, value in entity.model_dump().items():
                setattr(db_category, key, value)
        return entity

    def delete(self, id: str) -> bool:
        logger.info(f"Deleting category with id: {id}")
        db_category = self.db.query(CategoryModel).filter(CategoryModel.id == id).first()
        if db_category:
            self.db.delete(db_category)
            return True
        return False

class SqlAlchemyProductRepository(Repository[Product]):
    def __init__(self, db: Session):
        self.db = db

    def add(self, entity: Product) -> Product:
        logger.info(f"Adding new product: {entity.name} (SKU: {entity.sku})")
        # Exclude stock as it's a relationship handled separately
        data = entity.model_dump(exclude={'stock'})
        db_product = ProductModel(**data)
        self.db.add(db_product)
        
        db_stock = StockModel(
            id=str(uuid.uuid4()),
            product_id=entity.id,
            quantity=0
        )
        self.db.add(db_stock)
        return entity

    def get_by_id(self, id: str) -> Optional[Product]:
        logger.debug(f"Getting product by id: {id}")
        db_product = self.db.query(ProductModel).options(joinedload(ProductModel.stock)).filter(ProductModel.id == id).first()
        return Product.model_validate(db_product) if db_product else None

    def list(self, limit: int = 100, offset: int = 0) -> List[Product]:
        logger.debug(f"Listing products with limit={limit}, offset={offset}")
        db_products = self.db.query(ProductModel).options(joinedload(ProductModel.stock)).limit(limit).offset(offset).all()
        return [Product.model_validate(p) for p in db_products]

    def update(self, entity: Product) -> Product:
        logger.info(f"Updating product: {entity.name}")
        db_product = self.db.query(ProductModel).filter(ProductModel.id == entity.id).first()
        if db_product:
            # Exclude stock as it's a relationship handled separately
            update_data = entity.model_dump(exclude={'stock', 'id'})
            for key, value in update_data.items():
                setattr(db_product, key, value)
        return entity

    def delete(self, id: str) -> bool:
        logger.info(f"Deleting product with id: {id}")
        db_product = self.db.query(ProductModel).filter(ProductModel.id == id).first()
        if db_product:
            self.db.delete(db_product)
            return True
        return False

class SqlAlchemyStockRepository(Repository[Stock]):
    def __init__(self, db: Session):
        self.db = db

    def add(self, entity: Stock) -> Stock:
        logger.info(f"Adding new stock record for product: {entity.product_id}")
        db_stock = StockModel(**entity.model_dump())
        self.db.add(db_stock)
        return entity

    def get_by_id(self, id: str) -> Optional[Stock]:
        logger.debug(f"Getting stock by id: {id}")
        db_stock = self.db.query(StockModel).filter(StockModel.id == id).first()
        return Stock.model_validate(db_stock) if db_stock else None

    def get_by_product_id(self, product_id: str) -> Optional[Stock]:
        logger.debug(f"Getting stock by product_id: {product_id}")
        db_stock = self.db.query(StockModel).filter(StockModel.product_id == product_id).first()
        return Stock.model_validate(db_stock) if db_stock else None

    def list(self, limit: int = 100, offset: int = 0) -> List[Stock]:
        logger.debug(f"Listing stocks with limit={limit}, offset={offset}")
        db_stocks = self.db.query(StockModel).limit(limit).offset(offset).all()
        return [Stock.model_validate(s) for s in db_stocks]
        
    def update(self, entity: Stock) -> Stock:
        logger.info(f"Updating stock for product: {entity.product_id} (New Quantity: {entity.quantity})")
        db_stock = self.db.query(StockModel).filter(StockModel.product_id == entity.product_id).first()
        if db_stock:
            for key, value in entity.model_dump().items():
                setattr(db_stock, key, value)
        return entity

    def delete(self, id: str) -> bool:
        logger.info(f"Deleting stock record with id: {id}")
        db_stock = self.db.query(StockModel).filter(StockModel.id == id).first()
        if db_stock:
            self.db.delete(db_stock)
            return True
        return False
