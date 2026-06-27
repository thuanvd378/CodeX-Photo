@echo off
setlocal
cd /d "%~dp0"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\run-codex-photo.ps1"

set EXIT_CODE=%ERRORLEVEL%
if not "%EXIT_CODE%"=="0" (
  echo.
  echo CodeX Photo stopped with exit code %EXIT_CODE%.
  echo Read the message above, then press any key to close this window.
  pause >nul
)

exit /b %EXIT_CODE%
