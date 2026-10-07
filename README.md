# Les Tables du Cloître

Site vitrine du restaurant **Les Tables du Cloître**, place du Presbytère, 04360 Moustiers-Sainte-Marie.

Site statique (HTML/CSS, sans framework ni cookie), hébergé gratuitement sur [Render](https://render.com).

## Structure

- `site/` : le site publié (`index.html`, pages légales, `css/`, `js/`, `img/`, `fonts/`)
- `_partials/` : en-tête, pied de page et contenu des pages légales
- `build.sh` : régénère les pages légales à partir de `_partials/` (`bash build.sh`)
- `serve.ps1` : prévisualisation locale sur http://localhost:8080 (`powershell -File serve.ps1`)
- `render.yaml` : configuration Render (site statique publié depuis `site/`)

## Avant la mise en service officielle

1. Compléter les passages surlignés dans `_partials/mentions-legales.html`, `confidentialite.html`, `conditions.html` et `accessibilite.html` (SIRET, raison sociale, médiateur, moyens de paiement…), puis lancer `bash build.sh`.
2. Remplacer les photos de `site/img/` par des photos appartenant au restaurant (celles d'origine proviennent de contributeurs Google Maps).
3. Vérifier la carte et les horaires dans `site/index.html`.

Chaque `git push` sur `main` redéploie automatiquement le site sur Render.
