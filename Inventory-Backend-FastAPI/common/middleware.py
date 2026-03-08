import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("api.middleware")

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)
            
        start_time = time.time()
        
        # Log request info
        path = request.url.path
        method = request.method
        client_host = request.client.host if request.client else "unknown"
        
        logger.info(f"Incoming {method} {path} from {client_host}")
        
        try:
            response = await call_next(request)
            
            process_time = (time.time() - start_time) * 1000
            status_code = response.status_code
            
            logger.info(
                f"Completed {method} {path} - {status_code} in {process_time:.2f}ms"
            )
            return response
            
        except Exception as e:
            process_time = (time.time() - start_time) * 1000
            logger.error(f"Failed {method} {path} - Error: {str(e)} after {process_time:.2f}ms")
            raise
