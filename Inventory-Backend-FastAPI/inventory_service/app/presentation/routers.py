from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Generator
from common.infrastructure.database import Database
from common.security import admin_required
from inventory_service.app.presentation.schemas import (
    CreateProductRequest, ProductResponse, UpdateProductRequest,
    UpdateStockRequest, StockResponse,
    CreateCategoryRequest, CategoryResponse
)
from inventory_service.app.application.dto import CategoryCreateDTO, ProductCreateDTO, ProductUpdateDTO, StockUpdateDTO
from inventory_service.app.infrastructure.uow import SqlAlchemyInventoryUnitOfWork
from inventory_service.app.application.use_cases import (
    CreateProductUseCase, GetProductUseCase, UpdateProductUseCase,
    UpdateStockUseCase, ListProductsUseCase, DeleteProductUseCase,
    CreateCategoryUseCase, GetCategoryUseCase, ListCategoriesUseCase,
    DeleteCategoryUseCase
)
from common.config import settings

DATABASE_URL = settings.DATABASE_URL_INVENTORY
database = Database(DATABASE_URL)

def get_uow() -> Generator[SqlAlchemyInventoryUnitOfWork, None, None]:
    uow = SqlAlchemyInventoryUnitOfWork(database._session_factory)
    yield uow

router = APIRouter()

# --- Category Endpoints ---

@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(request: CreateCategoryRequest, uow: SqlAlchemyInventoryUnitOfWork = Depends(get_uow), _ = Depends(admin_required)):
    use_case = CreateCategoryUseCase(uow)
    try:
        dto = CategoryCreateDTO(
            name=request.name,
            description=request.description
        )
        return use_case.execute(dto)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/categories", response_model=List[CategoryResponse])
def list_categories(limit: int = 100, offset: int = 0, uow: SqlAlchemyInventoryUnitOfWork = Depends(get_uow)):
    use_case = ListCategoriesUseCase(uow)
    return use_case.execute(limit, offset)

@router.get("/categories/{category_id}", response_model=CategoryResponse)
def get_category(category_id: str, uow: SqlAlchemyInventoryUnitOfWork = Depends(get_uow)):
    use_case = GetCategoryUseCase(uow)
    category = use_case.execute(category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: str, uow: SqlAlchemyInventoryUnitOfWork = Depends(get_uow), _ = Depends(admin_required)):
    use_case = DeleteCategoryUseCase(uow)
    try:
        use_case.execute(category_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

# --- Product Endpoints ---

@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(request: CreateProductRequest, uow: SqlAlchemyInventoryUnitOfWork = Depends(get_uow)):
    use_case = CreateProductUseCase(uow)
    try:
        dto = ProductCreateDTO(
            name=request.name,
            description=request.description,
            price=request.price,
            sku=request.sku,
            category_id=request.category_id,
            discount=request.discount
        )
        return use_case.execute(dto)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, uow: SqlAlchemyInventoryUnitOfWork = Depends(get_uow)):
    use_case = GetProductUseCase(uow)
    product = use_case.execute(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/products", response_model=List[ProductResponse])
def list_products(limit: int = 100, offset: int = 0, uow: SqlAlchemyInventoryUnitOfWork = Depends(get_uow)):
    use_case = ListProductsUseCase(uow)
    return use_case.execute(limit, offset)

@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: str, request: UpdateProductRequest, uow: SqlAlchemyInventoryUnitOfWork = Depends(get_uow)):
    use_case = UpdateProductUseCase(uow)
    try:
        dto = ProductUpdateDTO(**request.model_dump(exclude_unset=True))
        product = use_case.execute(product_id, dto)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: str, uow: SqlAlchemyInventoryUnitOfWork = Depends(get_uow), _ = Depends(admin_required)):
    use_case = DeleteProductUseCase(uow)
    try:
        use_case.execute(product_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/products/{product_id}/stock", response_model=StockResponse)
def update_stock(product_id: str, request: UpdateStockRequest, uow: SqlAlchemyInventoryUnitOfWork = Depends(get_uow)):
    use_case = UpdateStockUseCase(uow)
    try:
        dto = StockUpdateDTO(
            product_id=product_id,
            quantity_change=request.quantity_change
        )
        updated_stock = use_case.execute(dto)
        if not updated_stock:
             raise HTTPException(status_code=404, detail="Product/Stock not found")
        return updated_stock
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
