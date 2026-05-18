# SafeZone Full-Stack Startup Script (Native Non-Docker Version)
Clear-Host
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   SAFEZONE CRIME DETECTION & ALERTS     " -ForegroundColor Cyan
Write-Host "       (Native Windows Environment)      " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Dependency Checks
Write-Host "`n[+] Checking dependencies..." -ForegroundColor White

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "[-] Node.js is not installed! Please install Node.js 18+." -ForegroundColor Red
    Exit
}
Write-Host "  * Node.js: OK" -ForegroundColor Green

$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    Write-Host "[-] Python is not installed! Please install Python 3.10+." -ForegroundColor Red
    Exit
}
Write-Host "  * Python: OK ($($python.Version))" -ForegroundColor Green

# 2. Database check
$envPath = "backend\.env"
if (Test-Path $envPath) {
    $dbUrl = Select-String -Path $envPath -Pattern "^DATABASE_URL="
    if ($dbUrl -match "prisma\+postgres://localhost") {
        Write-Host "`n[!] Warning: You are using the Docker Prisma Dev Link." -ForegroundColor Yellow
        Write-Host "    Since we are not using Docker, you need a standard PostgreSQL database." -ForegroundColor Yellow
        Write-Host "    We highly recommend creating a FREE cloud database at https://neon.tech" -ForegroundColor Yellow
        Write-Host "    Once created, paste your new connection string into: backend\.env" -ForegroundColor Yellow
    }
}

# 3. Setup Python Virtual Environment for ML-Service
Write-Host "`n[+] Setting up Python ML Service environment..." -ForegroundColor White
if (-not (Test-Path "ml-service\venv")) {
    Write-Host "  * Creating virtual environment (venv)..." -ForegroundColor Yellow
    Start-Process python -ArgumentList "-m venv ml-service\venv" -NoNewWindow -Wait
}

Write-Host "  * Installing Python dependencies..." -ForegroundColor Yellow
Start-Process "ml-service\venv\Scripts\pip.exe" -ArgumentList "install -r ml-service\requirements.txt" -NoNewWindow -Wait
Write-Host "  * ML environment ready!" -ForegroundColor Green

# 4. Launching Services
Write-Host "`n[+] Launching all services..." -ForegroundColor Cyan

# Service 1: Node.js Backend
Write-Host "  -> Launching Backend API on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; Title SafeZone-Backend; npm run dev"

# Service 2: FastAPI ML Service
Write-Host "  -> Launching ML Microservice on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ml-service; Title SafeZone-ML-Service; .\venv\Scripts\activate; uvicorn main:app --reload --port 8000"

# Service 3: Vite Frontend
Write-Host "  -> Launching React Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; Title SafeZone-Frontend; npm run dev"

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host " SUCCESS: All services have launched in new windows!" -ForegroundColor Green
Write-Host "  * Dashboard: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  * Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "  * ML API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Green

Write-Host "`nPress any key to close this manager..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
