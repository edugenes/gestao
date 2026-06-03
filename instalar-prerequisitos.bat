@echo off
REM ============================================================
REM  Instalador de pré-requisitos do Ventrys (ambiente Windows)
REM  Uso: executar este .bat dentro da pasta "gestao"
REM ============================================================

cd /d "%~dp0"

echo.
echo ============================================
echo  Ventrys - Instalacao de pre-requisitos
echo ============================================
echo.

REM 1) Verificar Node.js
echo Verificando Node.js...
node -v >NUL 2>&1
IF %ERRORLEVEL% NEQ 0 (
  echo.
  echo Node.js nao encontrado no sistema.
  echo.
  echo Tentando instalar Node.js LTS via winget...
  winget -v >NUL 2>&1
  IF %ERRORLEVEL% EQU 0 (
    winget install -e --id OpenJS.NodeJS.LTS -h
  ) ELSE (
    echo.
    echo Nao foi possivel encontrar o winget neste computador.
    echo Instale manualmente o Node.js LTS (https://nodejs.org/) e execute este .bat novamente.
    echo.
    pause
    goto :EOF
  )
)

echo.
echo Node.js detectado. Prosseguindo com instalacao das dependencias...
echo.

REM 2) Instalar dependencias do backend
echo Instalando dependencias do backend...
cd "backend"
npm install
IF %ERRORLEVEL% NEQ 0 (
  echo.
  echo ERRO ao instalar dependencias do backend.
  echo Corrija o problema acima e execute este .bat novamente.
  echo.
  pause
  goto :EOF
)

REM 3) Instalar dependencias do frontend
echo.
echo Instalando dependencias do frontend...
cd "..\asset-guardian"
npm install
IF %ERRORLEVEL% NEQ 0 (
  echo.
  echo ERRO ao instalar dependencias do frontend.
  echo Corrija o problema acima e execute este .bat novamente.
  echo.
  pause
  goto :EOF
)

echo.
echo ============================================
echo  Pre-requisitos instalados com sucesso.
echo  Agora voce pode usar o iniciar-servidores.bat
echo ============================================
echo.
pause

