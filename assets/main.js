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
