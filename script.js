(function () {
  document.documentElement.classList.add('js');

  // Menú móvil
  var header = document.querySelector('.site-header');
  var button = document.querySelector('.menu');
  if (header && button) {
    var setOpen = function (open) {
      header.classList.toggle('open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      button.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };
    button.addEventListener('click', function () {
      setOpen(!header.classList.contains('open'));
    });
    header.querySelectorAll('.mobile-menu a').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Aparición suave al bajar
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) { io.observe(el); });
  }

  // Números del panel que cuentan al cargar
  if (!reduce) {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var start = null;
      var step = function (t) {
        if (!start) start = t;
        var p = Math.min((t - start) / 900, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      el.textContent = '0';
      requestAnimationFrame(step);
    });
  }
})();

// Formulario de demo: valida y abre un correo listo para enviar.
(function () {
  var form = document.getElementById('demo-form');
  if (!form) return;
  var errorBox = document.getElementById('form-error');
  var done = document.getElementById('form-done');
  var required = ['nombre', 'agencia', 'telefono', 'empleados', 'tipo'];
  var labels = { nombre: 'Nombre', agencia: 'Agencia u hogar', telefono: 'Teléfono', email: 'Correo', empleados: 'Empleados', tipo: 'Tipo', mensaje: 'Qué quiere resolver' };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    required.forEach(function (name) {
      var el = form.elements[name];
      var empty = !el.value.trim();
      el.closest('.field').classList.toggle('invalid', empty);
      el.setAttribute('aria-invalid', empty ? 'true' : 'false');
      if (empty && ok) { el.focus(); ok = false; }
    });
    errorBox.hidden = ok;
    if (!ok) return;

    var lines = Object.keys(labels).map(function (name) {
      var v = form.elements[name].value.trim();
      return v ? labels[name] + ': ' + v : null;
    }).filter(Boolean);
    var subject = 'Demo de ETNARA · ' + form.elements.agencia.value.trim();
    var body = 'Hola, quiero una demostración de ETNARA.\n\n' + lines.join('\n');
    window.location.href = 'mailto:etnaracare@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    form.hidden = true;
    done.hidden = false;
  });
})();
