// Met en évidence le jour courant dans le tableau des horaires et l'année du pied de page.
(function () {
  var jour = new Date().getDay();
  var ligne = document.querySelector('.horaires tr[data-jour="' + jour + '"]');
  if (ligne) ligne.classList.add('aujourdhui');
  var annee = document.getElementById('annee');
  if (annee) annee.textContent = new Date().getFullYear();
})();

// Plan Google Maps : chargé uniquement si le visiteur l'a demandé (Google dépose des cookies).
// Le choix est mémorisé dans le navigateur, sans cookie, et peut être retiré dans « Confidentialité et cookies ».
(function () {
  var CLE = 'tables-du-cloitre-plan-google';

  function stockage(action, valeur) {
    try {
      if (action === 'get') return localStorage.getItem(CLE);
      if (action === 'set') localStorage.setItem(CLE, valeur);
      if (action === 'remove') localStorage.removeItem(CLE);
    } catch (e) {
      // navigation privée ou stockage bloqué : le choix vaut pour cette visite seulement
    }
    return null;
  }

  var plan = document.querySelector('[data-map]');
  if (plan) {
    var afficherPlan = function () {
      var iframe = document.createElement('iframe');
      iframe.title = 'Plan d’accès aux Tables du Cloître, place du Presbytère';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.src = plan.dataset.mapSrc;
      plan.replaceChildren(iframe);
    };
    if (stockage('get') === 'oui') {
      afficherPlan();
    } else {
      var bouton = plan.querySelector('[data-map-load]');
      if (bouton) bouton.addEventListener('click', function () {
        stockage('set', 'oui');
        afficherPlan();
      });
    }
  }

  // Page confidentialité : état de l'accord et bouton pour le retirer
  var retrait = document.querySelector('[data-map-revoke]');
  var etat = document.querySelector('[data-map-state]');
  if (retrait && etat) {
    var majEtat = function () {
      var accord = stockage('get') === 'oui';
      etat.textContent = accord ? 'Accord donné : le plan s’affiche.' : 'Aucun accord : le plan n’est pas chargé.';
      retrait.disabled = !accord;
    };
    retrait.addEventListener('click', function () {
      stockage('remove');
      majEtat();
    });
    majEtat();
  }
})();
