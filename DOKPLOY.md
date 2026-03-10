# Guide de Déploiement : Dokploy 🚀

Dokploy est une plateforme de déploiement auto-hébergée qui utilise Docker pour gérer vos applications. Ce projet est configuré pour être déployé facilement sur Dokploy.

## Prérequis
- Un serveur (VPS) avec Dokploy déjà installé.
- Vos identifiants Supabase (URL et Anon Key).

## Étapes de déploiement

### 1. Préparer le projet
Assurez-vous que le `Dockerfile` et le `next.config.ts` (avec `output: 'standalone'`) sont présents sur votre dépôt GitHub.

### 2. Créer un nouveau projet sur Dokploy
1. Connectez-vous à votre interface Dokploy.
2. Cliquez sur **"New Project"** et donnez-lui un nom (ex: `calendrier-editorial`).

### 3. Configurer l'application
1. Dans le projet, cliquez sur **"Add Application"**.
2. Choisissez **"GitHub"** comme source.
3. Sélectionnez votre repository : `justm6640/Calendrier-ditorial`.
4. Sélectionnez la branche : `main`.

### 4. Configurer les variables d'environnement
C'est l'étape la plus importante. Allez dans l'onglet **"Environmental Variables"** de votre application sur Dokploy et ajoutez :

| Clé | Valeur |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Votre URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Votre Anon Key Supabase |

> [!IMPORTANT]
> Étant donné que Next.js a besoin de ces variables au moment du build pour les variables `NEXT_PUBLIC_`, assurez-vous qu'elles sont définies avant de lancer le déploiement.

### 5. Configurer le domaine
Dans l'onglet **"Domains"**, ajoutez votre nom de domaine. Dokploy s'occupera automatiquement de générer le certificat SSL (HTTPS) via Let's Encrypt.

### 6. Déployer
Cliquez sur le bouton **"Deploy"**. Dokploy va :
1. Cloner votre code.
2. Construire l'image Docker en utilisant le `Dockerfile` multi-stage.
3. Lancer le conteneur sur le port 3000.
4. Router le trafic via Traefik.

## Note sur Docker Compose
Si vous souhaitez déployer la base de données Supabase *localement* sur le même serveur via Dokploy, vous pouvez utiliser l'option **"Stacks"** et importer le fichier `docker-compose.yml`. Cependant, pour ce projet, nous recommandons d'utiliser Supabase Cloud pour plus de stabilité.
