// ===== Mini-jeu : évite les gouttes d'eau =====
// Chargé uniquement quand la mascotte est entièrement colorée (3e clic).
// La flamme se lève dans un panneau au-dessus du pied de page et suit la
// souris ou le doigt. 3 vies : chaque goutte lui retire de la couleur,
// la troisième met fin à la partie et tout revient à l'état initial.

window.JeuGouttes = (() => {
  const CLE_RECORD = 'jeu-gouttes-record';
  let panneau, zone, canvas, ctx, mascotte, message, scoreEl, recordEl, vies, pupilles;
  let initialise = false;

  // État d'une partie
  let actif = false;
  let boucleId = 0;
  let gouttes = [];
  let temps = 0;            // durée de survie (secondes) = score
  let attenteGoutte = 0;
  let viesRestantes = 3;
  let invincible = 0;       // secondes restantes d'invincibilité après une touche
  let dernierTemps = 0;
  let scoreAffiche = -1;

  // Dimensions et déplacement
  let largeur = 0, hauteur = 0;
  let cibleX = 0;           // position visée (souris / doigt)
  let mascX = 0;            // position réelle, lissée
  let mascXPrecedent = 0;   // pour connaître le sens du déplacement
  let regardX = 0;          // décalage des pupilles, lissé lui aussi
  const REGARD_MAX = 4.5;   // amplitude du regard, en unités du dessin
  const VITESSE_REGARD = 260; // au-delà, la flamme regarde à fond sur le côté
  const MASC_L = 76;        // largeur de la flamme dans le jeu
  let mascH = 96;

  function initialiser() {
    panneau = document.getElementById('jeuPanneau');
    zone = document.getElementById('jeuZone');
    canvas = document.getElementById('jeuCanvas');
    ctx = canvas.getContext('2d');
    mascotte = document.getElementById('jeuMascotte');
    message = document.getElementById('jeuMessage');
    scoreEl = document.getElementById('jeuScore');
    recordEl = document.getElementById('jeuRecord');
    vies = document.querySelectorAll('#jeuVies span');

    // La même flamme que celle du footer
    mascotte.innerHTML = window.MascotteSVG('-jeu');
    mascotte.style.width = MASC_L + 'px';
    pupilles = mascotte.querySelector('.pupilles');

    // Souris et doigt : un seul jeu d'événements
    const viser = (e) => {
      const r = zone.getBoundingClientRect();
      cibleX = e.clientX - r.left;
    };
    zone.addEventListener('pointermove', viser);
    zone.addEventListener('pointerdown', viser);

    document.getElementById('jeuFermer').addEventListener('click', () => terminer(false));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && actif) terminer(false);
    });
    window.addEventListener('resize', () => { if (actif) dimensionner(); });

    initialise = true;
  }

  function dimensionner() {
    const r = zone.getBoundingClientRect();
    largeur = r.width;
    hauteur = r.height;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(largeur * dpr);
    canvas.height = Math.round(hauteur * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mascH = mascotte.getBoundingClientRect().height || 96;
  }

  // La page reste strictement immobile pendant la partie. Figer <body> est
  // la seule méthode fiable sur iPhone, où overflow:hidden ne suffit pas.
  let scrollMemorise = 0;

  function bloquerDefilement() {
    scrollMemorise = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollMemorise}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
  }

  function libererDefilement() {
    // La page utilise scroll-behavior: smooth. Sans neutralisation, le retour
    // à la position d'origine se ferait en défilement animé : on verrait la
    // page repartir du haut et redescendre. On repose donc la vue d'un coup.
    const html = document.documentElement;
    const memoire = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';

    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    window.scrollTo(0, scrollMemorise);

    html.style.scrollBehavior = memoire;
  }

  function afficherVies() {
    vies.forEach((v, i) => v.classList.toggle('perdue', i >= viesRestantes));
  }

  function afficherMessage(texte, duree) {
    message.textContent = texte;
    message.classList.add('visible');
    if (duree) setTimeout(() => message.classList.remove('visible'), duree);
  }

  function demarrer() {
    if (!initialise) initialiser();
    if (actif) return;

    // Remise à zéro de la partie
    gouttes = [];
    temps = 0;
    attenteGoutte = 0;
    viesRestantes = 3;
    invincible = 0;
    scoreAffiche = -1;
    mascotte.classList.remove('touche-1', 'touche-2', 'invincible');
    afficherVies();
    recordEl.textContent = localStorage.getItem(CLE_RECORD) || 0;

    bloquerDefilement();
    document.body.classList.add('jeu-en-cours');
    panneau.classList.add('open');

    // On mesure une fois l'ouverture terminée, sinon la zone n'a pas
    // encore ses dimensions définitives.
    setTimeout(() => {
      dimensionner();
      cibleX = largeur / 2;
      mascX = largeur / 2 - MASC_L / 2;
      mascXPrecedent = mascX;
      regardX = 0;
      if (pupilles) pupilles.style.transform = 'translateX(0px)';
      actif = true;
      dernierTemps = performance.now();
      afficherMessage('Évite les gouttes d’eau !', 1600);
      boucleId = requestAnimationFrame(boucle);
    }, 550);
  }

  function boucle(maintenant) {
    if (!actif) return;
    // Delta temps plafonné : vitesse identique partout, pas de saut après une pause
    const dt = Math.min((maintenant - dernierTemps) / 1000, 0.05);
    dernierTemps = maintenant;
    temps += dt;

    // --- Apparition des gouttes, de plus en plus rapprochées ---
    const intervalle = Math.max(0.38, 0.95 - temps * 0.018);
    attenteGoutte += dt;
    while (attenteGoutte > intervalle && gouttes.length < 12) {
      attenteGoutte -= intervalle;
      const r = 6 + Math.random() * 5;
      gouttes.push({ x: r + Math.random() * (largeur - 2 * r), y: -14, r, v: 0.85 + Math.random() * 0.4 });
    }

    // --- Chute, de plus en plus vite ---
    const vitesse = 150 + temps * 9;
    gouttes.forEach((g) => { g.y += g.v * vitesse * dt; });
    gouttes = gouttes.filter((g) => g.y < hauteur + 20);

    // --- La flamme suit la cible en douceur ---
    const lissage = 1 - Math.exp(-10 * dt);
    mascX += (cibleX - MASC_L / 2 - mascX) * lissage;
    mascX = Math.max(0, Math.min(largeur - MASC_L, mascX));
    const inclinaison = Math.max(-13, Math.min(13, (cibleX - MASC_L / 2 - mascX) * 0.25));
    mascotte.style.transform = `translateX(${mascX}px) rotate(${inclinaison}deg)`;

    // --- Le regard suit le déplacement ---
    // Elle regarde là où elle va, et revient droit devant dès qu'elle
    // s'arrête. Le décalage est lissé pour éviter des yeux qui sautent.
    const vitesseX = (mascX - mascXPrecedent) / Math.max(dt, 0.0001);
    mascXPrecedent = mascX;
    const regardVoulu = Math.max(-1, Math.min(1, vitesseX / VITESSE_REGARD)) * REGARD_MAX;
    regardX += (regardVoulu - regardX) * (1 - Math.exp(-9 * dt));
    if (pupilles) pupilles.style.transform = `translateX(${regardX.toFixed(2)}px)`;

    // --- Collisions ---
    invincible = Math.max(0, invincible - dt);
    mascotte.classList.toggle('invincible', invincible > 0);
    if (invincible === 0) {
      const gauche = mascX + 12;
      const droite = mascX + MASC_L - 12;
      const sommet = hauteur - mascH + 16;
      const touche = gouttes.find((g) =>
        g.y + g.r > sommet && g.y - g.r < hauteur &&
        g.x + g.r > gauche && g.x - g.r < droite
      );
      if (touche) {
        gouttes = gouttes.filter((g) => g !== touche);
        viesRestantes -= 1;
        afficherVies();
        if (viesRestantes === 2) mascotte.classList.add('touche-1');
        if (viesRestantes === 1) { mascotte.classList.remove('touche-1'); mascotte.classList.add('touche-2'); }
        if (viesRestantes === 0) { terminer(true); return; }
        invincible = 1.2;
      }
    }

    // --- Dessin des gouttes ---
    ctx.clearRect(0, 0, largeur, hauteur);
    gouttes.forEach((g) => {
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
      ctx.moveTo(g.x, g.y - g.r * 2.1);
      ctx.quadraticCurveTo(g.x + g.r * 0.9, g.y - g.r * 0.5, g.x, g.y);
      ctx.quadraticCurveTo(g.x - g.r * 0.9, g.y - g.r * 0.5, g.x, g.y - g.r * 2.1);
      ctx.fillStyle = 'rgba(172, 214, 255, 0.92)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(g.x - g.r * 0.35, g.y - g.r * 0.25, g.r * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
    });

    // --- Score ---
    const score = Math.floor(temps);
    if (score !== scoreAffiche) { scoreAffiche = score; scoreEl.textContent = score; }

    boucleId = requestAnimationFrame(boucle);
  }

  function terminer(gameOver) {
    actif = false;
    cancelAnimationFrame(boucleId);

    const record = Number(localStorage.getItem(CLE_RECORD) || 0);
    if (scoreAffiche > record) localStorage.setItem(CLE_RECORD, scoreAffiche);

    const fermer = () => {
      panneau.classList.remove('open');
      document.body.classList.remove('jeu-en-cours');
      libererDefilement();
      message.classList.remove('visible');
      mascotte.classList.remove('touche-1', 'touche-2', 'invincible');
      ctx.clearRect(0, 0, largeur, hauteur);
      // Tout redevient comme avant : la flamme raccrochée, en noir et blanc
      if (window.MascotteReset) window.MascotteReset();
    };

    if (gameOver) {
      afficherMessage('Game over');
      setTimeout(fermer, 1500);
    } else {
      fermer();
    }
  }

  return { demarrer };
})();
