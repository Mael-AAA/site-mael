# CLAUDE.md

Contexte du projet pour les prochaines sessions Claude Code.

## Le projet

Site portfolio personnel de **Maël BAUDET**, étudiant en BUT Techniques de
Commercialisation (Annecy, USMB). C'est le **clone d'un ancien site Wix**
(`https://mbaudet967.wixsite.com/mael`) refait en HTML/CSS/JS pur, sans CMS.


## Stack et contraintes

- **HTML statique pur** — pas de build, pas de framework, pas de `npm install`.
- **Tailwind CSS via CDN** (`<script src="https://cdn.tailwindcss.com">`),
  configuré en ligne dans chaque `<head>` avec une seule couleur perso :
  `accent: '#f7b8d4'` (le rose du site).
- **CSS maison** dans `assets/styles.css` uniquement pour ce que Tailwind ne
  fait pas bien (animations, filtres, transitions).
- **JS maison** dans `assets/main.js` — vanilla, aucune dépendance.
- Polices Google : `Playfair Display` (titres) et `Special Elite` (menu, style
  machine à écrire).

Ne pas introduire de bundler, de framework ou de gestionnaire de paquets sans
que le propriétaire le demande explicitement.

## Structure

```
index.html      Page principale (toutes les sections + formulaire de contact)
projet.html     "Mon projet" — PizzaOrder, agent vocal IA pour pizzerias
etagere.html    "Mon Étagère" — livres, films, séries, anime
merci.html      Page de confirmation après envoi du formulaire (sans navigation)
assets/
  styles.css    CSS maison
  main.js       JS maison (burger, retour en haut, formulaire)
  CV_Maël_BAUDET.pdf
  img/          31 images (accents dans les noms → attention aux chemins)
serve.js        Petit serveur statique local (voir "Prévisualiser")
Images du site/ Sources originales, non utilisées par le site
```

### Sections de `index.html` dans l'ordre

`#bienvenue` → `#accueil` (portrait + cartes) → `#formations` →
`#experiences` → `#competences` → `#interets` (le cœur) → `#contact` → footer.

Le propriétaire a lui-même remonté **Bienvenue avant le portrait**. Ne pas
remettre dans l'ordre d'origine.

## Conventions

- **Tout est en français** : textes, commentaires HTML/CSS/JS, noms de classes
  perso (`.coeur-wrapper`, `.img-bw`). Garder cette cohérence.
- Les commentaires HTML utilisent le format `<!-- ===== Titre ===== -->`.
- La barre de navigation, le pied de page et le bouton « retour en haut » sont
  **dupliqués à l'identique** dans les 3 pages. Toute modification de l'un doit
  être répercutée dans les 3 fichiers (pas de système d'includes).
- Le lien de la page courante est en `text-accent` (rose) sans effet de survol ;
  les autres sont en blanc avec `hover:text-accent`.

## Comportements sur mesure (à ne pas casser)

| Quoi | Où | Comment |
|---|---|---|
| Images N&B → couleur au survol | `.img-bw` dans `styles.css` | `filter: grayscale(1)` + transition 0.5 s. Appliqué à **toutes** les images du site, portrait compris. |
| Le cœur des centres d'intérêt | `.coeur-wrapper` | Opacité 0.14 au repos, 1 au survol, fondu 0.7 s. Le SVG `coeur-blanc.svg` est une copie de `coeur.svg` avec le noir remplacé par du blanc. |
| Bouton « Contactez-moi » | les 3 pages | Pointe vers `index.html#contact` → descend au formulaire en bas de la page principale. Exigence explicite du propriétaire. |
| Menu burger | `< 768 px` | Liens en `hidden md:flex`, bouton `#burger` en `md:hidden`. Le panneau `#mobileMenu` s'ouvre via la classe `.open` (transition sur `max-height`). Les 3 barres se transforment en croix. Se referme au clic sur un lien et avec Échap. |
| Retour en haut | `#backToTop` | Apparaît après 400 px de défilement. |

## Formulaire de contact

Service **FormSubmit** (gratuit, sans inscription) :
`action="https://formsubmit.co/mbaudet967@gmail.com"`.

`assets/main.js` remplit le champ caché `_next` avec l'URL absolue de
`merci.html` — uniquement si la page est servie en `http(s)`, pour que
l'ouverture en `file://` ne casse rien.

⚠️ **Au premier envoi après chaque mise en ligne sur un nouveau domaine**,
FormSubmit envoie un e-mail de confirmation à activer une seule fois.

## Prévisualiser en local

`python` n'est **pas installé** (seulement le raccourci Windows Store qui
échoue). Deux options qui marchent :

1. **Double-cliquer sur `index.html`** — suffit pour tout vérifier.
2. `node serve.js` (port 8377) ou `node serve.js 8378` pour un autre port.

**Captures d'écran** : Chrome headless est disponible dans
`/c/Program Files/Google/Chrome/Application/chrome.exe`. Attention, il impose
une **largeur de vue minimale d'environ 500 px** : demander `--window-size=390`
rogne l'image et donne l'illusion que des éléments à droite ont disparu.
Capturer à 500 px de large minimum pour le mobile.

## Déploiement

- Dépôt GitHub : `https://github.com/Mael-AAA/site-mael.git` (branche `main`).
- Hébergé sur **Cloudflare Workers** (pas Pages) :
  `https://site-maelv4.mbaudet967.workers.dev/`
- Déployé depuis le tableau de bord Cloudflare — **il n'y a pas de
  `wrangler.toml` dans le dépôt**.

## Réseaux sociaux

- LinkedIn : `https://www.linkedin.com/in/ma%C3%ABlbaudet/`
  Le `ë` est encodé en `%C3%AB` volontairement (fiabilité entre navigateurs).
  Ne pas « corriger » en remettant le caractère accentué.
- Instagram : `https://www.instagram.com/mael.baudet/`

Présents dans la section contact de l'accueil **et** dans les 3 pieds de page
(6 icônes au total).

## Points ouverts

- **Ancre « Qui suis je ? »** : la carte pointe vers `#bienvenue`, qui est
  maintenant *au-dessus* d'elle — le clic fait donc remonter au lieu de
  descendre. Signalé au propriétaire, décision en attente.
- **Renommer l'URL Cloudflare** en quelque chose comme `maelbaudet` : question
  posée, recherche interrompue, jamais traitée. À noter : une adresse
  `workers.dev` a toujours la forme `<worker>.<sous-domaine>.workers.dev`
  (deux niveaux) — vérifier la doc Cloudflare avant de répondre.
- **Vidéo de présentation** : le fichier de 64 Mo dépassait la limite de
  Cloudflare. Le propriétaire a supprimé le fichier **et** le bouton. Si la
  vidéo revient un jour, passer par un hébergeur externe (YouTube non répertorié).
- **Page projet** : les captures des workflows n8n et de l'agent Retell AI
  visibles sur l'ancien site Wix n'ont jamais été fournies. L'emplacement est
  prévu en commentaire dans `projet.html`, prêt à être décommenté.
- **Première image de la page projet** (`projet-1.jpg`) : le survol semble sans
  effet, mais c'est normal — l'écran de démarrage est déjà quasi monochrome
  (fond blanc, icône grise). Il n'y a pas de bug à chercher ici.
