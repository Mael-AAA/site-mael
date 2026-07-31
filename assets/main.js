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
