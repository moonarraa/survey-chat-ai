FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Make migration script executable
RUN chmod +x migrate.sh

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=8000
ENV WEBSITE_HOST=0.0.0.0
ENV WEBSITE_PORT=8000

# Expose port
EXPOSE 8000

# Start command
CMD ./migrate.sh && gunicorn src.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

