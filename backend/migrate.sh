#!/bin/bash
echo "Running database migrations..."
cd /app
alembic upgrade head 