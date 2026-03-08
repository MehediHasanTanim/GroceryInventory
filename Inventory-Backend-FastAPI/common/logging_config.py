import logging
import sys
import os
import shutil
from logging.handlers import RotatingFileHandler
from datetime import datetime, timedelta

def setup_logging(service_name: str, log_level=logging.INFO):
    logger = logging.getLogger()
    logger.setLevel(log_level)

    # Formatter
    formatter = logging.Formatter(
        '[%(asctime)s] [%(levelname)s] [%(name)s] [%(process)d] - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # 1. Stream Handler (Stdout) - For Docker Logs
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)

    # 2. File Handler with Daily Directory + Size Rotation
    base_log_dir = "/app/logs"
    
    if os.path.exists(base_log_dir) or os.access("/app", os.W_OK):
        if not os.path.exists(base_log_dir):
            os.makedirs(base_log_dir, exist_ok=True)
            
        # --- PURGE POLICY (7 Days) ---
        # Scan for date-based directories and remove if older than 7 days
        try:
            today = datetime.now().date()
            retention_delta = timedelta(days=7)
            
            for entry in os.listdir(base_log_dir):
                entry_path = os.path.join(base_log_dir, entry)
                if os.path.isdir(entry_path):
                    try:
                        # Try to parse directory name as date
                        dir_date = datetime.strptime(entry, '%Y-%m-%d').date()
                        if today - dir_date > retention_delta:
                            shutil.rmtree(entry_path)
                            print(f"Purged old log directory: {entry_path}")
                    except ValueError:
                        # Not a date directory, skip
                        continue
        except Exception as e:
            print(f"Error during log purge: {e}")

        # --- DAILY DIRECTORY ---
        date_str = datetime.now().strftime('%Y-%m-%d')
        daily_log_dir = os.path.join(base_log_dir, date_str)
        if not os.path.exists(daily_log_dir):
            os.makedirs(daily_log_dir, exist_ok=True)

        # --- SIZE-BASED ROTATION ---
        log_file = os.path.join(daily_log_dir, f"{service_name}.log")
        
        # maxBytes: 10MB, backupCount: 10
        file_handler = RotatingFileHandler(
            log_file,
            maxBytes=10 * 1024 * 1024, # 10MB
            backupCount=10,
            encoding='utf-8',
            delay=True
        )
        
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    # Reduce noise from third-party libraries
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.INFO)

    return logger
