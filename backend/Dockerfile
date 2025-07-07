# Forcing a clean rebuild on Railway by adding a comment
FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt ./
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

# Start command uses the PORT environment variable provided by Railway
CMD ./migrate.sh && uvicorn src.main:app --host 0.0.0.0 --port $PORT

