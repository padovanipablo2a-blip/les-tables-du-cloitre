// Les Tables du Cloître : interactions du site (sans dépendance, sans cookie).
(function () {
  'use strict';

  var reduitMouvement = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, racine) { return (racine || document).querySelector(sel); };
  var $$ = function (sel, racine) { return Array.prototype.slice.call((racine || document).querySelectorAll(sel)); };

  // Année du pied de page
  var annee = document.getElementById('annee');
  if (annee) annee.textContent = new Date().getFullYear();

  // ---------- Horaires : jour courant et statut « ouvert / fermé » à l'heure de Paris ----------
  // Minutes depuis minuit ; 0 = dimanche
  var midi = [720, 870], soir = [1140, 1290];
  var HORAIRES = { 0: [midi, soir], 1: [midi, soir], 2: [midi, soir], 3: [], 4: [soir], 5: [midi, soir], 6: [midi, soir] };
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  function heureParis() {
    var parts = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    var jour = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
    return { jour: jour, minutes: parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10) };
  }
  function formatHeure(m) {
    var h = Math.floor(m / 60), mn = m % 60;
    return h + ' h' + (mn ? ' ' + (mn < 10 ? '0' : '') + mn : '');
  }

  var maintenant;
  try { maintenant = heureParis(); } catch (e) { maintenant = { jour: new Date().getDay(), minutes: new Date().getHours() * 60 + new Date().getMinutes() }; }

  var ligne = $('.horaires tr[data-jour="' + maintenant.jour + '"]');
  if (ligne) ligne.classList.add('aujourdhui');

  var statut = $('[data-statut]');
  if (statut) {
    var texte = '', ouvert = false;
    var creneaux = HORAIRES[maintenant.jour];
    for (var i = 0; i < creneaux.length; i++) {
      if (maintenant.minutes >= creneaux[i][0] && maintenant.minutes < creneaux[i][1]) {
        ouvert = true;
        texte = 'Ouvert en ce moment, jusqu’à ' + formatHeure(creneaux[i][1]);
      }
    }
    if (!ouvert) {
      // Prochaine ouverture
      for (var d = 0; d < 8 && !texte; d++) {
        var j = (maintenant.jour + d) % 7;
        var liste = HORAIRES[j];
        for (var k = 0; k < liste.length; k++) {
          if (d > 0 || liste[k][0] > maintenant.minutes) {
            var quand = d === 0 ? 'aujourd’hui' : d === 1 ? 'demain' : JOURS[j];
            texte = 'Fermé pour le moment, ouvre ' + quand + ' à ' + formatHeure(liste[k][0]);
            break;
          }
        }
      }
    }
    $('[data-statut-texte]', statut).textContent = texte;
    statut.classList.toggle('est-ouvert', ouvert);
    statut.hidden = false;
  }

  // ---------- En-tête, bouton « haut de page », barre mobile ----------
  var entete = $('[data-entete]');
  var haut = $('[data-haut]');
  var barre = $('[data-barre-mobile]');
  var ouverture = $('.ouverture');
  function auDefilement() {
    var y = window.scrollY;
    var seuil = ouverture ? ouverture.offsetHeight - 120 : 40;
    if (entete && !entete.classList.contains('entete--plein')) entete.classList.toggle('est-defile', y > 40);
    if (haut) haut.classList.toggle('visible', y > 900);
    if (barre) barre.classList.toggle('visible', y > seuil);
  }
  window.addEventListener('scroll', auDefilement, { passive: true });
  auDefilement();
  if (haut) haut.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduitMouvement ? 'auto' : 'smooth' }); });

  // ---------- Menu mobile ----------
  var burger = $('[data-burger]');
  var nav = $('[data-nav]');
  function fermerMenu() {
    if (!nav || !nav.classList.contains('ouvert')) return;
    nav.classList.remove('ouvert');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-ouvert');
    entete.classList.remove('menu-actif');
  }
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var ouvrir = !nav.classList.contains('ouvert');
      if (!ouvrir) { fermerMenu(); return; }
      nav.classList.add('ouvert');
      burger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-ouvert');
      entete.classList.add('menu-actif');
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', fermerMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fermerMenu(); });
  }

  // Lien de navigation actif selon la section visible
  var liensNav = $$('.nav__liens a');
  if ('IntersectionObserver' in window && liensNav.length) {
    var obsSections = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) {
        if (!en.isIntersecting) return;
        liensNav.forEach(function (a) {
          a.setAttribute('aria-current', a.getAttribute('href') === '/#' + en.target.id ? 'true' : 'false');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    liensNav.forEach(function (a) {
      var cible = document.getElementById(a.getAttribute('href').split('#')[1]);
      if (cible) obsSections.observe(cible);
    });
  }

  // ---------- Apparitions au défilement ----------
  var aReveler = $$('.revele, .revele-ogive');
  if ('IntersectionObserver' in window && !reduitMouvement) {
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('est-visible'); obs.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    aReveler.forEach(function (el) { obs.observe(el); });
  } else {
    aReveler.forEach(function (el) { el.classList.add('est-visible'); });
  }

  // Compteur de la note Google
  var compteur = $('[data-compteur]');
  if (compteur && 'IntersectionObserver' in window && !reduitMouvement) {
    var cibleNote = parseFloat(compteur.dataset.compteur);
    var obsNote = new IntersectionObserver(function (entrees) {
      if (!entrees[0].isIntersecting) return;
      obsNote.disconnect();
      var debut = null;
      (function pas(t) {
        if (!debut) debut = t;
        var p = Math.min((t - debut) / 1400, 1);
        var v = cibleNote * (1 - Math.pow(1 - p, 3));
        compteur.textContent = v.toFixed(1).replace('.', ',');
        if (p < 1) requestAnimationFrame(pas);
      })(performance.now());
    }, { threshold: 0.6 });
    obsNote.observe(compteur);
  }

  // ---------- Onglets de la carte ----------
  var onglets = $('[data-onglets]');
  if (onglets) {
    var boutons = $$('[role="tab"]', onglets);
    var indicateur = $('.onglets__indicateur', onglets);
    var image = $('[data-carte-image]');
    var legende = $('[data-carte-legende]');

    var placerIndicateur = function () {
      var actif = $('[aria-selected="true"]', onglets);
      if (!actif || !indicateur) return;
      indicateur.style.width = actif.offsetWidth + 'px';
      indicateur.style.height = actif.offsetHeight + 'px';
      indicateur.style.transform = 'translate(' + actif.offsetLeft + 'px, ' + actif.offsetTop + 'px)';
    };

    var activer = function (bouton, focus) {
      boutons.forEach(function (b) {
        var actif = b === bouton;
        b.setAttribute('aria-selected', actif ? 'true' : 'false');
        b.tabIndex = actif ? 0 : -1;
        var panneau = document.getElementById(b.getAttribute('aria-controls'));
        panneau.hidden = !actif;
        if (actif) { panneau.classList.remove('entre'); void panneau.offsetWidth; panneau.classList.add('entre'); }
      });
      if (focus) bouton.focus();
      placerIndicateur();
      if (image && bouton.dataset.image && image.getAttribute('src') !== bouton.dataset.image) {
        image.classList.add('change');
        setTimeout(function () {
          image.src = bouton.dataset.image;
          legende.textContent = bouton.dataset.legende || '';
          image.onload = function () { image.classList.remove('change'); };
        }, reduitMouvement ? 0 : 250);
      }
    };

    boutons.forEach(function (b, i) {
      b.addEventListener('click', function () { activer(b, false); });
      b.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = boutons[(i + 1) % boutons.length];
        if (e.key === 'ArrowLeft') n = boutons[(i - 1 + boutons.length) % boutons.length];
        if (e.key === 'Home') n = boutons[0];
        if (e.key === 'End') n = boutons[boutons.length - 1];
        if (n) { e.preventDefault(); activer(n, true); }
      });
    });
    placerIndicateur();
    window.addEventListener('resize', placerIndicateur);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placerIndicateur);
  }

  // ---------- Galerie et visionneuse ----------
  var galerie = $('[data-galerie]');
  var visionneuse = $('[data-visionneuse]');
  if (galerie && visionneuse && typeof visionneuse.showModal === 'function') {
    var vignettes = $$('button', galerie);
    var vImage = $('[data-v-image]', visionneuse);
    var vLegende = $('[data-v-legende]', visionneuse);
    var vCompteur = $('[data-v-compteur]', visionneuse);
    var courant = 0;

    var montrer = function (i) {
      courant = (i + vignettes.length) % vignettes.length;
      var img = $('img', vignettes[courant]);
      var nouvelle = vImage.cloneNode();
      nouvelle.src = img.currentSrc || img.src;
      nouvelle.alt = img.alt;
      vImage.replaceWith(nouvelle);
      vImage = nouvelle;
      vLegende.textContent = $('span', vignettes[courant]).textContent;
      vCompteur.textContent = (courant + 1) + ' / ' + vignettes.length;
    };

    vignettes.forEach(function (v, i) {
      v.addEventListener('click', function () { montrer(i); visionneuse.showModal(); });
    });
    $('[data-v-prec]', visionneuse).addEventListener('click', function () { montrer(courant - 1); });
    $('[data-v-suiv]', visionneuse).addEventListener('click', function () { montrer(courant + 1); });
    $('[data-v-fermer]', visionneuse).addEventListener('click', function () { visionneuse.close(); });
    visionneuse.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') montrer(courant + 1);
      if (e.key === 'ArrowLeft') montrer(courant - 1);
    });
    visionneuse.addEventListener('close', function () { vignettes[courant].focus(); });
    // Balayage au doigt
    var xDepart = null;
    visionneuse.addEventListener('touchstart', function (e) { xDepart = e.touches[0].clientX; }, { passive: true });
    visionneuse.addEventListener('touchend', function (e) {
      if (xDepart === null) return;
      var dx = e.changedTouches[0].clientX - xDepart;
      if (Math.abs(dx) > 50) montrer(courant + (dx < 0 ? 1 : -1));
      xDepart = null;
    });
  }

  // ---------- Message bref (toast) et copie du numéro ----------
  var toast = $('[data-toast]');
  var minuterie;
  function annoncer(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(minuterie);
    minuterie = setTimeout(function () { toast.classList.remove('visible'); }, 2600);
  }
  $$('[data-copier]').forEach(function (b) {
    b.addEventListener('click', function () {
      var valeur = b.dataset.copier;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(valeur).then(function () { annoncer('Numéro copié : ' + valeur); },
          function () { annoncer('Copie impossible, notez le ' + valeur); });
      } else {
        annoncer('Copie impossible, notez le ' + valeur);
      }
    });
  });

  // ---------- Plan Google Maps : chargé uniquement si le visiteur l'a demandé ----------
  // Le choix est mémorisé dans le navigateur, sans cookie, et peut être retiré dans « Confidentialité et cookies ».
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

  var plan = $('[data-map]');
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
      var boutonPlan = $('[data-map-load]', plan);
      if (boutonPlan) boutonPlan.addEventListener('click', function () {
        stockage('set', 'oui');
        afficherPlan();
      });
    }
  }

  var retrait = $('[data-map-revoke]');
  var etat = $('[data-map-state]');
  if (retrait && etat) {
    var majEtat = function () {
      var accord = stockage('get') === 'oui';
      etat.textContent = accord ? 'Accord donné : le plan s’affiche.' : 'Aucun accord : le plan n’est pas chargé.';
      retrait.disabled = !accord;
    };
    retrait.addEventListener('click', function () {
      stockage('remove');
      majEtat();
      annoncer('Accord retiré : le plan ne se chargera plus.');
    });
    majEtat();
  }
})();
