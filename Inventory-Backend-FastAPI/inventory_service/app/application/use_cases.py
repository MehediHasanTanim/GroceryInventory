from typing import List, Optional
import uuid
import logging
from common.application.unit_of_work import UnitOfWork
from inventory_service.app.domain.models import Product, Stock, Category
from inventory_service.app.application.dto import CategoryCreateDTO, ProductCreateDTO, ProductUpdateDTO, StockUpdateDTO

logger = logging.getLogger(__name__)

class CreateCategoryUseCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, dto: CategoryCreateDTO) -> Category:
        try:
            with self.uow:
                category = Category(
                    id=str(uuid.uuid4()),
                    name=dto.name,
                    description=dto.description
                )
                created = self.uow.categories.add(category)
                return created
        except Exception as e:
            logger.error(f"Error creating category: {str(e)}")
            raise

class GetCategoryUseCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, category_id: str) -> Optional[Category]:
        with self.uow:
            return self.uow.categories.get_by_id(category_id)

class ListCategoriesUseCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, limit: int = 100, offset: int = 0) -> List[Category]:
        with self.uow:
            return self.uow.categories.list(limit, offset)

class DeleteCategoryUseCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, category_id: str) -> bool:
        with self.uow:
            deleted = self.uow.categories.delete(category_id)
            if not deleted:
                raise ValueError(f"Category with ID {category_id} not found")
            return deleted

class CreateProductUseCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, dto: ProductCreateDTO) -> Product:
        try:
            with self.uow:
                # Validate category exists
                category = self.uow.categories.get_by_id(dto.category_id)
                if not category:
                    raise ValueError(f"Category with ID {dto.category_id} not found")
                    
                product = Product(
                    id=str(uuid.uuid4()),
                    name=dto.name,
                    description=dto.description,
                    price=dto.price,
                    sku=dto.sku,
                    category_id=dto.category_id
                )
                created_product = self.uow.products.add(product)
                return created_product
        except Exception as e:
            logger.error(f"Error creating product: {str(e)}")
            raise

class GetProductUseCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, product_id: str) -> Optional[Product]:
        with self.uow:
            return self.uow.products.get_by_id(product_id)

class UpdateStockUseCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, dto: StockUpdateDTO) -> Optional[Stock]:
        try:
            with self.uow:
                stock = self.uow.stocks.get_by_product_id(dto.product_id)
                if stock:
                    new_quantity = stock.quantity + dto.quantity_change
                    if new_quantity < 0:
                        raise ValueError("Stock cannot be negative")
                    stock.quantity = new_quantity
                    return self.uow.stocks.update(stock)
                return None
        except Exception as e:
            logger.error(f"Error updating stock: {str(e)}")
            raise

class ListProductsUseCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, limit: int = 100, offset: int = 0) -> List[Product]:
        with self.uow:
            return self.uow.products.list(limit, offset)

class UpdateProductUseCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, product_id: str, dto: ProductUpdateDTO) -> Optional[Product]:
        with self.uow:
            product = self.uow.products.get_by_id(product_id)
            if not product:
                return None
            
            update_data = dto.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(product, key, value)
                
            return self.uow.products.update(product)

class DeleteProductUseCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, product_id: str) -> bool:
        with self.uow:
            deleted = self.uow.products.delete(product_id)
            if not deleted:
                raise ValueError(f"Product with ID {product_id} not found")
            return deleted
