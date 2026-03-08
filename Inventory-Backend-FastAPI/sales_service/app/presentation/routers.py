from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Generator
from common.infrastructure.database import Database
from common.security import admin_required
from sales_service.app.presentation.schemas import RecordSaleRequest, SaleResponse
from sales_service.app.application.dto import RecordSaleDTO, SaleItemDTO
from sales_service.app.infrastructure.uow import SqlAlchemySalesUnitOfWork
from sales_service.app.application.use_cases import RecordSaleUseCase, GetSaleUseCase, VoidSaleUseCase
from common.config import settings

DATABASE_URL = settings.DATABASE_URL_SALES
database = Database(DATABASE_URL)

def get_uow() -> Generator[SqlAlchemySalesUnitOfWork, None, None]:
    uow = SqlAlchemySalesUnitOfWork(database._session_factory)
    yield uow

router = APIRouter()

@router.post("/sales", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
async def record_sale(request: RecordSaleRequest, uow: SqlAlchemySalesUnitOfWork = Depends(get_uow)):
    use_case = RecordSaleUseCase(uow)
    
    # Map Request Schema to DTO
    dto = RecordSaleDTO(
        items=[
            SaleItemDTO(
                product_id=i.product_id, 
                quantity=i.quantity, 
                price=i.price
            ) for i in request.items
        ]
    )
    try:
        return await use_case.execute(dto)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/sales/{sale_id}", response_model=SaleResponse)
def get_sale(sale_id: str, uow: SqlAlchemySalesUnitOfWork = Depends(get_uow)):
    use_case = GetSaleUseCase(uow)
    sale = use_case.execute(sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale

@router.post("/sales/{sale_id}/void", response_model=SaleResponse)
async def void_sale(sale_id: str, uow: SqlAlchemySalesUnitOfWork = Depends(get_uow), _ = Depends(admin_required)):
    use_case = VoidSaleUseCase(uow)
    try:
        sale = await use_case.execute(sale_id)
        if not sale:
            raise HTTPException(status_code=404, detail="Sale not found")
        return sale
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
