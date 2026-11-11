// Ragnar site: the scroll story scroll story and the paint request form. The page works without it.
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- night shift: scroll scrubs the frames ----------
  var shift = document.querySelector('.shift');
  if (shift) {
    var N = 42, WALL_END = 27;
    var canvas = shift.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    var steps = [].slice.call(shift.querySelectorAll('.shift-steps li'));
    var wNum = shift.querySelector('.shift-meter .w b');
    var cNum = shift.querySelector('.shift-meter .c b');
    var track = shift.querySelector('.shift-track');
    var frames = [], loaded = false, cur = -1, ticking = false;

    var load = function () {
      if (loaded) return;
      loaded = true;
      for (var i = 0; i < N; i++) {
        var im = new Image();
        im.decoding = 'async';
        im.src = 'assets/img/shift_' + (i < 10 ? '0' : '') + i + '.webp';
        frames.push(im);
        if (i === 0) im.onload = function () { draw(Math.max(cur, 0), true); };
      }
    };
    var draw = function (i, force) {
      if (i === cur && !force) return;
      var im = frames[i];
      if (!im || !im.complete || !im.naturalWidth) {
        for (var k = i; k >= 0; k--) { if (frames[k] && frames[k].complete && frames[k].naturalWidth) { im = frames[k]; break; } }
        if (!im || !im.naturalWidth) return;
      }
      ctx.drawImage(im, 0, 0, canvas.width, canvas.height);
      cur = i;
    };
    var update = function () {
      ticking = false;
      var r = track.getBoundingClientRect();
      var span = r.height - window.innerHeight;
      var p = span > 0 ? Math.min(Math.max(-r.top / span, 0), 1) : 0;
      var i = Math.round(p * (N - 1));
      draw(i);
      var w = Math.min(i / WALL_END, 1), c = i > WALL_END ? (i - WALL_END) / (N - 1 - WALL_END) : 0;
      wNum.textContent = Math.round(w * 100);
      cNum.textContent = Math.round(c * 100);
      var on = 0;
      steps.forEach(function (li, k) { if (i >= +li.getAttribute('data-f')) on = k; });
      steps.forEach(function (li, k) { li.classList.toggle('on', k === on); });
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    if (!still && 'IntersectionObserver' in window) {
      shift.classList.add('live');
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { load(); update(); } });
      }, { rootMargin: '600px 0px' }).observe(shift);
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
    } else {
      shift.classList.add('static');
    }
  }


  // ---------- looping clips: play only while on screen (and not paused, and not reduced motion) ----------
  var loops = [].slice.call(document.querySelectorAll('video[loop]'));
  var boxOf = function (v) { return v.closest('figure, section, .swap-stage') || v.parentNode; };
  var pauseBox = function (v) { var b = boxOf(v); return b ? b.querySelector('.band-pause') : null; };
  var want = function (v) { var p = pauseBox(v); return !still && v.__seen && !(p && p.checked) && v.offsetParent !== null; };
  var sync = function (v) {
    if (want(v)) { var r = v.play(); if (r && r.catch) r.catch(function () {}); }
    else if (!v.paused) v.pause();
  };
  if (loops.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.target.__seen = e.isIntersecting; sync(e.target); });
      }, { rootMargin: '200px 0px' });
      loops.forEach(function (v) { io.observe(v); });
    } else {
      loops.forEach(function (v) { v.__seen = true; sync(v); });
    }
    document.addEventListener('change', function (e) {
      if (e.target.matches && e.target.matches('.band-pause, input[name="tool"]')) {
        setTimeout(function () { loops.forEach(sync); }, 0);
      }
    });
    document.addEventListener('visibilitychange', function () {
      loops.forEach(function (v) { if (document.hidden) v.pause(); else sync(v); });
    });
  }

  // ---------- paint request: four short steps, then the email app ----------
  var form = document.getElementById('ask');
  if (form) {
    var qs = [].slice.call(form.querySelectorAll('.q'));
    var back = form.querySelector('.back');
    var next = form.querySelector('.next');
    var err = form.querySelector('.ask-err');
    var done = document.getElementById('ask-done');
    var at = 0;
    form.classList.add('stepped');
    var show = function (k) {
      at = k;
      qs.forEach(function (q, j) { q.hidden = j !== k; });
      back.hidden = k === 0;
      next.textContent = k === qs.length - 1 ? 'Send request' : 'Next';
      err.textContent = '';
    };
    var val = function (n) {
      var el = form.elements[n];
      if (!el) return '';
      if (el.length !== undefined && el.tagName === undefined) {
        for (var i = 0; i < el.length; i++) if (el[i].checked) return el[i].value;
        return '';
      }
      return (el.value || '').trim();
    };
    var check = function (k) {
      var q = qs[k];
      if (k === 0) {
        if (!val('what')) return 'Pick walls, ceilings or both.';
        if (!val('rooms')) return 'How many rooms?';
        if (!val('kind')) return 'Is it a home or a jobsite?';
      }
      if (k === 1 && !/^\d{5}$/.test(val('zip'))) return 'Enter a 5 digit ZIP code.';
      if (k === 2 && !val('when')) return 'Pick a time.';
      if (k === 3) {
        if (!val('name')) return 'Add your name.';
        if (val('contact').length < 5) return 'Add a phone number or an email.';
      }
      return '';
    };
    back.addEventListener('click', function () { if (at > 0) show(at - 1); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = check(at);
      if (m) { err.textContent = m; return; }
      if (at < qs.length - 1) { show(at + 1); var f = qs[at].querySelector('input'); if (f) f.focus(); return; }
      var to = form.getAttribute('data-to');
      var subj = 'Paint request: ' + val('rooms') + ', ' + val('what').toLowerCase() + ', ' + val('zip');
      var body = [
        'What: ' + val('what') + ', ' + val('rooms') + ' (' + val('kind') + ')',
        'Where: ' + val('zip') + (val('addr') ? ', ' + val('addr') : ''),
        'When: ' + val('when'),
        'Name: ' + val('name'),
        'Contact: ' + val('contact')
      ].join('\n');
      window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body);
      form.hidden = true;
      done.hidden = false;
      done.focus();
    });
    show(0);
  }
})();
