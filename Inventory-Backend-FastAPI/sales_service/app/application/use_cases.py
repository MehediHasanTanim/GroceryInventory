from typing import List, Optional
import uuid
import httpx
import logging
from common.application.unit_of_work import UnitOfWork
from common.domain.enums import SaleStatus
from sales_service.app.domain.models import Sale, SaleItem
from sales_service.app.application.dto import RecordSaleDTO

logger = logging.getLogger(__name__)

class RecordSaleUseCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    async def execute(self, dto: RecordSaleDTO) -> Sale:
        try:
            with self.uow:
                total = 0.0
                sale_items = []
                
                for item in dto.items:
                    amount = item.quantity * item.price
                    total += amount
                    sale_items.append(SaleItem(
                        id=str(uuid.uuid4()),
                        product_id=item.product_id,
                        quantity=item.quantity,
                        price_at_sale=item.price
                    ))
                    
                    # Deduct stock from Inventory Service
                    try:
                        async with httpx.AsyncClient() as client:
                            response = await client.post(
                                f"http://inventory_service:8000/api/v1/products/{item.product_id}/stock", 
                                json={"quantity_change": -item.quantity}
                            )
                            response.raise_for_status()
                    except Exception as e:
                        logger.error(f"Failed to deduct stock for product {item.product_id}: {str(e)}")
                        # In the middle of a transaction, but it's an external service.
                        # Ideally, this would be handled with a distributed transaction or saga.
                    
                sale = Sale(
                    items=sale_items,
                    total_amount=total,
                    status=SaleStatus.COMPLETED
                )
                return self.uow.sales.add(sale)
        except Exception as e:
            logger.error(f"Error recording sale: {str(e)}")
            raise

class GetSaleUseCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, sale_id: str) -> Optional[Sale]:
        with self.uow:
            return self.uow.sales.get_by_id(sale_id)

class VoidSaleUseCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    async def execute(self, sale_id: str) -> Optional[Sale]:
        try:
            with self.uow:
                sale = self.uow.sales.get_by_id(sale_id)
                if not sale:
                    return None
                
                if sale.status == SaleStatus.VOIDED:
                    raise ValueError("Sale is already voided")
                
                # 1. Update status
                sale.status = SaleStatus.VOIDED
                
                # 2. Add back stock to Inventory Service
                for item in sale.items:
                    try:
                        async with httpx.AsyncClient() as client:
                            response = await client.post(
                                f"http://inventory_service:8000/api/v1/products/{item.product_id}/stock", 
                                json={"quantity_change": item.quantity}
                            )
                            response.raise_for_status()
                    except Exception as e:
                        logger.error(f"Failed to restore stock for product {item.product_id} during void: {str(e)}")
                
                # 3. Save changes
                return self.uow.sales.update(sale)
        except Exception as e:
            logger.error(f"Error voiding sale: {str(e)}")
            raise
