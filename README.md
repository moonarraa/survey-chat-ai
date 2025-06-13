# SurveyChat Backend

Backend for SurveyChat: FastAPI + PostgreSQL + OpenAI

## Features
- User authentication (JWT)
- Survey dialog with AI (OpenAI GPT)
- PostgreSQL database
- Dockerized for easy setup

## Quick Start (Docker Compose)
```bash
git clone <repo_url>
cd backend
cp .env.example .env  # Add your OPENAI_API_KEY
# Edit .env with your OpenAI key

docker compose up --build
```
- FastAPI: [http://localhost:8000/docs](http://localhost:8000/docs)
- PostgreSQL: localhost:5432 (user: surveyuser, pass: surveypass, db: surveydb)

## Local Development
```bash
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn src.main:app --reload
```

## Environment Variables
- `OPENAI_API_KEY` — your OpenAI API key
- `DATABASE_URL` — PostgreSQL connection string

## Project Structure
```
backend/
  src/
    main.py
    auth/
    tasks/
    ...
  requirements.txt
  Dockerfile
  docker-compose.yml
  .env
```

---
**See [http://localhost:8000/docs](http://localhost:8000/docs) for API docs after launch.** 