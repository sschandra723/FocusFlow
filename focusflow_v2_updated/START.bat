@echo off
echo.
echo  Starting FocusFlow with HTTPS...
echo.
echo  After starting, open: https://localhost:3000
echo.
echo  FIRST TIME: Browser will warn "Not secure"
echo  Click: Advanced ^> Proceed to localhost (unsafe)
echo  This is safe - it is your own local server.
echo.
node server.js
pause
