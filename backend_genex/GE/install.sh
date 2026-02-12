#!/bin/bash

# Script d'installation de LaTeX pour génération PDF
# Ubuntu/Debian

echo "📦 Installation de LaTeX..."

# Installation des paquets nécessaires
sudo apt-get update
sudo apt-get install -y \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-latex-extra \
    texlive-lang-french

echo "✅ Installation terminée!"

# Test
pdflatex --version

echo ""
echo "Pour tester la génération PDF, lancez:"
echo "python services/pdf_service.py"