FROM python:3.11-slim

# Установка зависимостей
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем проект
COPY . .

# Делаем скрипт миграции исполняемым
RUN chmod +x migrate.sh

# Открываем порт
EXPOSE 8000

# Запуск миграций и сервера
CMD ./migrate.sh && uvicorn src.main:app --host 0.0.0.0 --port $PORT
