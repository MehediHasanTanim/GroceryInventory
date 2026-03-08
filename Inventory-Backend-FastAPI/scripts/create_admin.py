
import sys
import os

# Add the project root to sys.path to allow imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from common.config import settings
from common.infrastructure.database import Database
from auth_service.app.infrastructure.uow import SqlAlchemyAuthUnitOfWork
from auth_service.app.application.auth_service import AuthService, pwd_context
from auth_service.app.application.dto import UserCreateDTO
from common.domain.enums import Role

def create_admin():
    if not settings.DATABASE_URL_AUTH:
        print("DATABASE_URL_AUTH is not set in .env")
        return

    db = Database(settings.DATABASE_URL_AUTH)
    uow = SqlAlchemyAuthUnitOfWork(db._session_factory)
    
    admin_username = "admin"
    admin_password = "AdminPassword123!"
    admin_email = "admin@example.com"

    try:
        with uow:
            existing = uow.users.get_by_username(admin_username)
            hashed_password = pwd_context.hash(admin_password)
            
            if existing:
                print(f"Admin user '{admin_username}' already exists. Updating password...")
                existing.password_hash = hashed_password
                existing.role = Role.ADMIN
                existing.email = admin_email
                uow.users.update(existing)
                print(f"Admin user '{admin_username}' updated successfully.")
            else:
                from auth_service.app.domain.models import User
                new_user = User(
                    username=admin_username,
                    email=admin_email,
                    password_hash=hashed_password,
                    role=Role.ADMIN
                )
                uow.users.add(new_user)
                print(f"Admin user '{admin_username}' created successfully.")
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")

if __name__ == "__main__":
    create_admin()
