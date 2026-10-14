/* Caritas demo: shared behaviour. No cookies, no tracking, nothing is sent anywhere. */
(function () {
  var WA = "2348033434632";
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function wa(msg) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg); }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // mobile menu: closes after a link is chosen and on Escape
  var mb = $(".menu-btn"), nav = $("nav.links");
  function setMenu(open) {
    if (!nav || !mb) return;
    nav.classList.toggle("open", open);
    mb.setAttribute("aria-expanded", open ? "true" : "false");
  }
  if (mb && nav) {
    mb.setAttribute("aria-expanded", "false");
    mb.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  }

  // hero slideshow: stops on hover and focus, and does not run at all for people who asked for less motion
  var slides = $$(".slide"), dots = $$(".dots button"), cur = 0, timer, hero = $(".hero");
  function show(i) {
    if (!slides.length) return;
    cur = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) { s.classList.toggle("on", n === cur); s.setAttribute("aria-hidden", n === cur ? "false" : "true"); });
    dots.forEach(function (d, n) { d.classList.toggle("on", n === cur); d.setAttribute("aria-current", n === cur ? "true" : "false"); });
  }
  function auto() { clearInterval(timer); if (!reduce && slides.length > 1) timer = setInterval(function () { show(cur + 1); }, 5600); }
  dots.forEach(function (d, n) { d.addEventListener("click", function () { show(n); auto(); }); });
  if (slides.length) {
    show(0); auto();
    if (hero) {
      hero.addEventListener("mouseenter", function () { clearInterval(timer); });
      hero.addEventListener("mouseleave", auto);
      hero.addEventListener("focusin", function () { clearInterval(timer); });
    }
    document.addEventListener("visibilitychange", function () { if (document.hidden) clearInterval(timer); else auto(); });
  }

  // modal (check your date)
  var lastFocus = null;
  function closeModals() {
    $$(".modal").forEach(function (m) { m.classList.remove("on"); });
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$("[data-open]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      var m = $("#m-" + b.getAttribute("data-open"));
      if (!m) return;
      e.preventDefault();
      lastFocus = b;
      var h = b.getAttribute("data-hall");
      if (h) m.setAttribute("data-hall", h); else m.removeAttribute("data-hall");
      var f = $("form", m), o = $(".out", m);
      if (f) f.style.display = "";
      if (o) o.style.display = "none";
      m.classList.add("on"); document.body.style.overflow = "hidden";
      var first = $("input,select,button", m); if (first && first.focus) setTimeout(function () { var i = $("input", m); (i || first).focus(); }, 30);
    });
  });
  $$("[data-close]").forEach(function (b) { b.addEventListener("click", closeModals); });
  $$(".modal").forEach(function (m) { m.addEventListener("click", function (e) { if (e.target === m) closeModals(); }); });

  // check your date -> WhatsApp preview
  var fd = $("#f-date");
  if (fd) {
    var di = $("#d-date"); if (di) di.min = new Date().toISOString().slice(0, 10);
    fd.addEventListener("submit", function (e) {
      e.preventDefault();
      var m = $("#m-date"), hall = m.getAttribute("data-hall") || "";
      var d = new Date($("#d-date").value + "T12:00:00");
      var ds = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      var msg = "Hello, my name is " + $("#d-name").value.trim() + ". Is " + (hall || "a hall") + " available on " + ds +
        " for a " + $("#d-type").value.toLowerCase() + " of about " + $("#d-guests").value + " guests?";
      $("#d-msg").textContent = msg; $("#d-wa").href = wa(msg);
      fd.style.display = "none"; $("#m-date .out").style.display = "block";
    });
  }
  $$("[data-guide]").forEach(function (a) {
    a.href = wa("Hello, please send me the price guide and photos for Caritas Events Centre.");
    a.target = "_blank"; a.rel = "noopener";
  });
  $$("[data-wa]").forEach(function (a) {
    a.href = wa(a.getAttribute("data-wa")); a.target = "_blank"; a.rel = "noopener";
  });
  $$("[data-share]").forEach(function (a) {
    a.href = "https://wa.me/?text=" + encodeURIComponent("Please look at this venue for our event: " + location.href.split("#")[0]);
    a.target = "_blank"; a.rel = "noopener";
  });

  // lightbox with previous and next, built only when opened (no empty image sitting on the page)
  var lb = null, lbItems = [], lbAt = 0;
  function lbBuild() {
    lb = document.createElement("div");
    lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Photo viewer");
    lb.innerHTML = '<button class="lb-x" aria-label="Close">&times;</button><button class="lb-p" aria-label="Previous photo">&#8249;</button>' +
      '<button class="lb-n" aria-label="Next photo">&#8250;</button><div class="cap2"></div>';
    document.body.appendChild(lb);
    lb.addEventListener("click", function (e) { if (e.target === lb) lbClose(); });
    $(".lb-x", lb).addEventListener("click", lbClose);
    $(".lb-p", lb).addEventListener("click", function () { lbShow(lbAt - 1); });
    $(".lb-n", lb).addEventListener("click", function () { lbShow(lbAt + 1); });
  }
  function lbShow(i) {
    lbAt = (i + lbItems.length) % lbItems.length;
    var it = lbItems[lbAt], old = $("img", lb);
    if (old) old.remove();
    var im = document.createElement("img"); im.alt = it.alt; im.src = it.src;
    lb.insertBefore(im, $(".cap2", lb));
    $(".cap2", lb).textContent = it.alt + "  (" + (lbAt + 1) + " of " + lbItems.length + ")";
  }
  function lbClose() { if (lb) { lb.classList.remove("on"); var o = $("img", lb); if (o) o.remove(); } document.body.style.overflow = ""; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  $$("[data-zoom]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (!lb) lbBuild();
      var gname = b.getAttribute("data-group");
      var pool = gname ? $$("[data-zoom]").filter(function (x) { return x.getAttribute("data-group") === gname; }) : $$("[data-zoom]", b.closest(".tabpane") || b.closest(".gal") || document);
      var group = pool.filter(function (x) { return x.offsetParent !== null; });
      lbItems = group.map(function (x) { var im = $("img", x); return { src: x.getAttribute("data-full") || im.currentSrc || im.src, alt: im.alt }; });
      lastFocus = b; lb.classList.add("on"); document.body.style.overflow = "hidden";
      lbShow(Math.max(0, group.indexOf(b)));
      $(".lb-x", lb).focus();
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeModals(); lbClose(); setMenu(false); }
    if (lb && lb.classList.contains("on")) {
      if (e.key === "ArrowRight") lbShow(lbAt + 1);
      if (e.key === "ArrowLeft") lbShow(lbAt - 1);
    }
  });

  // gallery filter chips
  $$(".chips[data-for]").forEach(function (chips) {
    var scope = document.getElementById(chips.getAttribute("data-for")) || document;
    $$("button", chips).forEach(function (c) {
      c.addEventListener("click", function () {
        $$("button", chips).forEach(function (x) { x.classList.toggle("on", x === c); x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
        var k = c.getAttribute("data-f");
        $$("[data-cat]", scope).forEach(function (g) {
          var cats = (g.getAttribute("data-cat") || "").split(" ");
          g.style.display = (k === "all" || cats.indexOf(k) > -1) ? "" : "none";
        });
      });
    });
  });

  // hall tabs
  $$(".tabs").forEach(function (tabs) {
    var btns = $$("button", tabs);
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { var on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-selected", on ? "true" : "false"); });
        $$(".tabpane", tabs.parentNode).forEach(function (p) { p.hidden = p.id !== b.getAttribute("data-t"); });
      });
    });
  });

  // review carousel buttons
  $$(".rv-wrap").forEach(function (w) {
    var tr = $(".rv-track", w), p = $(".car-prev", w), n = $(".car-next", w);
    if (!tr) return;
    function step() { var c = $(".rv", tr); return c ? c.getBoundingClientRect().width + 16 : 300; }
    if (p) p.addEventListener("click", function () { tr.scrollBy({ left: -step(), behavior: reduce ? "auto" : "smooth" }); });
    if (n) n.addEventListener("click", function () { tr.scrollBy({ left: step(), behavior: reduce ? "auto" : "smooth" }); });
  });

  // review theme filter
  $$(".rv-filter").forEach(function (f) {
    var scope = document.getElementById(f.getAttribute("data-for"));
    $$("button", f).forEach(function (c) {
      c.addEventListener("click", function () {
        $$("button", f).forEach(function (x) { x.classList.toggle("on", x === c); x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
        var k = c.getAttribute("data-f"), shown = 0;
        $$(".rv", scope).forEach(function (r) {
          var t = (r.getAttribute("data-tags") || "").split(" ");
          var ok = k === "all" || t.indexOf(k) > -1; r.style.display = ok ? "" : "none"; if (ok) shown++;
        });
        var s = $(".rv-count", f.parentNode); if (s) s.textContent = shown + " shown";
      });
    });
  });

  // plan wizard (premium)
  var W = $("#wiz");
  if (W) {
    var S = { type: "", hall: "", date: "", name: "", phone: "" }, step = 1;
    var q = new URLSearchParams(location.search);
    if (q.get("hall") && /^(500|250|100)$/.test(q.get("hall"))) S.hall = q.get("hall");
    var halls = { "500": "Large hall, up to 500 guests", "250": "Medium hall, up to 250 guests", "100": "Small hall, up to 100 guests" };
    function say(t) { var e = $("#werr"); if (e) e.textContent = t || ""; }
    function render() {
      $$(".wstep", W).forEach(function (s) { s.style.display = (+s.getAttribute("data-s") === step) ? "" : "none"; });
      $$(".prog i", W).forEach(function (p, n) { p.classList.toggle("on", n < step); });
      $("#s-type").textContent = S.type || "Not chosen yet";
      $("#s-hall").textContent = S.hall ? halls[S.hall] : "Not chosen yet";
      $("#s-date").textContent = S.date || "Not chosen yet";
      $("#s-who").textContent = S.name ? S.name + (S.phone ? ", " + S.phone : "") : "Not given yet";
      say("");
    }
    function opts(id, key) {
      $$("#" + id + " .opt").forEach(function (o) {
        o.addEventListener("click", function () {
          $$("#" + id + " .opt").forEach(function (x) { x.classList.remove("sel"); x.setAttribute("aria-pressed", "false"); });
          o.classList.add("sel"); o.setAttribute("aria-pressed", "true"); S[key] = o.getAttribute("data-v"); render();
        });
        if (S[key] && o.getAttribute("data-v") === S[key]) { o.classList.add("sel"); o.setAttribute("aria-pressed", "true"); }
      });
    }
    opts("o-type", "type"); opts("o-hall", "hall");
    var cal = $("#cal");
    (function build() {
      var n = new Date(), y = n.getFullYear(), m = n.getMonth() + 1; if (m > 11) { m = 0; y++; }
      ["M", "T", "W", "T", "F", "S", "S"].forEach(function (h) { var e = document.createElement("div"); e.className = "h"; e.textContent = h; cal.appendChild(e); });
      var off = (new Date(y, m, 1).getDay() + 6) % 7; for (var i = 0; i < off; i++) cal.appendChild(document.createElement("div"));
      var days = new Date(y, m + 1, 0).getDate(), taken = [3, 4, 10, 11, 17, 24, 25];
      for (var d = 1; d <= days; d++) {
        var e = document.createElement("button"); e.type = "button"; e.textContent = d;
        if (taken.indexOf(d) > -1) { e.className = "b"; e.disabled = true; e.setAttribute("aria-label", d + ", taken"); }
        else {
          e.className = "f";
          (function (day, el) { el.addEventListener("click", function () {
            $$(".sel", cal).forEach(function (s) { s.classList.remove("sel"); });
            el.classList.add("sel");
            S.date = new Date(y, m, day, 12).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); render();
          }); })(d, e);
        }
        cal.appendChild(e);
      }
    })();
    $$("[data-next]", W).forEach(function (b) {
      b.addEventListener("click", function () {
        if (step === 1 && !S.type) { say("Please choose the type of event."); return; }
        if (step === 2 && (!S.hall || !S.date)) { say("Please choose a hall and a date."); return; }
        if (step === 3) {
          S.name = $("#p-name").value.trim(); S.phone = $("#p-phone").value.trim();
          if (!S.name || !S.phone) { say("Please add your name and phone number."); return; }
        }
        step++; render(); W.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      });
    });
    $$("[data-back]", W).forEach(function (b) { b.addEventListener("click", function () { step = Math.max(1, step - 1); render(); }); });
    $("#pay").addEventListener("click", function () {
      var ref = "DEMO-" + Math.random().toString(36).slice(2, 7).toUpperCase();
      $("#done").textContent = "Demo: no money moved.\nYour date would now be held.\n" + (halls[S.hall] || "") + "\n" + S.date + "\nReference: " + ref;
      var msg = "Hello, this is " + S.name + ". I have asked to hold " + S.date + " for a " + S.type.toLowerCase() + " in the " + (halls[S.hall] || "hall").toLowerCase() + ". My reference is " + ref + ".";
      $("#done-wa").href = wa(msg);
      step = 5; render();
    });
    render();
  }

  // visit form -> WhatsApp
  var vf = $("#f-visit");
  if (vf) vf.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = "Hello, my name is " + $("#v-name").value.trim() + ". I would like to visit Caritas Events Centre and see the halls and the lake. Which visit day suits you this week?";
    $("#v-msg").textContent = msg; $("#v-wa").href = wa(msg); vf.style.display = "none"; $("#v-out").style.display = "block";
  });

  // reveal on scroll. A scroll handler (not IntersectionObserver) so a fast fling or a jump to the bottom
  // never leaves a gap: anything at or above the bottom edge of the screen is shown.
  var rv = $$(".reveal"), pending = rv.length, tick = false;
  function reveal() {
    tick = false;
    var edge = window.innerHeight - 30;
    rv.forEach(function (el) {
      if (el.classList.contains("in")) return;
      if (reduce || el.getBoundingClientRect().top < edge) { el.classList.add("in"); pending--; }
    });
    if (!pending) { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); }
  }
  function onScroll() { if (!tick) { tick = true; window.requestAnimationFrame(reveal); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  reveal();
})();
