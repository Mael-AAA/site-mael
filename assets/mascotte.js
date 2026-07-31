// ===== Mascotte : petite flamme accrochée au pied de page =====
// Dessin original en SVG : les yeux clignent, les pupilles regardent
// autour, la flamme vacille. Trois clics la colorent, le troisième
// lance le mini-jeu (assets/jeu.js, chargé uniquement à ce moment-là).

(() => {
  const footer = document.querySelector('footer');
  if (!footer) return;

  // Le dessin de la flamme. Le suffixe évite les doublons d'identifiants
  // quand la même flamme est affichée deux fois (footer + jeu).
  const dessinFlamme = (suffixe) => `
<svg viewBox="0 0 200 258" class="mascotte-svg" aria-hidden="true">
  <defs>
    <radialGradient id="feu${suffixe}" cx="50%" cy="72%" r="75%">
      <stop offset="0%" stop-color="#ffe9a3"/>
      <stop offset="45%" stop-color="#ffb545"/>
      <stop offset="100%" stop-color="#f2571f"/>
    </radialGradient>
    <radialGradient id="coeurfeu${suffixe}" cx="50%" cy="80%" r="70%">
      <stop offset="0%" stop-color="#fff7d6"/>
      <stop offset="100%" stop-color="#ffcf5c"/>
    </radialGradient>
  </defs>

  <!-- Petits bras qui s'agrippent au rebord (ne vacillent pas) -->
  <g fill="url(#feu${suffixe})" stroke="#2a1512" stroke-width="5" stroke-linejoin="round">
    <path d="M74,180 C68,206 70,230 79,246 C83,254 94,254 96,245 C99,231 96,208 91,188 Z"/>
    <path d="M126,180 C132,206 130,230 121,246 C117,254 106,254 104,245 C101,231 104,208 109,188 Z"/>
  </g>

  <!-- Corps de flamme (vacille doucement) -->
  <g class="flamme-vacille">
    <path fill="url(#feu${suffixe})" stroke="#2a1512" stroke-width="6" stroke-linejoin="round"
      d="M100,10
         C96,34 76,44 62,64
         C46,86 40,116 46,142
         C53,172 74,194 100,196
         C126,194 147,172 154,142
         C160,116 154,86 138,64
         C124,44 104,34 100,10 Z"/>
    <path fill="url(#coeurfeu${suffixe})" opacity="0.9"
      d="M100,62
         C94,80 80,90 74,108
         C68,128 72,150 86,164
         C95,172 105,172 114,164
         C128,150 132,128 126,108
         C120,90 106,80 100,62 Z"/>

    <!-- Joues roses (clin d'œil à la couleur du site) -->
    <circle cx="70" cy="142" r="7" fill="#f7b8d4" opacity="0.65"/>
    <circle cx="130" cy="142" r="7" fill="#f7b8d4" opacity="0.65"/>

    <!-- Yeux (clignent) -->
    <g class="yeux">
      <ellipse cx="82" cy="124" rx="13.5" ry="15.5" fill="#fff" stroke="#2a1512" stroke-width="4.5"/>
      <ellipse cx="118" cy="124" rx="13.5" ry="15.5" fill="#fff" stroke="#2a1512" stroke-width="4.5"/>
      <g class="pupilles" fill="#2a1512">
        <circle cx="83" cy="127" r="5"/>
        <circle cx="119" cy="127" r="5"/>
      </g>
    </g>

    <!-- Sourire -->
    <path d="M90,152 Q100,162 110,152" fill="none" stroke="#2a1512" stroke-width="4.5" stroke-linecap="round"/>
  </g>
</svg>`;

  // Rendu accessible au jeu, qui affiche la même flamme dans sa zone
  window.MascotteSVG = dessinFlamme;

  // --- La mascotte accrochée au footer ---
  const bouton = document.createElement('button');
  bouton.id = 'mascotte';
  bouton.type = 'button';
  bouton.setAttribute('aria-label', 'Une petite flamme mystérieuse');
  bouton.innerHTML = dessinFlamme('-footer');
  footer.appendChild(bouton);

  // --- Le panneau de jeu, replié au-dessus du footer ---
  const panneau = document.createElement('div');
  panneau.id = 'jeuPanneau';
  panneau.className = 'jeu-panneau';
  panneau.innerHTML = `
    <div class="jeu-cadre">
      <div class="jeu-hud">
        <span>Score&nbsp;: <b id="jeuScore">0</b></span>
        <span>Record&nbsp;: <b id="jeuRecord">0</b></span>
        <span class="jeu-vies" id="jeuVies" aria-label="Vies restantes"><span></span><span></span><span></span></span>
        <button id="jeuFermer" type="button" aria-label="Fermer le jeu">✕</button>
      </div>
      <div id="jeuZone" class="jeu-zone">
        <canvas id="jeuCanvas"></canvas>
        <div id="jeuMascotte"></div>
        <div id="jeuMessage" class="jeu-message"></div>
      </div>
    </div>`;
  // Attaché au <body> et non au pied de page : un élément en position fixe
  // placé dans un conteneur transformé se calerait sur ce conteneur au lieu
  // de l'écran.
  document.body.appendChild(panneau);

  // --- Trois clics pour la colorer, le troisième lance le jeu ---
  let etape = 0;
  let scriptJeuCharge = false;

  const lancerJeu = () => {
    const demarrer = () => window.JeuGouttes && window.JeuGouttes.demarrer();
    if (scriptJeuCharge) { demarrer(); return; }
    const script = document.createElement('script');
    script.src = 'assets/jeu.js';
    script.onload = () => { scriptJeuCharge = true; demarrer(); };
    document.body.appendChild(script);
  };

  bouton.addEventListener('click', () => {
    if (document.body.classList.contains('jeu-en-cours')) return;
    etape = Math.min(etape + 1, 3);
    bouton.classList.toggle('etape-1', etape === 1);
    bouton.classList.toggle('etape-2', etape === 2);
    bouton.classList.toggle('etape-3', etape === 3);
    if (etape === 3) lancerJeu();
  });

  // Le jeu rappelle cette fonction pour tout remettre à zéro
  window.MascotteReset = () => {
    etape = 0;
    bouton.classList.remove('etape-1', 'etape-2', 'etape-3');
  };
})();
