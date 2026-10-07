#!/usr/bin/env bash
# Assemble les pages secondaires à partir de _partials/ (en-tête + corps + pied).
# Usage : bash build.sh
set -e
cd "$(dirname "$0")"
page() { # fichier titre description robots
  sed -e "s|__TITRE__|$2|" -e "s|__DESC__|$3|" -e "s|__ROBOTS__|$4|" _partials/haut.html > "site/$1"
  cat "_partials/$1" _partials/bas.html >> "site/$1"
}
page mentions-legales.html "Mentions légales" "Mentions légales du restaurant Les Tables du Cloître à Moustiers-Sainte-Marie." "index, follow"
page confidentialite.html "Confidentialité et cookies" "Politique de confidentialité (RGPD) et cookies du restaurant Les Tables du Cloître." "index, follow"
page conditions.html "Conditions générales" "Conditions générales d’utilisation du site et de réservation du restaurant Les Tables du Cloître." "index, follow"
page accessibilite.html "Accessibilité" "Accessibilité du restaurant Les Tables du Cloître et de son site." "index, follow"
page 404.html "Page introuvable" "Cette page n’existe pas." "noindex"
echo "Pages générées."
