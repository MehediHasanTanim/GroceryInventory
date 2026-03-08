from abc import ABC, abstractmethod
from typing import Generic, TypeVar, List, Optional
from common.domain.entity import Entity

T = TypeVar("T", bound=Entity)

class Repository(ABC, Generic[T]):
    """
    Generic Repository Interface.
    """

    @abstractmethod
    def add(self, entity: T) -> T:
        pass

    @abstractmethod
    def get_by_id(self, id: str) -> Optional[T]:
        pass

    @abstractmethod
    def list(self, limit: int = 100, offset: int = 0) -> List[T]:
        pass

    @abstractmethod
    def update(self, entity: T) -> T:
        pass

    @abstractmethod
    def delete(self, id: str) -> bool:
        pass
