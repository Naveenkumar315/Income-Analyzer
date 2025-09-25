@echo off
cd /d C:\Users\LDNA40022\Lokesh\Income-Analyzer

:: --- Start frontend (React) ---
start "Frontend" cmd /k "cd frontend && npm run dev"

:: --- Start MCP server ---
start "MCP Server" cmd /k "cd backend && call .venv\Scripts\activate && python mcp_server.py"

:: --- Wait for MCP server to start before main.py ---
echo Waiting 10 seconds for MCP server to initialize...
timeout /t 10 /nobreak >nul

:: --- Start main.py ---
start "Main API" cmd /k "cd backend && call .venv\Scripts\activate && python main.py"

exit
