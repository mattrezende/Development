/* Personal Fight — comportamento compartilhado do site
   Carregado em todas as páginas (sticky CTA mobile, rastreamento, máscara de telefone).
   ------------------------------------------------------------------
   CONFIGURE AQUI: cole os IDs do André para ativar o rastreamento de conversão.
   Enquanto estiverem vazios, nada é enviado (site funciona normalmente). */
window.PF_CONFIG = window.PF_CONFIG || {
  metaPixelId: '',   // ex.: '1234567890'  (Gerenciador de Anúncios > Eventos)
  ga4Id: '',         // ex.: 'G-XXXXXXXXXX' (Google Analytics 4)
  whatsapp: '5561996085008'
};

(function () {
  var C = window.PF_CONFIG;

  /* ---------- Meta Pixel (só inicializa se houver ID) ---------- */
  if (C.metaPixelId) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', C.metaPixelId);
    window.fbq('track', 'PageView');
  }

  /* ---------- Google Analytics 4 (só inicializa se houver ID) ---------- */
  if (C.ga4Id) {
    var g = document.createElement('script'); g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + C.ga4Id;
    document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', C.ga4Id);
  }

  /* ---------- Disparo de eventos de conversão ---------- */
  window.pfTrack = function (label) {
    try { if (window.fbq) window.fbq('track', 'Lead', { content_name: label || 'whatsapp' }); } catch (e) {}
    try { if (window.gtag) window.gtag('event', 'generate_lead', { origem: label || 'whatsapp' }); } catch (e) {}
  };

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    if (!document.documentElement.lang) document.documentElement.lang = 'pt-BR';

    /* rastrear cliques em qualquer link do WhatsApp */
    document.addEventListener('click', function (ev) {
      var a = ev.target && ev.target.closest ? ev.target.closest('a[href*="wa.me"]') : null;
      if (a) {
        var label = a.getAttribute('data-cta') || 'whatsapp';
        window.pfTrack(label);
      }
    }, true);

    /* ---------- Reveal on scroll (cards) ---------- */
    var revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(function (el) { io.observe(el); });
      } else {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
      }
    }

    /* máscara de telefone BR em qualquer input[type=tel] */
    document.querySelectorAll('input[type="tel"]').forEach(function (inp) {
      inp.addEventListener('input', function () {
        var d = inp.value.replace(/\D/g, '').slice(0, 11);
        var out = d;
        if (d.length > 10) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
        else if (d.length > 6) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
        else if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
        else if (d.length > 0) out = '(' + d;
        inp.value = out;
      });
    });

    /* ---------- Sticky CTA WhatsApp (mobile) ---------- */
    if (!document.getElementById('pf-sticky-cta')) {
      var st = document.createElement('style');
      st.textContent =
        '#pf-sticky-cta{display:none;}' +
        '@media (max-width:920px){' +
        '#pf-sticky-cta{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:9999;' +
        'padding:10px 14px calc(10px + env(safe-area-inset-bottom));' +
        'background:linear-gradient(180deg,rgba(10,10,11,0),rgba(10,10,11,0.92) 34%);}' +
        '#pf-sticky-cta a{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:10px;' +
        "font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;" +
        'font-size:18px;color:#fff;text-decoration:none;background:linear-gradient(180deg,#E8127C,#A8095A);' +
        'padding:15px 20px;border-radius:10px;box-shadow:0 8px 26px rgba(232,18,124,0.45);}' +
        'body{padding-bottom:0;}' +
        '@media (max-width:920px){body{padding-bottom:78px;}}';
      document.head.appendChild(st);

      var msg = 'Olá André! Estava no seu site e quero agendar minha aula experimental de Muay Thai.';
      var bar = document.createElement('div');
      bar.id = 'pf-sticky-cta';
      bar.innerHTML =
        '<a href="https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(msg) + '" ' +
        'target="_blank" rel="noopener" data-cta="sticky-mobile" aria-label="Agendar aula experimental pelo WhatsApp">' +
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35zM12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.42 1.27 4.86L2 22l5.25-1.38A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>' +
        'Agendar aula experimental</a>';
      document.body.appendChild(bar);
    }
  });
})();
