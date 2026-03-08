from typing import Optional, List
import logging
from sqlalchemy.orm import Session
from common.domain.repository import Repository
from supplier_service.app.domain.models import Supplier
from supplier_service.app.infrastructure.persistence.models import SupplierModel, SupplierProductModel
import uuid

logger = logging.getLogger(__name__)

class SqlAlchemySupplierRepository(Repository[Supplier]):
    def __init__(self, db: Session):
        self.db = db

    def add(self, entity: Supplier) -> Supplier:
        logger.info(f"Adding new supplier: {entity.name}")
        db_supplier = SupplierModel(
            id=entity.id,
            name=entity.name,
            contact_email=entity.contact_email,
            phone=entity.phone,
            address=entity.address
        )
        self.db.add(db_supplier)
        # Add products
        for pid in entity.products:
            logger.debug(f"Linking product {pid} to new supplier {entity.id}")
            sp = SupplierProductModel(id=str(uuid.uuid4()), supplier_id=entity.id, product_id=pid)
            self.db.add(sp)
            
        return entity

    def get_by_id(self, id: str) -> Optional[Supplier]:
        logger.debug(f"Getting supplier by id: {id}")
        db_supplier = self.db.query(SupplierModel).filter(SupplierModel.id == id).first()
        if db_supplier:
            products = [sp.product_id for sp in db_supplier.products]
            return Supplier(
                id=db_supplier.id,
                name=db_supplier.name,
                contact_email=db_supplier.contact_email,
                phone=db_supplier.phone,
                address=db_supplier.address,
                products=products
            )
        return None

    def list(self, limit: int = 100, offset: int = 0) -> List[Supplier]:
        logger.debug(f"Listing suppliers with limit={limit}, offset={offset}")
        db_suppliers = self.db.query(SupplierModel).limit(limit).offset(offset).all()
        return [
            Supplier(
                id=s.id,
                name=s.name,
                contact_email=s.contact_email,
                phone=s.phone,
                address=s.address,
                products=[sp.product_id for sp in s.products]
            ) for s in db_suppliers
        ]

    def update(self, entity: Supplier) -> Supplier:
        logger.info(f"Updating supplier: {entity.name}")
        db_supplier = self.db.query(SupplierModel).filter(SupplierModel.id == entity.id).first()
        if db_supplier:
            db_supplier.name = entity.name
            db_supplier.contact_email = entity.contact_email
            db_supplier.phone = entity.phone
            db_supplier.address = entity.address
            
            # Intelligent Update for Products (Diffing)
            existing_product_ids = {sp.product_id for sp in db_supplier.products}
            new_product_ids = set(entity.products)

            to_add = new_product_ids - existing_product_ids
            to_remove = existing_product_ids - new_product_ids

            # Remove products that are no longer linked
            if to_remove:
                logger.info(f"Removing {len(to_remove)} product links from supplier {entity.id}")
                self.db.query(SupplierProductModel).filter(
                    SupplierProductModel.supplier_id == entity.id,
                    SupplierProductModel.product_id.in_(to_remove)
                ).delete(synchronize_session=False)

            # Add brand new products
            if to_add:
                logger.info(f"Adding {len(to_add)} new product links to supplier {entity.id}")
                for pid in to_add:
                    sp = SupplierProductModel(
                        id=str(uuid.uuid4()), 
                        supplier_id=entity.id, 
                        product_id=pid
                    )
                    self.db.add(sp)
                
        return entity

    def delete(self, id: str) -> bool:
        logger.info(f"Deleting supplier with id: {id}")
        db_supplier = self.db.query(SupplierModel).filter(SupplierModel.id == id).first()
        if db_supplier:
            self.db.delete(db_supplier)
            return True
        return False
