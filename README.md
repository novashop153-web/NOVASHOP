# Application Web NOVASHOP

Cette application web redirige automatiquement les utilisateurs vers la boutique en ligne NOVASHOP.

## Fonctionnalités

- Redirection automatique vers NOVASHOP
- Écran de chargement avec logo
- Installation en tant qu'application (PWA) sur mobile et desktop
- Mode hors ligne basique

## Déploiement sur Netlify

1. Créez un compte sur [Netlify](https://www.netlify.com/) si vous n'en avez pas
2. Connectez votre compte GitHub/GitLab/Bitbucket ou déposez simplement le dossier `Novashop` sur Netlify Drag & Drop
3. Une fois déployé, vous recevrez une URL (par exemple : `votre-nom.netlify.app`)
4. Pour un nom de domaine personnalisé, allez dans "Domain settings" et suivez les instructions

## Installation sur mobile

### Sur Android :
1. Ouvrez l'application dans Chrome
2. Appuyez sur le menu (trois points)
3. Sélectionnez "Ajouter à l'écran d'accueil"
4. Suivez les instructions pour installer l'application

### Sur iOS :
1. Ouvrez l'application dans Safari
2. Appuyez sur l'icône de partage
3. Faites défiler vers le bas et sélectionnez "Sur l'écran d'accueil"
4. Appuyez sur "Ajouter" pour installer l'application

## Personnalisation

- Pour changer le logo, remplacez l'URL dans la balise `img` du fichier `index.html`
- Pour modifier le temps de redirection, ajustez la valeur dans la fonction `setTimeout` (en millisecondes)
- Pour mettre à jour les couleurs, modifiez les variables CSS dans la section `style`

## Sécurité

L'application inclut des en-têtes de sécurité et une politique de sécurité du contenu (CSP) pour protéger les utilisateurs.
