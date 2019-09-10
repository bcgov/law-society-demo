@echo off
rem Debugging Configration:
rem - React UI served on localhost by node
rem - localhost/api REST URLs calls proxied to a DARS.UI server running in Visual Studio 2015

rem settings for DARS.UI REST API at http://localhost:58317/api/...
rem these environment variables are read in DARS.Client/server/main.js
set DARS_API_PROTOCOL=http
set DARS_API_HOST=localhost
set DARS_API_PORT=58317
set DARS_API_PATH=/

set DARS_USER=""
cmd /c gulp.bat %*
