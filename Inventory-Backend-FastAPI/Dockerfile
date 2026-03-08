FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Common Dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Codebase
COPY common ./common
COPY inventory_service ./inventory_service
COPY supplier_service ./supplier_service
COPY sales_service ./sales_service
COPY auth_service ./auth_service
COPY scripts ./scripts

# Environment variables
ENV PYTHONPATH=/app

# Default command (can be overridden)
CMD ["python", "inventory_service/app/main.py"]
