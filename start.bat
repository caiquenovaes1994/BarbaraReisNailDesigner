@echo off
echo ========================================================
echo  Iniciando o Sistema Barbara Reis Nail Designer...
echo ========================================================

echo.
echo [1/2] Iniciando o Servidor Backend (Node.js)...
start "Backend - API" cmd /k "cd backend && node src/index.js"

echo [2/2] Iniciando o Servidor Frontend (Vite)...
start "Frontend - React" cmd /k "cd frontend && npm run dev"

echo.
echo Servidores iniciados em novas janelas!
echo - Backend rodando na porta 3001
echo - Frontend disponivel no navegador
echo.
pause
