# 🔨 Brisage Tracker

Petit outil entre potes pour noter les **brisages Dofus** : item, coefficient, focus, avis, lamas générés, etc.

Stack : **Next.js 14** (App Router) · **TypeScript** · **Tailwind CSS** · **Upstash Redis** · déploiement **Vercel**.

## Fonctionnalités

- Tableau de tous les brisages, triés par date décroissante, avec badge coloré selon l'avis.
- Filtres par avis et par focus.
- Formulaire d'ajout (`/nouveau`) avec autocomplétion d'items via l'API publique [DofusDB](https://api.dofusdb.fr).
- API : `GET /api/brisages` et `POST /api/brisages`.
- Pas de compte : juste un champ pseudo à remplir à chaque ajout.

## Développement en local

1. Installe les dépendances :

```bash
npm install
```

2. Crée un fichier `.env.local` à partir de l'exemple :

```bash
cp .env.example .env.local
```

3. Renseigne tes variables Upstash (voir section suivante), puis lance :

```bash
npm run dev
```

L'app tourne sur [http://localhost:3000](http://localhost:3000).

## Créer une base Upstash Redis (gratuit)

1. Va sur [upstash.com](https://upstash.com) et crée un compte (gratuit, connexion GitHub/Google possible).
2. Dans la console, clique sur **Create Database**.
3. Choisis un nom, une région proche de tes joueurs, et laisse le type **Regional**. Le plan gratuit suffit largement.
4. Une fois la base créée, ouvre-la et va dans l'onglet **REST API**.
5. Copie les deux valeurs :
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
6. Colle-les dans ton `.env.local` (en local) et dans les variables d'environnement Vercel (en prod).

## Déployer sur Vercel

1. Pousse ce projet sur un dépôt **GitHub**.
2. Va sur [vercel.com](https://vercel.com), connecte-toi et clique sur **Add New… > Project**.
3. Importe ton dépôt GitHub. Vercel détecte automatiquement Next.js (aucune config à changer).
4. Configure Redis (deux options, au choix) :
   - **Option A — Intégration Vercel (recommandé)** : dans ton projet Vercel, onglet
     **Storage** > **Create Database** > **Upstash Redis**, puis connecte-la au projet.
     Vercel injecte automatiquement les variables d'env. Le code accepte les noms
     `KV_REST_API_URL` / `KV_REST_API_TOKEN` comme `UPSTASH_REDIS_REST_URL` /
     `UPSTASH_REDIS_REST_TOKEN`, donc rien d'autre à faire.
   - **Option B — Manuel** : dans **Settings > Environment Variables**, ajoute
     `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN` avec tes valeurs Upstash.
5. Clique sur **Deploy** (ou **Redeploy** si tu as ajouté les variables après un premier déploiement). 🎉

> À chaque `git push` sur la branche principale, Vercel redéploie automatiquement.
> Si tu modifies les variables d'env après un déploiement, pense à **redéployer** pour qu'elles soient prises en compte.

## Modèle de données

Toutes les entrées sont stockées dans une **unique clé Redis** `brisages` (liste, un JSON par élément) :

```json
{
  "id": "uuid",
  "itemNom": "Gelano",
  "itemNiveau": 200,
  "coefficient": 120,
  "focus": "PA",
  "avis": "BIEN",
  "lamasGeneres": 5000,
  "auteur": "Jul",
  "commentaire": "gg",
  "createdAt": "2026-07-01T18:00:00.000Z"
}
```

## Structure

```
app/
  api/brisages/route.ts   # GET + POST
  nouveau/page.tsx        # formulaire d'ajout
  page.tsx                # page d'accueil (tableau + filtres)
  layout.tsx              # layout + header
  globals.css
components/
  AvisBadge.tsx           # badge coloré vert/orange/rouge
  BrisagesTable.tsx       # tableau + filtres (client)
  ItemSearch.tsx          # autocomplétion DofusDB
lib/
  redis.ts                # client Upstash + helpers
  types.ts                # types partagés
```
