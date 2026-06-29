@echo off
echo Installing requirements...
pip install -r requirements.txt
echo.
echo Starting AI Server on port 8000...
python main.py
pause
