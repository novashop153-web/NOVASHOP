# Script de déploiement automatique pour NOVASHOP
# Ce script doit être exécuté depuis le dossier du projet

# Fonction pour afficher les messages en couleur
function Write-Color {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Color = "White"
    )
    
    Write-Host $Message -ForegroundColor $Color
}

# Vérifier si Git est installé
try {
    $gitVersion = git --version
    Write-Color "✓ Git est installé : $gitVersion" -Color Green
} catch {
    Write-Color "✗ Git n'est pas installé. Veuillez installer Git avant de continuer." -Color Red
    Write-Color "Téléchargez Git depuis : https://git-scm.com/download/win" -Color Yellow
    exit 1
}

# Vérifier si on est dans le bon dossier
$requiredFiles = @('index.html', 'manifest.json', 'sw.js', 'netlify.toml')
$missingFiles = $requiredFiles | Where-Object { -not (Test-Path -Path $_) }

if ($missingFiles.Count -gt 0) {
    Write-Color "✗ Fichiers manquants : $($missingFiles -join ', ')" -Color Red
    Write-Color "Assurez-vous d'exécuter ce script depuis le dossier du projet." -Color Yellow
    exit 1
}

# Demander les informations utilisateur
$userName = Read-Host -Prompt "Entrez votre nom d'utilisateur GitHub"
$userEmail = Read-Host -Prompt "Entrez votre email GitHub"
$repoUrl = "https://github.com/novashop153-web/NOVASHOP.git"

# Configurer Git
Write-Color "`nConfiguration de Git..." -Color Cyan
git config --global user.name $userName
git config --global user.email $userEmail

# Initialiser le dépôt Git
Write-Color "`nInitialisation du dépôt Git..." -Color Cyan
if (Test-Path -Path ".git") {
    Write-Color "✓ Dépôt Git déjà initialisé" -Color Green
} else {
    git init
    Write-Color "✓ Dépôt Git initialisé" -Color Green
}

# Ajouter tous les fichiers
Write-Color "`nAjout des fichiers..." -Color Cyan
git add .
Write-Color "✓ Fichiers ajoutés" -Color Green

# Faire un commit
Write-Color "`nCréation du commit..." -Color Cyan
$commitMessage = "Déploiement initial de NOVASHOP - $(Get-Date -Format 'dd/MM/yyyy HH:mm')"
git commit -m $commitMessage
Write-Color "✓ Commit créé : $commitMessage" -Color Green

# Ajouter le dépôt distant
Write-Color "`nConfiguration du dépôt distant..." -Color Cyan
$remoteExists = git remote -v | Select-String -Pattern "origin" -Quiet

if ($remoteExists) {
    git remote set-url origin $repoUrl
    Write-Color "✓ URL distante mise à jour" -Color Green
} else {
    git remote add origin $repoUrl
    Write-Color "✓ Dépôt distant ajouté" -Color Green
}

# Pousser vers GitHub
Write-Color "`nEnvoi des modifications vers GitHub..." -Color Cyan
try {
    git push -u origin main --force
    Write-Color "✓ Code poussé avec succès vers GitHub!" -Color Green
} catch {
    Write-Color "✗ Erreur lors du push vers GitHub. Essayez de créer une branche main :" -Color Red
    Write-Host "  git branch -M main" -ForegroundColor Yellow
    Write-Host "  git push -u origin main" -ForegroundColor Yellow
    exit 1
}

# Afficher les instructions finales
Write-Color "`n🎉 Déploiement terminé avec succès!" -Color Green
Write-Color "`nProchaines étapes :" -Color Cyan
Write-Color "1. Allez sur https://app.netlify.com/" -Color White
Write-Color "2. Connectez votre compte GitHub" -Color White
Write-Color "3. Sélectionnez le dépôt 'novashop153-web/NOVASHOP'" -Color White
Write-Color "4. Cliquez sur 'Deploy site'" -Color White
Write-Color "`nVotre site sera disponible à l'adresse : https://votre-site.netlify.app" -Color Yellow
