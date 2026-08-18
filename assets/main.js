// Menu burger : ouverture et fermeture sur mobile
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

if (burger && mobileMenu) {
  const setMenu = (open) => {
    burger.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  };

  burger.addEventListener('click', () => {
    setMenu(!burger.classList.contains('open'));
  });

  // Le menu se referme dès qu'on choisit une destination
  mobileMenu.querySelectorAll('a').forEach((lien) => {
    lien.addEventListener('click', () => setMenu(false));
  });

  // Fermeture avec la touche Échap
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });
}

// Bouton retour en haut : apparaît après un léger défilement
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  });
}

// Formulaire de contact : redirection vers merci.html après envoi (FormSubmit)
const nextInput = document.getElementById('formNext');
if (nextInput && location.protocol.startsWith('http')) {
  const base = location.href.replace(/[^/]*$/, '');
  nextInput.value = base + 'merci.html';
}

// ===== Centres d'intérêt : le cœur s'efface comme une carte à gratter =====
// Le voile (fond noir + cœur blanc) recouvre le rectangle des passions.
// Le pinceau efface le voile et peint en même temps le fond du rectangle
// dans une teinte qui oscille entre le rose du site et le blanc.
const zoneCoeur = document.getElementById('coeurScratch');

if (zoneCoeur) {
  const voile = document.getElementById('coeurVoile');
  const peinture = document.getElementById('coeurPeinture');
  const retour = document.getElementById('coeurRetour');
  const ctxVoile = voile.getContext('2d');
  const ctxPeinture = peinture.getContext('2d');
  const ctxRetour = retour.getContext('2d');

  const ROSE = [247, 184, 212];    // #f7b8d4, la couleur accent du site
  const BLANC = [255, 255, 255];
  const PAUSE_AVANT_RETOUR = 8000; // ms sans peindre avant le retour du cœur
  const DUREE_FONDU = 1100;        // un peu plus que la transition CSS (1 s)

  const imgCoeur = new Image();
  const imgBasket = new Image();

  let largeur = 0;
  let hauteur = 0;
  let dernierPoint = null;  // dernier point du tracé en cours
  let distanceTracee = 0;   // distance parcourue par le pinceau : pilote la teinte
  let minuterie = null;
  let retourEnCours = false;

  // Contour arrondi du rectangle des passions
  const cheminRectangle = (ctx) => {
    const marge = Math.min(largeur, hauteur) * 0.025;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(marge, marge, largeur - 2 * marge, hauteur - 2 * marge, 18);
    } else {
      ctx.rect(marge, marge, largeur - 2 * marge, hauteur - 2 * marge);
    }
  };

  // Dessine l'état couvert (fond noir, ballon discret, cœur blanc).
  // Utilisé pour le voile ET pour sa copie du fondu de retour : les deux
  // passent par le même dessin, au pixel près, sinon le cœur semblerait
  // se décaler à la fin du fondu.
  const dessinerCouverture = (ctx) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, largeur, hauteur);
    if (imgBasket.naturalWidth) {
      ctx.globalAlpha = 0.4;
      const lBasket = 40; // même taille que la classe w-10 de l'image d'origine
      ctx.drawImage(imgBasket, largeur * 0.22, hauteur * 0.08,
        lBasket, lBasket * imgBasket.naturalHeight / imgBasket.naturalWidth);
      ctx.globalAlpha = 1;
    }
    if (imgCoeur.naturalWidth) {
      ctx.drawImage(imgCoeur, 0, 0, largeur, hauteur);
    }
  };

  // (Re)met la zone à neuf : rectangle blanc dessous, voile opaque dessus
  const dessinerEtatInitial = () => {
    const dpr = window.devicePixelRatio || 1;
    const boite = zoneCoeur.getBoundingClientRect();
    // Tailles entières : avec une hauteur fractionnaire (le conteneur suit
    // un ratio), chaque couche serait arrondie à sa façon à l'affichage et
    // le fondu du retour laisserait voir un léger décalage entre elles.
    largeur = Math.round(boite.width);
    hauteur = Math.round(boite.height);

    [[voile, ctxVoile], [peinture, ctxPeinture], [retour, ctxRetour]].forEach(([canvas, ctx]) => {
      canvas.style.width = largeur + 'px';
      canvas.style.height = hauteur + 'px';
      canvas.width = Math.round(largeur * dpr);
      canvas.height = Math.round(hauteur * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    });

    // Fond blanc du rectangle ; les coups de pinceau y resteront confinés
    cheminRectangle(ctxPeinture);
    ctxPeinture.fillStyle = '#fff';
    ctxPeinture.fill();
    cheminRectangle(ctxPeinture);
    ctxPeinture.clip();

    // Le voile et sa copie de retour, dessinés à l'identique
    dessinerCouverture(ctxVoile);
    dessinerCouverture(ctxRetour);

    dernierPoint = null;
    distanceTracee = 0;
  };

  // Un coup de pinceau : efface le voile et colore le fond en même temps
  const peindre = (x, y) => {
    const rayon = Math.max(26, largeur * 0.055);
    const depart = dernierPoint || { x, y };
    distanceTracee += Math.hypot(x - depart.x, y - depart.y);

    // La teinte glisse doucement du rose au blanc au fil du tracé
    const melange = (Math.sin(distanceTracee / 140) + 1) / 2;
    const teinte = 'rgb(' +
      ROSE.map((c, i) => Math.round(c + (BLANC[i] - c) * melange)).join(',') + ')';

    [[ctxPeinture, 'source-over', teinte], [ctxVoile, 'destination-out', '#000']]
      .forEach(([ctx, mode, couleur]) => {
        ctx.globalCompositeOperation = mode;
        if (depart.x === x && depart.y === y) {
          // Un simple appui : un point rond (un trait de longueur nulle ne se voit pas)
          ctx.fillStyle = couleur;
          ctx.beginPath();
          ctx.arc(x, y, rayon, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = couleur;
          ctx.lineWidth = rayon * 2;
          ctx.beginPath();
          ctx.moveTo(depart.x, depart.y);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      });

    dernierPoint = { x, y };
  };

  // Après un temps d'inactivité, le cœur revient en fondu :
  // la copie du voile s'affiche par-dessus, puis les canvas sont remis à neuf
  const armerLeRetour = () => {
    clearTimeout(minuterie);
    minuterie = setTimeout(() => {
      retourEnCours = true;
      retour.classList.add('visible');
      minuterie = setTimeout(() => {
        dessinerEtatInitial();
        // Escamotage instantané de la copie : le voile vient d'être
        // redessiné à l'identique dessous, il ne doit y avoir aucune
        // seconde animation où le cœur « réapparaît ».
        retour.style.transition = 'none';
        retour.classList.remove('visible');
        void retour.offsetWidth; // applique l'état avant de réactiver la transition
        retour.style.transition = '';
        retourEnCours = false;
      }, DUREE_FONDU);
    }, PAUSE_AVANT_RETOUR);
  };

  const surTrace = (e) => {
    if (retourEnCours) {
      // On repeint pendant le fondu : le retour est interrompu
      retour.classList.remove('visible');
      retourEnCours = false;
    }
    const boite = zoneCoeur.getBoundingClientRect();
    peindre(e.clientX - boite.left, e.clientY - boite.top);
    armerLeRetour();
  };

  zoneCoeur.addEventListener('pointerdown', (e) => {
    dernierPoint = null;
    surTrace(e);
  });
  // À la souris, le simple survol peint ; au doigt, pointermove n'existe
  // que pendant l'appui : le même geste sert donc aux deux.
  zoneCoeur.addEventListener('pointermove', surTrace);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((nom) => {
    zoneCoeur.addEventListener(nom, () => { dernierPoint = null; });
  });

  // Premier affichage : voile noir immédiat, cœur dès que les images arrivent
  imgCoeur.addEventListener('load', dessinerEtatInitial);
  imgBasket.addEventListener('load', dessinerEtatInitial);
  imgCoeur.src = 'assets/img/coeur-blanc.svg';
  imgBasket.src = 'assets/img/basket.png';
  dessinerEtatInitial();

  // Au redimensionnement, on repart d'une zone propre — mais seulement si
  // la taille de la zone a vraiment changé. Sur téléphone, la barre
  // d'adresse qui se cache ou réapparaît au défilement déclenche des
  // « resize » sans que la zone bouge : il ne faut pas effacer la
  // peinture en cours dans ce cas-là.
  let minuterieRedim = null;
  window.addEventListener('resize', () => {
    clearTimeout(minuterieRedim);
    minuterieRedim = setTimeout(() => {
      const boite = zoneCoeur.getBoundingClientRect();
      if (Math.round(boite.width) !== largeur || Math.round(boite.height) !== hauteur) {
        dessinerEtatInitial();
      }
    }, 150);
  });
}
