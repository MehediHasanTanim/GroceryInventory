from fastapi import FastAPI
from auth_service.app.presentation.routers import router, database
from common.logging_config import setup_logging
from common.middleware import LoggingMiddleware
from common.swagger_style import add_custom_swagger
from fastapi.middleware.cors import CORSMiddleware

# Initialize logging
setup_logging("auth_service")

app = FastAPI(title="Antigravity Auth Service", docs_url=None)

# Add Custom Swagger
add_custom_swagger(app, "Antigravity Auth Service")

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
    uvicorn.run(app, host="0.0.0.0", port=8003)
