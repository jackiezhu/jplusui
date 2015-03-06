@IF EXIST "%~dp0\node\node.exe" (
  "%~dp0\node\node.exe"  "%~dp0\node\node_modules\xuld-webserver\bin\serverboot.js" %*
) ELSE (
  node  "%~dp0\node\node_modules\xuld-webserver\bin\serverboot.js" %*
)