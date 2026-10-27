@echo off
setlocal
cd /d "%~dp0"
if not exist "server\.env" (
  copy "server\.env.example" "server\.env" >nul
  echo Created server\.env from the example.
  echo IMPORTANT: Edit server\.env and replace JWT_SECRET before starting the backend.
  notepad "server\.env"
)
echo Installing dependencies and starting Agri-Tech...
if not exist "client\node_modules" (
  start "AgriTech Client Setup" cmd /k "cd /d %~dp0client && npm install && npm run dev"
) else (
  start "AgriTech Client" cmd /k "cd /d %~dp0client && npm run dev"
)
if not exist "server\node_modules" (
  start "AgriTech Server Setup" cmd /k "cd /d %~dp0server && npm install && npm run dev"
) else (
  start "AgriTech Server" cmd /k "cd /d %~dp0server && npm run dev"
)
echo Two terminal windows have been opened.
echo Ensure MongoDB is running. If backend startup fails, check server\.env and MongoDB.
endlocal
