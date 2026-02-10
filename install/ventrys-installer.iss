[Setup]
AppName=Ventrys Patrimônio
AppVersion=1.0.0
DefaultDirName={pf}\Ventrys
DefaultGroupName=Ventrys
OutputBaseFilename=Ventrys-Setup
Compression=lzma
SolidCompression=yes

[Files]
; Backend (build e banco inicial do cliente)
Source: "..\backend\dist\*"; DestDir: "{app}\backend\dist"; Flags: recursesubdirs ignoreversion
Source: "..\backend\package.json"; DestDir: "{app}\backend"; Flags: ignoreversion
Source: "..\backend\package-lock.json"; DestDir: "{app}\backend"; Flags: ignoreversion
; Usa o dev.db atual como base inicial e renomeia para patrimonio.db na instalação
Source: "..\backend\prisma\dev.db"; DestDir: "{app}\backend\prisma"; DestName: "patrimonio.db"; Flags: ignoreversion

; Frontend (build estático do Vite)
Source: "..\asset-guardian\dist\*"; DestDir: "{app}\frontend"; Flags: recursesubdirs ignoreversion

; Scripts de operação
Source: "..\iniciar-servidores.ps1"; DestDir: "{app}\scripts"; Flags: ignoreversion
Source: "..\parar-servidores.ps1"; DestDir: "{app}\scripts"; Flags: ignoreversion

[Icons]
; Atalho para iniciar backend+frontend
Name: "{group}\Iniciar Ventrys"; Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\scripts\iniciar-servidores.ps1"""; WorkingDir: "{app}"

; Atalho para parar backend+frontend
Name: "{group}\Parar Ventrys"; Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\scripts\parar-servidores.ps1"""; WorkingDir: "{app}"

; Atalho para abrir o painel web
Name: "{group}\Ventrys (Painel Web)"; Filename: "http://localhost:8080/"

[Run]
; Opcional: iniciar sistema logo após a instalação
Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\scripts\iniciar-servidores.ps1"""; WorkingDir: "{app}"; Flags: postinstall nowait skipifsilent

