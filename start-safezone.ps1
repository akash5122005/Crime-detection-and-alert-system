# SafeZone Full-Stack Startup Script
Write-Host "--- Starting SafeZone System ---" -ForegroundColor Cyan

# Start Backend
Write-Host "[1/2] Launching Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Start Frontend
Write-Host "[2/2] Launching Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Success! Backend and Frontend are launching in separate windows." -ForegroundColor Green
Write-Host "Press any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
