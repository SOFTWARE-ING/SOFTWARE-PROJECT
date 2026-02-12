# Guide de Déploiement - GenEX-APP Backend

## 📋 Table des matières
- [Prérequis](#prérequis)
- [Architecture du projet](#architecture-du-projet)
- [Installation](#installation)
- [Configuration](#configuration)
- [Base de données](#base-de-données)
- [Déploiement](#déploiement)
- [Tests](#tests)
- [Dépannage](#dépannage)

---

## 🔧 Prérequis

### Système d'exploitation
- Ubuntu 20.04 LTS ou supérieur
- Debian 11 ou supérieur
- macOS 11+ (développement uniquement)

### Logiciels requis

#### 1. Python 3.10
```bash
python --version  # Python 3.10 ou supérieur requis
```

#### 2. MySQL
```bash
mysql --version  # MySQL 8.0 ou supérieur
```

#### 3. Tesseract OCR
```bash
tesseract --version  # Tesseract 4.0 ou supérieur
```

#### 4. WeasyPrint Dependencies
```bash
# Ubuntu/Debian
sudo apt-get install python3-dev python3-pip python3-cffi \
  libcairo2 libpango-1.0-0 libpangocairo-1.0-0 \
  libgdk-pixbuf2.0-0 libffi-dev shared-mime-info
```

#### 5. Git
```bash
git --version
```

---

## 🏗️ Architecture du projet

```
backend_genex/GE/
├── api/
│   ├── routers/          # Routeurs API spécifiques
│   │   └── translation.py
│   └── routes/           # Routes principales
│       ├── all_router.py
│       ├── auth.py
│       ├── document_upload.py
│       ├── projects.py
│       ├── route.py
│       └── sheets.py
├── auth/
│   └── auth.py          # Authentification JWT
├── controllers/
│   ├── all_controller.py
│   └── crud_project.py  # CRUD opérations
├── core/
│   ├── config.py        # Configuration centralisée
│   ├── dependencies.py  # Dépendances FastAPI
│   ├── gemini.py        # Client Gemini AI
│   ├── oauth2.py        # OAuth2 configuration
│   └── security.py      # Sécurité et JWT
├── db/
│   ├── base.py
│   └── session.py       # Session SQLAlchemy
├── models/
│   └── models.py        # Modèles SQLAlchemy
├── schemas/
│   └── schemas.py       # Schémas Pydantic
├── services/
│   ├── ai_service.py    # Service IA générique
│   ├── credits_service.py
│   ├── deepseek_serv.py # Service DeepSeek
│   ├── gemini_prompt.py
│   ├── gemini_serv.py   # Service Gemini
│   ├── ocr_service.py   # Service OCR
│   ├── pdf_service.py   # Génération PDF
│   └── tasks.py         # Tâches asynchrones
├── storage/
│   └── docs/            # Documents uploadés
├── generated_pdfs/      # PDFs générés
├── translations/        # Traductions PDF
│   ├── uploads/
│   └── outputs/
├── templates/           # Templates HTML
├── fonts/               # Polices pour PDF
├── main.py             # Point d'entrée FastAPI
├── .env                # Variables d'environnement
└── requirements.txt    # Dépendances Python
```

---

## 📦 Installation

### 1. Cloner le repository

```bash
cd ~
git clone https://github.com/SOFTWARE-ING/SOFTWARE-PROJECT.git
cd GenXPDF/backend_genex/GE
```

### 2. Créer l'environnement virtuel

```bash
python3 -m venv appGE
source appGE/bin/activate
```

### 3. Installer les dépendances

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

## ⚙️ Configuration

### 1. Créer le fichier .env

```bash
cp .env.example .env
nano .env
```

### 2. Remplir les variables d'environnement

```ini
# Base de données MySQL
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=genex_db

# Sécurité JWT
SECRET_KEY=votre_secret_key_ultra_securisee_32_caracteres_minimum
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# API Keys
GEMINI_API_KEY=votre_cle_api_gemini
DEEPSEEK_API_KEY=votre_cle_api_deepseek

# CORS (séparés par des virgules)
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

### 3. Générer une SECRET_KEY sécurisée

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 🗄️ Base de données

### 1. Créer la base de données MySQL

```bash
mysql -u root -p
```

```sql
CREATE DATABASE genex_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'genex_user'@'localhost' IDENTIFIED BY 'mot_de_passe_securise';
GRANT ALL PRIVILEGES ON genex_db.* TO 'genex_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Créer les tables (via Alembic ou script SQL)

#### Option A: Via Alembic (recommandé)

```bash
# Installer Alembic si nécessaire
pip install alembic

# Initialiser Alembic
alembic init alembic

# Créer une migration
alembic revision --autogenerate -m "Initial tables"

# Appliquer les migrations
alembic upgrade head
```

#### Option B: Import SQL direct

Si vous avez un fichier SQL de schéma:

```bash
mysql -u genex_user -p genex_db < schema.sql
```

### 3. Vérifier les tables

```bash
mysql -u genex_user -p genex_db -e "SHOW TABLES;"
```

Tables attendues:
- users
- roles
- source_documents
- document_sections
- translations
- projects
- ai_generations
- exercise_sheets
- exercises
- usage_statistics
- blacklisted_tokens

---

## 🚀 Déploiement

### Méthode 1: Développement (local)

```bash
source appGE/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Méthode 2: Production avec Gunicorn + Uvicorn Workers

#### 1. Installer Gunicorn

```bash
pip install gunicorn
```

#### 2. Créer un fichier gunicorn_config.py

```python
# gunicorn_config.py
bind = "0.0.0.0:8000"
workers = 4
worker_class = "uvicorn.workers.UvicornWorker"
timeout = 120
keepalive = 5
errorlog = "logs/gunicorn-error.log"
accesslog = "logs/gunicorn-access.log"
loglevel = "info"
```

#### 3. Lancer avec Gunicorn

```bash
mkdir -p logs
gunicorn main:app -c gunicorn_config.py
```

### Méthode 3: Service systemd (recommandé pour production)

#### 1. Créer le fichier de service

```bash
sudo nano /etc/systemd/system/genex-api.service
```

```ini
[Unit]
Description=GenEX-APP FastAPI Backend
After=network.target mysql.service

[Service]
Type=notify
User=mag
Group=mag
WorkingDirectory=/home/mag/GenXPDF/backend_genex/GE
Environment="PATH=/home/mag/GenXPDF/backend_genex/GE/appGE/bin"
ExecStart=/home/mag/GenXPDF/backend_genex/GE/appGE/bin/gunicorn main:app -c gunicorn_config.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### 2. Activer et démarrer le service

```bash
sudo systemctl daemon-reload
sudo systemctl enable genex-api
sudo systemctl start genex-api
sudo systemctl status genex-api
```

#### 3. Commandes de gestion

```bash
# Voir les logs
sudo journalctl -u genex-api -f

# Redémarrer
sudo systemctl restart genex-api

# Arrêter
sudo systemctl stop genex-api
```

---

## 🔒 Configuration Nginx (Reverse Proxy)

### 1. Installer Nginx

```bash
sudo apt update
sudo apt install nginx
```

### 2. Créer la configuration

```bash
sudo nano /etc/nginx/sites-available/genex-api
```

```nginx
server {
    listen 80;
    server_name api.genex.com;  # Remplacer par votre domaine

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 600s;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
    }

    location /pdfs {
        alias /home/mag/GenXPDF/backend_genex/GE/generated_pdfs;
        autoindex off;
    }

    location /static {
        alias /home/mag/GenXPDF/backend_genex/GE/static;
    }
}
```

### 3. Activer le site

```bash
sudo ln -s /etc/nginx/sites-available/genex-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. SSL avec Let's Encrypt (optionnel mais recommandé)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.genex.com
```

---

## 📊 Monitoring et Logs

### 1. Logs de l'application

```bash
# Logs Gunicorn
tail -f logs/gunicorn-error.log
tail -f logs/gunicorn-access.log

# Logs systemd
sudo journalctl -u genex-api -f --lines=100
```

### 2. Logs MySQL

```bash
sudo tail -f /var/log/mysql/error.log
```

### 3. Logs Nginx

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🧪 Tests

### 1. Test de santé de l'API

```bash
curl http://localhost:8000/api/genex/
```

### 2. Test des endpoints

```bash
# Test de login
curl -X POST http://localhost:8000/api/genex/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@genex.ai","password":"kilane20035"}'

# Test upload document
curl -X POST http://localhost:8000/api/genex/documents/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@test.pdf"
```

---

## 🔧 Dépannage

### Problème 1: Erreur de connexion MySQL

```bash
# Vérifier que MySQL est lancé
sudo systemctl status mysql

# Tester la connexion
mysql -u genex_user -p -h localhost genex_db
```

### Problème 2: Tesseract introuvable

```bash
# Vérifier l'installation
which tesseract

# Réinstaller si nécessaire
sudo apt-get install --reinstall tesseract-ocr tesseract-ocr-fra
```

### Problème 3: WeasyPrint ne génère pas de PDF

```bash
# Vérifier les dépendances
python -c "import weasyprint; print(weasyprint.__version__)"

# Réinstaller les dépendances système
sudo apt-get install --reinstall libcairo2 libpango-1.0-0 libpangocairo-1.0-0
```

### Problème 4: Permissions sur les dossiers

```bash
# Donner les bonnes permissions
chmod -R 755 storage/ generated_pdfs/ translations/
chown -R mag:mag storage/ generated_pdfs/ translations/
```

### Problème 5: API Gemini timeout

```ini
# Dans .env, augmenter les timeouts si nécessaire
# Dans gunicorn_config.py
timeout = 300  # 5 minutes
```

---

## 📝 Notes importantes

1. **Sécurité**:
   - Ne JAMAIS committer le fichier `.env`
   - Utiliser des mots de passe forts
   - Configurer un firewall (ufw)
   - Mettre à jour régulièrement les dépendances

2. **Sauvegarde**:
   - Sauvegarder régulièrement la base de données MySQL
   - Sauvegarder les fichiers dans `storage/` et `generated_pdfs/`

3. **Performance**:
   - Ajuster le nombre de workers Gunicorn selon les ressources serveur
   - Configurer un cache Redis pour les sessions (optionnel)
   - Optimiser les requêtes SQL avec des index

4. **Monitoring**:
   - Mettre en place un système de monitoring (Prometheus, Grafana)
   - Configurer des alertes pour les erreurs critiques

---

## 🆘 Support

En cas de problème persistant:

1. Vérifier les logs détaillés
2. Consulter la documentation FastAPI: https://fastapi.tiangolo.com
3. Vérifier les issues GitHub du projet
4. Contacter l'équipe de développement

---

**Dernière mise à jour**: Février 2026
**Version**: 1.0.0