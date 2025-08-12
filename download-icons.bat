@echo off
setlocal enabledelayedexpansion

REM Créer le dossier des icônes s'il n'existe pas
if not exist "icons" mkdir icons

REM Télécharger l'image source
curl -o "logo.png" https://i.ibb.co/0X8Yz2H/logo.png

REM Vérifier si curl a réussi
if errorlevel 1 (
    echo Erreur lors du téléchargement du logo.
    exit /b 1
)

echo Téléchargement des icônes...

REM Télécharger chaque icône avec la bonne taille
curl -o "icons/icon-72x72.png" https://i.ibb.co/0X8Yz2H/logo.png?width=72&height=72
curl -o "icons/icon-96x96.png" https://i.ibb.co/0X8Yz2H/logo.png?width=96&height=96
curl -o "icons/icon-128x128.png" https://i.ibb.co/0X8Yz2H/logo.png?width=128&height=128
curl -o "icons/icon-144x144.png" https://i.ibb.co/0X8Yz2H/logo.png?width=144&height=144
curl -o "icons/icon-152x152.png" https://i.ibb.co/0X8Yz2H/logo.png?width=152&height=152
curl -o "icons/icon-192x192.png" https://i.ibb.co/0X8Yz2H/logo.png?width=192&height=192
curl -o "icons/icon-384x384.png" https://i.ibb.co/0X8Yz2H/logo.png?width=384&height=384
curl -o "icons/icon-512x512.png" https://i.ibb.co/0X8Yz2H/logo.png?width=512&height=512

REM Créer un favicon.ico (copie de l'icône 16x16)
copy "icons/icon-16x16.png" "favicon.ico" >nul 2>&1 || (
    echo Impossible de créer le favicon.ico
)

echo.
echo Toutes les icônes ont été téléchargées avec succès dans le dossier 'icons' !
echo.
dir /b icons

endlocal
