from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Generator
from common.infrastructure.database import Database
from supplier_service.app.presentation.schemas import (
    CreateSupplierRequest,
    UpdateSupplierRequest,
    SupplierResponse,
    LinkProductRequest
)
from supplier_service.app.application.dto import SupplierCreateDTO, SupplierUpdateDTO, LinkProductDTO
from supplier_service.app.infrastructure.uow import SqlAlchemySupplierUnitOfWork
from supplier_service.app.application.use_cases import (
    CreateSupplierUseCase,
    GetSupplierUseCase,
    GetAllSuppliersUseCase,
    UpdateSupplierUseCase,
    DeleteSupplierUseCase,
    LinkProductToSupplierUseCase
)
from common.config import settings

DATABASE_URL = settings.DATABASE_URL_SUPPLIER
database = Database(DATABASE_URL)

def get_uow() -> Generator[SqlAlchemySupplierUnitOfWork, None, None]:
    uow = SqlAlchemySupplierUnitOfWork(database._session_factory)
    yield uow

router = APIRouter()

# ── List All ────────────────────────────────────────────────────────────────
@router.get("/suppliers", response_model=List[SupplierResponse])
def list_suppliers(limit: int = 100, offset: int = 0, uow: SqlAlchemySupplierUnitOfWork = Depends(get_uow)):
    use_case = GetAllSuppliersUseCase(uow)
    return use_case.execute(limit=limit, offset=offset)

# ── Get By ID ───────────────────────────────────────────────────────────────
@router.get("/suppliers/{supplier_id}", response_model=SupplierResponse)
def get_supplier(supplier_id: str, uow: SqlAlchemySupplierUnitOfWork = Depends(get_uow)):
    use_case = GetSupplierUseCase(uow)
    supplier = use_case.execute(supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier

# ── Create ──────────────────────────────────────────────────────────────────
@router.post("/suppliers", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
def create_supplier(request: CreateSupplierRequest, uow: SqlAlchemySupplierUnitOfWork = Depends(get_uow)):
    use_case = CreateSupplierUseCase(uow)
    try:
        dto = SupplierCreateDTO(
            name=request.name,
            contact_email=request.contact_email,
            phone=request.phone,
            address=request.address
        )
        return use_case.execute(dto)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")

# ── Update ──────────────────────────────────────────────────────────────────
@router.put("/suppliers/{supplier_id}", response_model=SupplierResponse)
def update_supplier(supplier_id: str, request: UpdateSupplierRequest, uow: SqlAlchemySupplierUnitOfWork = Depends(get_uow)):
    use_case = UpdateSupplierUseCase(uow)
    try:
        dto = SupplierUpdateDTO(
            name=request.name,
            contact_email=request.contact_email,
            phone=request.phone,
            address=request.address
        )
        supplier = use_case.execute(supplier_id, dto)
        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier not found")
        return supplier
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")

# ── Delete ──────────────────────────────────────────────────────────────────
@router.delete("/suppliers/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supplier(supplier_id: str, uow: SqlAlchemySupplierUnitOfWork = Depends(get_uow)):
    use_case = DeleteSupplierUseCase(uow)
    deleted = use_case.execute(supplier_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Supplier not found")

# ── Link Product ─────────────────────────────────────────────────────────────
@router.post("/suppliers/{supplier_id}/products", response_model=SupplierResponse)
def link_product(supplier_id: str, request: LinkProductRequest, uow: SqlAlchemySupplierUnitOfWork = Depends(get_uow)):
    use_case = LinkProductToSupplierUseCase(uow)
    try:
        dto = LinkProductDTO(
            supplier_id=supplier_id,
            product_id=request.product_id
        )
        supplier = use_case.execute(dto)
        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier not found")
        return supplier
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")
