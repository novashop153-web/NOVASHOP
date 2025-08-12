# Script pour générer les icônes PWA à partir d'une image source
# Utilisation: .\generate-icons.ps1 -SourceImage "chemin/vers/logo.png"

param(
    [string]$SourceImage = "https://i.ibb.co/0X8Yz2H/logo.png"
)

# Créer le dossier des icônes s'il n'existe pas
$iconsDir = "$PSScriptRoot\icons"
if (-not (Test-Path -Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir | Out-Null
}

# Télécharger l'image source si c'est une URL
if ($SourceImage.StartsWith("http")) {
    $tempFile = [System.IO.Path]::GetTempFileName() + ".png"
    try {
        Invoke-WebRequest -Uri $SourceImage -OutFile $tempFile
        $SourceImage = $tempFile
    } catch {
        Write-Error "Impossible de télécharger l'image source: $_"
        exit 1
    }
}

# Vérifier que le fichier source existe
if (-not (Test-Path -Path $SourceImage)) {
    Write-Error "Le fichier source n'existe pas: $SourceImage"
    exit 1
}

# Vérifier si ImageMagick est installé
$magick = Get-Command magick -ErrorAction SilentlyContinue
if (-not $magick) {
    Write-Host "Installation de ImageMagick..."
    winget install -e --id ImageMagick.ImageMagick --accept-package-agreements --accept-source-agreements
    $magick = Get-Command magick -ErrorAction SilentlyContinue
    if (-not $magick) {
        Write-Error "ImageMagick n'a pas pu être installé. Veuillez l'installer manuellement depuis https://imagemagick.org/"
        exit 1
    }
}

# Fonction pour redimensionner et sauvegarder l'icône
function Resize-Icon {
    param (
        [string]$InputPath,
        [int]$Size,
        [string]$OutputPath
    )
    
    Write-Host "Création de l'icône ${Size}x${Size}..."
    & magick convert "$InputPath" -resize "${Size}x${Size}^" -gravity center -extent ${Size}x${Size} -unsharp 0.5x0.5+0.5+0.008 -quality 100 "$OutputPath"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Erreur lors de la création de $OutputPath"
    }
}

# Tailles d'icônes à générer
$iconSizes = @(72, 96, 128, 144, 152, 192, 384, 512)

# Générer chaque icône
foreach ($size in $iconSizes) {
    $outputFile = Join-Path -Path $iconsDir -ChildPath "icon-${size}x${size}.png"
    Resize-Icon -InputPath $SourceImage -Size $size -OutputPath $outputFile
}

# Créer un favicon.ico
$faviconPath = Join-Path -Path $PSScriptRoot -ChildPath "favicon.ico"
Write-Host "Création du favicon.ico..."
& magick convert "$SourceImage" -resize "16x16" -unsharp 0.5x0.5+0.5+0.008 -quality 100 "$faviconPath"

# Nettoyage
if ($tempFile -and (Test-Path $tempFile)) {
    Remove-Item -Path $tempFile -Force
}

Write-Host "`nToutes les icônes ont été générées avec succès dans le dossier 'icons' !" -ForegroundColor Green
Write-Host "Icônes générées:" -ForegroundColor Cyan
Get-ChildItem -Path $iconsDir | Select-Object Name, @{Name="Taille";Expression={"$($_.Length/1KB) KB"}} | Format-Table -AutoSize
