@echo off
cd /d "%~dp0"
where py >nul 2>&1
if %errorlevel% equ 0 (
  py -3 start_course.py
) else (
  python start_course.py
)
if errorlevel 1 pause
