# Tontine — Frontend

Console d'administration Next.js pour l'API [ag_tontine](../ag_tontine). Il n'y a pas de page
d'inscription : seul un compte **Développeur** (créé côté backend) peut se connecter, créer les
microfinances et leurs comptes propriétaires, qui créent ensuite le personnel de leur microfinance.

## Stack

- Next.js 16 (App Router, React 19, Turbopack)
- shadcn/ui (style `base-nova`, basé sur [Base UI](https://base-ui.com), pas Radix)
- Tailwind CSS v4
- react-hook-form + zod pour les formulaires
- Authentification par jeton Sanctum (bearer), jamais exposé au navigateur : toutes les requêtes
  vers l'API passent par le serveur Next.js (pattern *backend for frontend*), le jeton est stocké
  dans un cookie `httpOnly`.

## Démarrer

```bash
npm install
cp .env.example .env.local   # ajuster API_BASE_URL si l'API ne tourne pas sur localhost:8000
npm run dev
```

L'API `ag_tontine` doit tourner en parallèle (`php artisan serve` depuis `../ag_tontine`).

## Architecture

- `src/lib/session.ts` — cookie httpOnly (`tontine_session`) contenant le jeton Sanctum et l'utilisateur.
- `src/lib/api.ts` — client `fetch` serveur uniquement (`apiFetch`), attache le jeton, lève `ApiError`.
- `src/lib/auth.ts` — Data Access Layer : `requireUser()`, `requireDeveloper()`.
- `src/proxy.ts` — anciennement `middleware.ts` (renommé en Next.js 16) : redirection optimiste
  vers `/login` basée sur la présence du cookie de session.
- `src/app/login/` — page de connexion + Server Action (`loginAction`, `logoutAction`).
- `src/app/(app)/` — zone authentifiée (sidebar + en-tête), navigation filtrée par rôle
  (`src/lib/nav.ts`).
- `src/app/(app)/microfinances/` — module CRUD complet (réservé au rôle Développeur, niveau 0) :
  à dupliquer pour les futurs modules (agences, utilisateurs, clients, carnets, prêts, etc.).

## Prochaines étapes

Le rôle Développeur crée une microfinance puis, séparément côté API (`/agencies`, `/users`), une
agence siège et son compte propriétaire (rôle *Super Admin*). Les modules Agences et Utilisateurs
suivent le même patron que `microfinances/` (schema zod, `actions.ts`, formulaire, page liste,
page création, page édition) et restent à construire, de même que les espaces Propriétaire et
Agence.
