# 🚀 GenExPDF – Workflow Git & Organisation du Dépôt

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success" />
  <img src="https://img.shields.io/badge/Mono--Repo-Yes-blue" />
  <img src="https://img.shields.io/badge/Branches-main%20%7C%20frontend%20%7C%20backend-purple" />
</p>

<p align="center">
  <b>Règles claires • Zéro conflits • Workflow pro</b>
</p>

---

## 🧠 Vision du projet

Ce dépôt suit une **architecture mono-repo** avec une séparation stricte des responsabilités via les branches Git.

🎯 Objectif :

* Développer **frontend** et **backend** indépendamment
* Garder une branche `main` **stable, propre et livrable**

---

## 🌳 Structure des branches

### 🔹 `main` (branche STABLE)

➡️ Contient **le projet complet**

```
GenExPDF/
├── frontend_genex/
├── backend_genex/
└── README.md
```

✅ Branche de référence
❌ Aucune modification directe autorisée

---

### 🔹 `frontend` (branche UI / Client)

➡️ Contient **UNIQUEMENT** le frontend

```
GenExPDF/
└── frontend_genex/
```

✅ React / Vite / UI / UX
❌ Aucun backend ici

---

### 🔹 `backend` (branche API / Serveur)

➡️ Contient **UNIQUEMENT** le backend

```
GenExPDF/
└── backend_genex/
```

✅ FastAPI / API / DB
❌ Aucun frontend ici

---

## 🚦 Règles OBLIGATOIRES (à respecter)

⚠️ Ces règles ne sont pas optionnelles.

* ❌ Ne jamais coder directement sur `main`
* ❌ Ne jamais mélanger frontend et backend dans une même branche
* ✅ Une branche = une responsabilité
* ✅ `main` reçoit uniquement des merges propres

---

## 🔄 Workflow de travail (comment contribuer)

### 🖥️ Travailler sur le frontend

```bash
git checkout frontend
git pull origin frontend

# coder uniquement dans frontend_genex/

git add .
git commit -m "feat(frontend): description claire"
git push origin frontend
```

---

### ⚙️ Travailler sur le backend

```bash
git checkout backend
git pull origin backend

# coder uniquement dans backend_genex/

git add .
git commit -m "feat(backend): description claire"
git push origin backend
```

---

## 🔀 Merge vers `main` (assemblage final)

⚠️ Le merge se fait **uniquement quand une partie est stable**.

```bash
git checkout main
git pull origin main

git merge frontend
git merge backend

git push origin main
```

✨ Résultat : `main` contient le projet complet.

---

## 🧹 Nettoyage des branches (important)

Chaque branche ne doit contenir que **son dossier dédié**.

### Nettoyer `frontend`

```bash
rm -rf backend_genex
```

### Nettoyer `backend`

```bash
rm -rf frontend_genex
```

Puis :

```bash
git add -A
git commit -m "chore: cleanup branch"
```

---

## 📦 Commandes Git ESSENTIELLES (cheat sheet)

### Initialisation

```bash
git init
git add .
git commit -m "initial commit"
```

### Branches

```bash
git branch
git checkout -b nom_branche
git checkout nom_branche
```

### Synchronisation

```bash
git pull origin nom_branche
git push origin nom_branche
```

### Forcer un push (⚠️ avec précaution)

```bash
git push origin branche --force
```

### Annuler un merge en conflit

```bash
git merge --abort
```

---

## 🧠 Bonnes pratiques (niveau pro)

* Commits courts et explicites
* Toujours `pull` avant de coder
* Toujours vérifier sa branche avant `git add`
* Ne jamais versionner `node_modules` ou `__pycache__`

---

## 🎉 Conclusion

Ce dépôt suit un **workflow Git propre, scalable et professionnel**, adapté :

* aux projets sérieux
* au travail en équipe
* au déploiement sans stress

🔥 Respecte les règles → zéro conflits → maximum efficacité.

---

<p align="center">
  <b>GenExPDF – Build smart. Ship clean.</b>
</p>
