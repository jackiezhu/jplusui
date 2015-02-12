@IF EXIST "%~dp0\node\node.exe" (
  "%~dp0\node\node.exe"  "%~dp0\server\boot.js" %*
) ELSE (
  node  "%~dp0\server\boot.js" %*
)