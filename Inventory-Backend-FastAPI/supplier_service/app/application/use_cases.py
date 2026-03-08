from typing import List, Optional
import uuid
import logging
from common.application.unit_of_work import UnitOfWork
from supplier_service.app.domain.models import Supplier
from supplier_service.app.application.dto import SupplierCreateDTO, LinkProductDTO, SupplierUpdateDTO

logger = logging.getLogger(__name__)

class CreateSupplierUseCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, dto: SupplierCreateDTO) -> Supplier:
        try:
            with self.uow:
                supplier = Supplier(
                    id=str(uuid.uuid4()),
                    name=dto.name,
                    contact_email=dto.contact_email,
                    phone=dto.phone,
                    address=dto.address,
                    products=[]
                )
                created = self.uow.suppliers.add(supplier)
                return created
        except Exception as e:
            logger.error(f"Error creating supplier: {str(e)}")
            raise

class GetSupplierUseCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, supplier_id: str) -> Optional[Supplier]:
        with self.uow:
            return self.uow.suppliers.get_by_id(supplier_id)

class LinkProductToSupplierUseCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, dto: LinkProductDTO) -> Optional[Supplier]:
        try:
            with self.uow:
                supplier = self.uow.suppliers.get_by_id(dto.supplier_id)
                if supplier:
                    if dto.product_id not in supplier.products:
                        supplier.products.append(dto.product_id)
                        return self.uow.suppliers.update(supplier)
                    return supplier
                return None
        except Exception as e:
            logger.error(f"Error linking product to supplier: {str(e)}")
            raise


class GetAllSuppliersUseCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, limit: int = 100, offset: int = 0) -> List[Supplier]:
        with self.uow:
            return self.uow.suppliers.list(limit=limit, offset=offset)


class UpdateSupplierUseCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, supplier_id: str, dto: SupplierUpdateDTO) -> Optional[Supplier]:
        try:
            with self.uow:
                supplier = self.uow.suppliers.get_by_id(supplier_id)
                if not supplier:
                    return None
                supplier.name = dto.name
                supplier.contact_email = dto.contact_email
                supplier.phone = dto.phone
                supplier.address = dto.address
                return self.uow.suppliers.update(supplier)
        except Exception as e:
            logger.error(f"Error updating supplier: {str(e)}")
            raise


class DeleteSupplierUseCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, supplier_id: str) -> bool:
        try:
            with self.uow:
                return self.uow.suppliers.delete(supplier_id)
        except Exception as e:
            logger.error(f"Error deleting supplier: {str(e)}")
            raise
