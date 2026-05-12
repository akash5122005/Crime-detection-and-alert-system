# SafeZone — Crime & Anomaly Detection System

A full-stack AI-powered crime reporting and anomaly detection platform.

## Architecture

- **Frontend**: React (Vite), Tailwind CSS, Leaflet.js, Chart.js, Socket.IO Client
- **Backend API**: Node.js + Express, PostgreSQL, Redis, Socket.IO
- **ML Service**: Python, FastAPI, scikit-learn (Isolation Forest)

## Features
- Real-time crime anomaly detection using Isolation Forest
- Interactive crime heatmap and dashboards
- Real-time alerts via WebSockets
- Role-based Access Control (Admin, Analyst, Field Officer)
- Incident reporting and management

## Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.10+

## Local Setup

### 1. Environment Variables
Copy the `.env.example` files to `.env` in each respective directory:
- `backend/.env`
- `frontend/.env`
- `ml-service/.env`

### 2. Run with Docker Compose
From the root directory:
```bash
docker-compose up --build
```
This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend (port 5000)
- ML Service (port 8000)
- Frontend (port 5173)

### 3. Database Seeding
To test with synthetic data, run the seed script from the backend:
```bash
cd backend
npm run seed
```

## Accessing the Application
- **Frontend Dashboard**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **ML Service API Docs**: `http://localhost:8000/docs`
