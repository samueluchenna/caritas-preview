/* Caritas demo: shared behaviour. No tracking, nothing is sent anywhere. */
(function () {
  var WA = "2348033434632";
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function wa(msg) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg); }

  // mobile menu
  var mb = $(".menu-btn"), nav = $("nav.links");
  if (mb && nav) mb.addEventListener("click", function () { nav.classList.toggle("open"); });

  // hero slideshow (photos are not tinted)
  var slides = $$(".slide"), dots = $$(".dots button"), cur = 0, timer;
  function show(i) {
    if (!slides.length) return;
    cur = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) { s.classList.toggle("on", n === cur); });
    dots.forEach(function (d, n) { d.classList.toggle("on", n === cur); });
  }
  function auto() { clearInterval(timer); timer = setInterval(function () { show(cur + 1); }, 5200); }
  dots.forEach(function (d, n) { d.addEventListener("click", function () { show(n); auto(); }); });
  if (slides.length) { show(0); auto(); }

  // modal
  function closeModals() { $$(".modal").forEach(function (m) { m.classList.remove("on"); }); document.body.style.overflow = ""; }
  $$("[data-open]").forEach(function (b) {
    b.addEventListener("click", function () {
      var m = $("#m-" + b.getAttribute("data-open"));
      if (!m) return;
      var h = b.getAttribute("data-hall");
      if (h) m.setAttribute("data-hall", h);
      var f = $("form", m), o = $(".out", m);
      if (f) f.style.display = ""; if (o) o.style.display = "none";
      m.classList.add("on"); document.body.style.overflow = "hidden";
    });
  });
  $$("[data-close]").forEach(function (b) { b.addEventListener("click", closeModals); });
  $$(".modal").forEach(function (m) { m.addEventListener("click", function (e) { if (e.target === m) closeModals(); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeModals(); lb.classList.remove("on"); } });

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

  // share this page with family on WhatsApp (hosts often need family approval)
  $$("[data-share]").forEach(function (a) {
    a.href = "https://wa.me/?text=" + encodeURIComponent("Please look at this venue for our event: " + location.href.split("#")[0]);
    a.target = "_blank"; a.rel = "noopener";
  });

  // lightbox + gallery filter
  var lb = document.createElement("div");
  lb.className = "lightbox"; lb.innerHTML = '<button aria-label="Close">&times;</button><img alt=""><div class="cap2"></div>';
  document.body.appendChild(lb);
  lb.addEventListener("click", function () { lb.classList.remove("on"); });
  $$("[data-zoom]").forEach(function (b) {
    b.addEventListener("click", function () {
      var im = $("img", b); $("img", lb).src = im.src; $("img", lb).alt = im.alt; $(".cap2", lb).textContent = im.alt;
      lb.classList.add("on");
    });
  });
  $$(".chips button").forEach(function (c) {
    c.addEventListener("click", function () {
      $$(".chips button").forEach(function (x) { x.classList.toggle("on", x === c); });
      var k = c.getAttribute("data-f");
      $$("[data-cat]").forEach(function (g) { g.style.display = (k === "all" || g.getAttribute("data-cat") === k) ? "" : "none"; });
    });
  });

  // plan wizard (premium)
  var W = $("#wiz");
  if (W) {
    var S = { type: "", guests: "", hall: "", date: "", name: "", phone: "" }, step = 1;
    var q = new URLSearchParams(location.search);
    if (q.get("hall")) S.hall = q.get("hall");
    var halls = { "500": "Large hall, up to 500 guests", "250": "Medium hall, up to 250 guests", "100": "Small hall, up to 100 guests" };
    function render() {
      $$(".wstep", W).forEach(function (s) { s.style.display = (+s.getAttribute("data-s") === step) ? "" : "none"; });
      $$(".prog i", W).forEach(function (p, n) { p.classList.toggle("on", n < step); });
      $("#s-type").textContent = S.type || "Not chosen yet";
      $("#s-hall").textContent = S.hall ? halls[S.hall] : "Not chosen yet";
      $("#s-date").textContent = S.date || "Not chosen yet";
      $("#s-who").textContent = S.name ? S.name + (S.phone ? ", " + S.phone : "") : "Not given yet";
    }
    function opts(id, key, after) {
      $$("#" + id + " .opt").forEach(function (o) {
        o.addEventListener("click", function () {
          $$("#" + id + " .opt").forEach(function (x) { x.classList.remove("sel"); });
          o.classList.add("sel"); S[key] = o.getAttribute("data-v"); if (after) after(); render();
        });
        if (S[key] && o.getAttribute("data-v") === S[key]) o.classList.add("sel");
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
        var e = document.createElement("div"); e.textContent = d;
        if (taken.indexOf(d) > -1) e.className = "b"; else {
          e.className = "f";
          (function (day, el) { el.addEventListener("click", function () {
            $$(".sel", cal).forEach(function (s) { s.classList.remove("sel"); }); el.classList.add("sel");
            S.date = new Date(y, m, day, 12).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); render();
          }); })(d, e);
        }
        cal.appendChild(e);
      }
    })();
    $$("[data-next]", W).forEach(function (b) {
      b.addEventListener("click", function () {
        if (step === 1 && (!S.type)) { alert("Please choose the type of event."); return; }
        if (step === 2 && (!S.hall || !S.date)) { alert("Please choose a hall and a date."); return; }
        if (step === 3) {
          S.name = $("#p-name").value.trim(); S.phone = $("#p-phone").value.trim();
          if (!S.name || !S.phone) { alert("Please add your name and phone number."); return; }
        }
        step++; render(); W.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    $$("[data-back]", W).forEach(function (b) { b.addEventListener("click", function () { step--; render(); }); });
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

  // reveal on scroll
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .1 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else { $$(".reveal").forEach(function (el) { el.classList.add("in"); }); }
})();
