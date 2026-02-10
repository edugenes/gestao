@echo off
REM Inicia Backend e Frontend do Ventrys no ambiente de DESENVOLVIMENTO
REM Executar este arquivo a partir da pasta "gestao"

cd /d "%~dp0"

echo.
echo Iniciando servidores do Ventrys (desenvolvimento)...
echo.

powershell -ExecutionPolicy Bypass -File ".\iniciar-servidores.ps1"

echo.
echo Script de inicializacao encerrado.
pause

