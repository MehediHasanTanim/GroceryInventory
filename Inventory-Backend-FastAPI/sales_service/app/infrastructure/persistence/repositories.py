from typing import Optional, List
import logging
from sqlalchemy.orm import Session
from common.domain.repository import Repository
from sales_service.app.domain.models import Sale, SaleItem
from sales_service.app.infrastructure.persistence.models import SaleModel, SaleItemModel
import uuid

logger = logging.getLogger(__name__)

class SqlAlchemySaleRepository(Repository[Sale]):
    def __init__(self, db: Session):
        self.db = db

    def _map_to_domain(self, db_sale: SaleModel) -> Sale:
        items = [
            SaleItem(
                id=i.id,
                product_id=i.product_id,
                quantity=i.quantity,
                price_at_sale=i.price_at_sale
            ) for i in db_sale.items
        ]
        return Sale(
            id=db_sale.id,
            total_amount=db_sale.total_amount,
            status=db_sale.status,
            timestamp=db_sale.timestamp,
            items=items
        )

    def add(self, entity: Sale) -> Sale:
        logger.info(f"Adding new sale: {entity.id} (Total: {entity.total_amount})")
        db_sale = SaleModel(
            id=entity.id,
            total_amount=entity.total_amount,
            status=entity.status,
            timestamp=entity.timestamp
        )
        self.db.add(db_sale)
        for item in entity.items:
            logger.debug(f"Adding sale item: {item.product_id} x {item.quantity}")
            db_item = SaleItemModel(
                id=item.id,
                sale_id=entity.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price_at_sale=item.price_at_sale
            )
            self.db.add(db_item)
        return entity

    def get_by_id(self, id: str) -> Optional[Sale]:
        logger.debug(f"Getting sale by id: {id}")
        db_sale = self.db.query(SaleModel).filter(SaleModel.id == id).first()
        if db_sale:
            return self._map_to_domain(db_sale)
        return None

    def list(self, limit: int = 100, offset: int = 0) -> List[Sale]:
        logger.debug(f"Listing sales with limit={limit}, offset={offset}")
        db_sales = self.db.query(SaleModel).limit(limit).offset(offset).all()
        return [self._map_to_domain(s) for s in db_sales]

    def update(self, entity: Sale) -> Sale:
        logger.info(f"Updating sale: {entity.id} (Status: {entity.status})")
        db_sale = self.db.query(SaleModel).filter(SaleModel.id == entity.id).first()
        if db_sale:
            db_sale.status = entity.status
        return entity

    def delete(self, id: str) -> bool:
        logger.info(f"Deleting sale with id: {id}")
        db_sale = self.db.query(SaleModel).filter(SaleModel.id == id).first()
        if db_sale:
            self.db.delete(db_sale)
            return True
        return False
