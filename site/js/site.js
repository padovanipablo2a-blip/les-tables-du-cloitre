// Met en évidence le jour courant dans le tableau des horaires et l'année du pied de page.
(function () {
  var jour = new Date().getDay();
  var ligne = document.querySelector('.horaires tr[data-jour="' + jour + '"]');
  if (ligne) ligne.classList.add('aujourdhui');
  var annee = document.getElementById('annee');
  if (annee) annee.textContent = new Date().getFullYear();
})();
