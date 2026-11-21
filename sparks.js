// Іскри зварювання: лише на баннері #weld. Дотик або клік викликає викид іскор, поки тримаєш, вони сиплються далі.
(function () {
  var box = document.getElementById('weld');
  if (!box) return;
  var cv = box.querySelector('canvas');
  var v = box.querySelector('video');
  var hint = box.querySelector('.weld-hint');
  var ctx = cv.getContext('2d');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    if (v) { v.removeAttribute('autoplay'); v.pause(); }
    if (hint) hint.style.display = 'none';
    return;
  }

  var dpr = Math.min(window.devicePixelRatio || 1, 2), W = 0, H = 0, P = [], raf = 0, last = 0;
  var hold = false, hx = 0, hy = 0;

  function size() {
    var r = box.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  window.addEventListener('resize', size);

  function spawn(x, y, n) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, s = 70 + Math.random() * 330;
      P.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 90, life: 0, ttl: 0.5 + Math.random() * 0.8 });
    }
  }
  function start() {
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }
  function tick(t) {
    var dt = Math.min(0.033, (t - last) / 1000);
    last = t;
    if (hold) spawn(hx, hy, 3);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (var i = P.length - 1; i >= 0; i--) {
      var p = P[i];
      p.life += dt;
      if (p.life >= p.ttl) { P.splice(i, 1); continue; }
      var px = p.x, py = p.y;
      p.vy += 720 * dt;
      p.vx *= 0.996;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.y > H - 2) { p.y = H - 2; p.vy *= -0.35; p.vx *= 0.7; }
      var k = 1 - p.life / p.ttl;
      ctx.strokeStyle = 'rgba(255,' + ((150 + 105 * k) | 0) + ',' + ((40 + 150 * k * k) | 0) + ',' + k.toFixed(2) + ')';
      ctx.lineWidth = 1 + 1.6 * k;
      ctx.beginPath();
      ctx.moveTo(px - p.vx * dt * 0.8, py - p.vy * dt * 0.8);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    if (P.length || hold) raf = requestAnimationFrame(tick);
    else { raf = 0; ctx.clearRect(0, 0, W, H); }
  }
  function pos(e) {
    var r = box.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  box.addEventListener('pointerdown', function (e) {
    var p = pos(e);
    hold = true; hx = p.x; hy = p.y;
    box.classList.add('used');
    spawn(p.x, p.y, 32);
    start();
  });
  box.addEventListener('pointermove', function (e) {
    if (!hold) return;
    var p = pos(e);
    hx = p.x; hy = p.y;
    spawn(p.x, p.y, 4);
    start();
  });
  function end() { hold = false; }
  box.addEventListener('pointerup', end);
  box.addEventListener('pointercancel', end);
  box.addEventListener('pointerleave', end);

  // економимо батарею: відео стоїть, коли баннер поза екраном
  if (v && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (x.isIntersecting) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } else v.pause();
      });
    }, { threshold: 0.1 }).observe(box);
  }
})();
