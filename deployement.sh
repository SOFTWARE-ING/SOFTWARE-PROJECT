#!/bin/bash

###############################################################################
# Script de déploiement automatisé - GenEX-APP Backend
# Version: 1.0.0
# Date: Février 2026
###############################################################################

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables globales
PROJECT_DIR="$HOME/GenXPDF/backend_genex/GE"
VENV_NAME="appGE"
VENV_PATH="$PROJECT_DIR/$VENV_NAME"
LOG_DIR="$PROJECT_DIR/logs"
PYTHON_VERSION="3.10"

###############################################################################
# Fonctions utilitaires
###############################################################################

print_header() {
    echo -e "${BLUE}"
    echo "================================================================================"
    echo "  GenEX-APP - Script de Déploiement Automatisé"
    echo "================================================================================"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 n'est pas installé"
        return 1
    else
        print_success "$1 est installé"
        return 0
    fi
}

###############################################################################
# Vérification des prérequis
###############################################################################

check_prerequisites() {
    print_info "Vérification des prérequis système..."
    
    local all_ok=true
    
    # Python
    if check_command python3; then
        PYTHON_VER=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
        print_info "Version Python: $PYTHON_VER"
    else
        all_ok=false
    fi
    
    # pip
    check_command pip3 || all_ok=false
    
    # MySQL
    if check_command mysql; then
        MYSQL_VER=$(mysql --version | cut -d' ' -f6 | cut -d',' -f1)
        print_info "Version MySQL: $MYSQL_VER"
    else
        all_ok=false
    fi
    
    # Tesseract
    if check_command tesseract; then
        TESS_VER=$(tesseract --version 2>&1 | head -n1 | cut -d' ' -f2)
        print_info "Version Tesseract: $TESS_VER"
    else
        all_ok=false
    fi
    
    # Git
    check_command git || all_ok=false
    
    if [ "$all_ok" = false ]; then
        print_error "Certains prérequis ne sont pas satisfaits"
        print_info "Voulez-vous installer les dépendances manquantes? (o/n)"
        read -r response
        if [[ "$response" =~ ^[Oo]$ ]]; then
            install_system_dependencies
        else
            exit 1
        fi
    else
        print_success "Tous les prérequis sont satisfaits"
    fi
}

###############################################################################
# Installation des dépendances système
###############################################################################

install_system_dependencies() {
    print_info "Installation des dépendances système..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Détection Ubuntu/Debian
        if [ -f /etc/debian_version ]; then
            sudo apt-get update
            sudo apt-get install -y \
                python3-dev \
                python3-pip \
                python3-venv \
                python3-cffi \
                mysql-server \
                tesseract-ocr \
                tesseract-ocr-fra \
                libcairo2 \
                libpango-1.0-0 \
                libpangocairo-1.0-0 \
                libgdk-pixbuf2.0-0 \
                libffi-dev \
                shared-mime-info \
                git \
                nginx
            
            print_success "Dépendances système installées"
        else
            print_error "Distribution Linux non supportée automatiquement"
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if check_command brew; then
            brew install python@3.10 mysql tesseract cairo pango gdk-pixbuf
            print_success "Dépendances macOS installées"
        else
            print_error "Homebrew non installé. Installez-le depuis https://brew.sh"
            exit 1
        fi
    else
        print_error "Système d'exploitation non supporté: $OSTYPE"
        exit 1
    fi
}

###############################################################################
# Configuration de l'environnement virtuel
###############################################################################

setup_virtual_environment() {
    print_info "Configuration de l'environnement virtuel Python..."
    
    # Créer le dossier du projet si nécessaire
    mkdir -p "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    
    # Supprimer l'ancien venv s'il existe
    if [ -d "$VENV_PATH" ]; then
        print_warning "Environnement virtuel existant trouvé"
        print_info "Voulez-vous le recréer? (o/n)"
        read -r response
        if [[ "$response" =~ ^[Oo]$ ]]; then
            rm -rf "$VENV_PATH"
            print_success "Ancien environnement supprimé"
        fi
    fi
    
    # Créer le nouvel environnement
    if [ ! -d "$VENV_PATH" ]; then
        python3 -m venv "$VENV_PATH"
        print_success "Environnement virtuel créé: $VENV_PATH"
    fi
    
    # Activer l'environnement
    source "$VENV_PATH/bin/activate"
    print_success "Environnement virtuel activé"
    
    # Mettre à jour pip
    pip install --upgrade pip setuptools wheel
    print_success "pip mis à jour"
}

###############################################################################
# Installation des dépendances Python
###############################################################################

install_python_dependencies() {
    print_info "Installation des dépendances Python..."
    
    cd "$PROJECT_DIR"
    source "$VENV_PATH/bin/activate"
    
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
        print_success "Dépendances Python installées"
    else
        print_error "Fichier requirements.txt introuvable"
        exit 1
    fi
}

###############################################################################
# Configuration de la base de données
###############################################################################

setup_database() {
    print_info "Configuration de la base de données..."
    
    # Vérifier si MySQL est lancé
    if ! sudo systemctl is-active --quiet mysql; then
        print_warning "MySQL n'est pas démarré. Démarrage..."
        sudo systemctl start mysql
    fi
    
    print_info "Nom de la base de données [genex_db]:"
    read -r DB_NAME
    DB_NAME=${DB_NAME:-genex_db}
    
    print_info "Utilisateur MySQL [genex_user]:"
    read -r DB_USER
    DB_USER=${DB_USER:-genex_user}
    
    print_info "Mot de passe MySQL:"
    read -rs DB_PASSWORD
    echo
    
    # Créer la base de données et l'utilisateur
    sudo mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true
    sudo mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';" 2>/dev/null || true
    sudo mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';" 2>/dev/null || true
    sudo mysql -e "FLUSH PRIVILEGES;" 2>/dev/null || true
    
    print_success "Base de données configurée"
    
    # Sauvegarder les informations pour le .env
    export CONFIGURED_DB_NAME="$DB_NAME"
    export CONFIGURED_DB_USER="$DB_USER"
    export CONFIGURED_DB_PASSWORD="$DB_PASSWORD"
}

###############################################################################
# Configuration du fichier .env
###############################################################################

setup_env_file() {
    print_info "Configuration du fichier .env..."
    
    cd "$PROJECT_DIR"
    
    # Générer une SECRET_KEY sécurisée
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    
    # Demander les API keys
    print_info "Clé API Gemini:"
    read -r GEMINI_KEY
    
    print_info "Clé API DeepSeek (optionnel, appuyez sur Entrée pour passer):"
    read -r DEEPSEEK_KEY
    
    # Créer le fichier .env
    cat > .env << EOF
# Base de données MySQL
DB_USER=${CONFIGURED_DB_USER:-root}
DB_PASSWORD=${CONFIGURED_DB_PASSWORD:-}
DB_HOST=localhost
DB_PORT=3306
DB_NAME=${CONFIGURED_DB_NAME:-genex_db}

# Sécurité JWT
SECRET_KEY=$SECRET_KEY
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# API Keys
GEMINI_API_KEY=$GEMINI_KEY
DEEPSEEK_API_KEY=${DEEPSEEK_KEY:-}

# CORS
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:8000,http://127.0.0.1:3000,http://127.0.0.1:8000
EOF
    
    chmod 600 .env
    print_success "Fichier .env créé et sécurisé"
}

###############################################################################
# Création des dossiers nécessaires
###############################################################################

create_directories() {
    print_info "Création des dossiers nécessaires..."
    
    cd "$PROJECT_DIR"
    
    mkdir -p storage/docs
    mkdir -p generated_pdfs
    mkdir -p translations/uploads
    mkdir -p translations/outputs
    mkdir -p templates
    mkdir -p fonts
    mkdir -p logs
    
    chmod -R 755 storage generated_pdfs translations
    
    print_success "Dossiers créés"
}

###############################################################################
# Configuration Gunicorn
###############################################################################

setup_gunicorn_config() {
    print_info "Configuration de Gunicorn..."
    
    cd "$PROJECT_DIR"
    
    cat > gunicorn_config.py << 'EOF'
# Gunicorn configuration file
import multiprocessing

# Server socket
bind = "0.0.0.0:8000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
timeout = 120
keepalive = 5

# Logging
errorlog = "logs/gunicorn-error.log"
accesslog = "logs/gunicorn-access.log"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process naming
proc_name = "genex-api"

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL
keyfile = None
certfile = None
EOF
    
    print_success "Configuration Gunicorn créée"
}

###############################################################################
# Configuration du service systemd
###############################################################################

setup_systemd_service() {
    print_info "Configuration du service systemd..."
    
    local SERVICE_FILE="/etc/systemd/system/genex-api.service"
    
    sudo tee "$SERVICE_FILE" > /dev/null << EOF
[Unit]
Description=GenEX-APP FastAPI Backend
After=network.target mysql.service

[Service]
Type=notify
User=$USER
Group=$USER
WorkingDirectory=$PROJECT_DIR
Environment="PATH=$VENV_PATH/bin"
ExecStart=$VENV_PATH/bin/gunicorn main:app -c gunicorn_config.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl enable genex-api
    
    print_success "Service systemd configuré"
}

###############################################################################
# Configuration Nginx
###############################################################################

setup_nginx() {
    print_info "Configuration de Nginx..."
    
    print_info "Nom de domaine (ou IP) [localhost]:"
    read -r DOMAIN
    DOMAIN=${DOMAIN:-localhost}
    
    local NGINX_CONFIG="/etc/nginx/sites-available/genex-api"
    
    sudo tee "$NGINX_CONFIG" > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 600s;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
    }

    location /pdfs {
        alias $PROJECT_DIR/generated_pdfs;
        autoindex off;
    }

    location /static {
        alias $PROJECT_DIR/static;
    }
}
EOF
    
    sudo ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    
    print_success "Nginx configuré"
}

###############################################################################
# Tests post-déploiement
###############################################################################

run_tests() {
    print_info "Exécution des tests..."
    
    # Démarrer le service
    sudo systemctl start genex-api
    sleep 5
    
    # Vérifier que le service est actif
    if sudo systemctl is-active --quiet genex-api; then
        print_success "Service genex-api actif"
    else
        print_error "Le service genex-api n'a pas démarré"
        sudo journalctl -u genex-api -n 50 --no-pager
        return 1
    fi
    
    # Test HTTP
    print_info "Test de l'endpoint de santé..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/genex/ | grep -q "200\|404"; then
        print_success "L'API répond correctement"
    else
        print_error "L'API ne répond pas"
        return 1
    fi
}

###############################################################################
# Affichage des informations finales
###############################################################################

show_final_info() {
    echo
    print_header
    print_success "Déploiement terminé avec succès!"
    echo
    print_info "Informations importantes:"
    echo "  - Répertoire du projet: $PROJECT_DIR"
    echo "  - Environnement virtuel: $VENV_PATH"
    echo "  - Fichier de configuration: $PROJECT_DIR/.env"
    echo "  - Logs: $LOG_DIR"
    echo
    print_info "Commandes utiles:"
    echo "  - Démarrer le service: sudo systemctl start genex-api"
    echo "  - Arrêter le service: sudo systemctl stop genex-api"
    echo "  - Redémarrer le service: sudo systemctl restart genex-api"
    echo "  - Voir les logs: sudo journalctl -u genex-api -f"
    echo "  - Statut du service: sudo systemctl status genex-api"
    echo
    print_info "URLs:"
    echo "  - API: http://$DOMAIN:8000"
    echo "  - Documentation: http://$DOMAIN:8000/docs"
    echo "  - Redoc: http://$DOMAIN:8000/redoc"
    echo
    print_warning "N'oubliez pas de:"
    echo "  1. Sauvegarder votre fichier .env"
    echo "  2. Configurer un certificat SSL (Let's Encrypt recommandé)"
    echo "  3. Configurer un firewall (ufw)"
    echo "  4. Mettre en place des sauvegardes régulières de la base de données"
    echo
}

###############################################################################
# Menu interactif
###############################################################################

show_menu() {
    clear
    print_header
    echo "Que souhaitez-vous faire?"
    echo
    echo "1) Installation complète (recommandé)"
    echo "2) Vérifier les prérequis uniquement"
    echo "3) Installer les dépendances système"
    echo "4) Configurer l'environnement virtuel"
    echo "5) Installer les dépendances Python"
    echo "6) Configurer la base de données"
    echo "7) Créer le fichier .env"
    echo "8) Configurer Gunicorn et systemd"
    echo "9) Configurer Nginx"
    echo "10) Exécuter les tests"
    echo "0) Quitter"
    echo
}

full_installation() {
    print_header
    check_prerequisites
    setup_virtual_environment
    install_python_dependencies
    setup_database
    setup_env_file
    create_directories
    setup_gunicorn_config
    setup_systemd_service
    
    print_info "Voulez-vous configurer Nginx? (o/n)"
    read -r response
    if [[ "$response" =~ ^[Oo]$ ]]; then
        setup_nginx
    fi
    
    run_tests
    show_final_info
}

###############################################################################
# Main
###############################################################################

main() {
    # Mode non-interactif si argument --auto
    if [ "$1" = "--auto" ]; then
        full_installation
        exit 0
    fi
    
    # Mode interactif
    while true; do
        show_menu
        read -p "Votre choix: " choice
        
        case $choice in
            1) full_installation ;;
            2) check_prerequisites ;;
            3) install_system_dependencies ;;
            4) setup_virtual_environment ;;
            5) install_python_dependencies ;;
            6) setup_database ;;
            7) setup_env_file ;;
            8) setup_gunicorn_config; setup_systemd_service ;;
            9) setup_nginx ;;
            10) run_tests ;;
            0) print_info "Au revoir!"; exit 0 ;;
            *) print_error "Choix invalide" ;;
        esac
        
        echo
        read -p "Appuyez sur Entrée pour continuer..."
    done
}

# Lancement du script
main "$@"