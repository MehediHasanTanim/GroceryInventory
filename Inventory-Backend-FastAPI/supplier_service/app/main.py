from fastapi import FastAPI
from supplier_service.app.presentation.routers import router, database
from common.logging_config import setup_logging
from common.middleware import LoggingMiddleware
from common.swagger_style import add_dark_swagger
from fastapi.middleware.cors import CORSMiddleware

# Initialize logging
setup_logging("supplier_service")

app = FastAPI(title="Antigravity Supplier Service", docs_url=None)

# Add Dark Swagger
add_dark_swagger(app, "Antigravity Supplier Service")

# Add logging middleware
app.add_middleware(LoggingMiddleware)

# Add CORS middleware (Outermost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")

@app.on_event("startup")
def on_startup():
    # database.create_database()
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
