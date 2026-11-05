/* ===== Kejutan ulang tahun "Jalan-jalan ke Rumah" (gaya anime) =====
   Yang berulang tahun (tokoh cowok atau cewek) berjalan melewati halaman rumput & bunga ke rumah.
   Kotak surat di depan rumah berisi surat yang diketik lewat admin/. Kotak surat, pintu, dan pohon diklik sendiri (tanpa tombol). Pintu:
   layar gelap beberapa detik, lalu lampu menyala dan pasangannya (lawan jenis) memberi kejutan.
   Di depan kue: menulis wish, hitung mundur 3-2-1, lalu tiup lilin. Lantai 2 berisi kado & foto.
   Tidak ada jalan otomatis: tokoh hanya bergerak dengan kursor/sentuhan, joystick, atau tombol panah. */
(function () {
  var D = window.ULTAH || {};
  var T = 16, OUT = "#3d2633";
  var WARNA = ["#ff6b9a", "#ffd166", "#6cc3f0", "#b48cf2", "#7ed6a0", "#ff9f6b", "#ffffff"];
  var SENTUH = !!(window.matchMedia && matchMedia("(pointer:coarse)").matches);

  /* ---------- Alat bantu gambar ---------- */
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function paragraf(s) { return String(s || "").split(/\n\s*\n/).map(function (p) { return "<p>" + esc(p.trim()).replace(/\n/g, "<br>") + "</p>"; }).join(""); }
  function acak(x, y, k) { var n = Math.sin(x * 127.1 + y * 311.7 + (k || 0) * 74.7) * 43758.5453; return n - Math.floor(n); }
  function kotak(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }
  function garis(g, w, c) { g.strokeStyle = c || OUT; g.lineWidth = w || .5; g.stroke(); }
  function elips(g, cx, cy, rx, ry, c, tepi) { g.beginPath(); g.ellipse(cx, cy, Math.max(.01, rx), Math.max(.01, ry), 0, 0, 6.2832); if (c) { g.fillStyle = c; g.fill(); } if (tepi) garis(g, tepi === true ? .5 : tepi); }
  function lingkaran(g, cx, cy, r, c, tepi) { elips(g, cx, cy, r, r, c, tepi); }
  function jalurBulat(g, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function bulatIsi(g, x, y, w, h, r, c, tepi) { jalurBulat(g, x, y, w, h, r); if (c) { g.fillStyle = c; g.fill(); } if (tepi) garis(g, tepi === true ? .5 : tepi); }
  function poligon(g, titik, c, tepi) { g.beginPath(); titik.forEach(function (p, i) { if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.closePath(); if (c) { g.fillStyle = c; g.fill(); } if (tepi) garis(g, tepi === true ? .5 : tepi); }
  function gradV(g, y0, y1, a, b) { var gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, a); gr.addColorStop(1, b); return gr; }
  function cahaya(g, cx, cy, r, rgb, kuat) { if (r <= 0) return; var gr = g.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, "rgba(" + rgb + "," + kuat + ")"); gr.addColorStop(1, "rgba(" + rgb + ",0)"); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, 6.2832); g.fill(); }
  function bayangan(g, cx, cy, rx, ry, a) { elips(g, cx, cy, rx, ry, "rgba(40,25,30," + (a || .2) + ")"); }
  function bunga(g, x, y, r, warna, tengah) { for (var i = 0; i < 5; i++) { var a = i * 1.2566 + x; lingkaran(g, x + Math.cos(a) * r, y + Math.sin(a) * r, r * .85, warna); } lingkaran(g, x, y, r * .55, tengah || "#ffd84d"); }
  function hati(g, x, y, s, c, tepi) { g.beginPath(); g.moveTo(x, y + s); g.bezierCurveTo(x - s * 1.6, y, x - s * .8, y - s * 1.1, x, y - s * .3); g.bezierCurveTo(x + s * .8, y - s * 1.1, x + s * 1.6, y, x, y + s); g.fillStyle = c; g.fill(); if (tepi) garis(g, tepi === true ? .4 : tepi); }
  function bintang(g, x, y, r, c, sudut) { g.beginPath(); for (var i = 0; i < 10; i++) { var a = (sudut || 0) - Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fillStyle = c; g.fill(); }
  function kilau(g, x, y, r, a) { g.fillStyle = "rgba(255,255,255," + a + ")"; g.beginPath(); g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r, y); g.quadraticCurveTo(x, y, x, y + r); g.quadraticCurveTo(x, y, x - r, y); g.quadraticCurveTo(x, y, x, y - r); g.fill(); }

  /* =====================================================================
     TOKOH (chibi semi-realistis). Kaki di (0,0), tinggi sekitar 31.
     Cewek: rambut cokelat dicepol, sweater kuning mustard, rok gelap, sandal.
     Cowok: rambut hitam berantakan, hoodie abu-abu, celana gelap, sneakers.
     o: {jenis, arah: bawah|atas|kiri|kanan, jalan, anim, pose, mata, mulut, tulis, skala, tanpaBayangan}
     ===================================================================== */
  var GAYA = {
    cewek: { kulit: "#f7dcc6", kulitG: "#e9b89c", rambut: "#6e4632", rambutT: "#a0704f", rambutG: "#45291d", baju: "#d9a33b", bajuT: "#efc66a", bajuG: "#ab7a22", bawah: "#3d3c44", bawahG: "#28272e", kaki: "#f2d2bb", sepatu: "#7b5336", sol: "#5a3a26", mata: "#6a3d22" },
    cowok: { kulit: "#f5d6bd", kulitG: "#e1b096", rambut: "#272224", rambutT: "#575159", rambutG: "#121011", baju: "#9ea4aa", bajuT: "#bfc4c9", bajuG: "#787e85", bawah: "#363b47", bawahG: "#232731", sepatu: "#ecebe6", sol: "#bdb9b0", mata: "#5a3420" }
  };
  var TEPI = "rgba(58,34,26,.82)";
  function tepi(g, w) { g.strokeStyle = TEPI; g.lineWidth = w || .36; g.lineJoin = "round"; g.stroke(); }
  /* kurva halus lewat titik; titik dengan [x,y,1] dibuat lancip */
  function halus(g, pts) {
    var n = pts.length; function mid(a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
    var m0 = mid(pts[0], pts[1]); g.beginPath(); g.moveTo(m0[0], m0[1]);
    for (var i = 1; i <= n; i++) { var p = pts[i % n], q = pts[(i + 1) % n], m = mid(p, q); if (p[2]) { g.lineTo(p[0], p[1]); g.lineTo(m[0], m[1]); } else g.quadraticCurveTo(p[0], p[1], m[0], m[1]); }
    g.closePath();
  }
  function isiHalus(g, pts, warna, garisW) { halus(g, pts); g.fillStyle = warna; g.fill(); if (garisW !== 0) tepi(g, garisW); }
  function gradX(g, x0, x1, a, b, c) { var gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, a); gr.addColorStop(.5, b); gr.addColorStop(1, c); return gr; }

  function gambarOrang(g, o, x, y, t) {
    var P = GAYA[o.jenis] || GAYA.cewek, cewek = o.jenis !== "cowok", sk = o.skala || 1;
    var ay = o.jalan ? Math.sin(o.anim * 1.25) : 0, naik = o.jalan ? Math.abs(Math.sin(o.anim * 1.25)) * .7 : Math.sin(t * 2.2 + x) * .15;
    var samping = o.arah === "kiri" || o.arah === "kanan", belakang = o.arah === "atas", depan = !samping && !belakang;
    var pose = o.pose || "";
    if (!o.tanpaBayangan) { var bg = g.createRadialGradient(x, y, 0, x, y, 6.5 * sk); bg.addColorStop(0, "rgba(30,24,18,.32)"); bg.addColorStop(1, "rgba(30,24,18,0)"); g.fillStyle = bg; g.beginPath(); g.ellipse(x, y, 6.5 * sk, 2.3 * sk, 0, 0, 6.2832); g.fill(); }
    g.save(); g.translate(x, y - naik * sk); g.scale(sk, sk);
    if (o.arah === "kiri") g.scale(-1, 1);
    var hy = -20.6, hr = 7.7;

    /* --- kaki --- */
    function kakiSatu(kx, angkat, lebar) {
      var y0 = cewek ? -5.6 : -7.2, y1 = -1.3 - angkat;
      if (cewek) {
        bulatIsi(g, kx - 1.05, y0, 2.1, y1 - y0 + .4, 1, gradX(g, kx - 1, kx + 1, P.kaki, P.kaki, P.kulitG), true);
        elips(g, kx + (samping ? .5 : 0), -.7 - angkat, lebar * .55, .85, P.sol, .3);
        g.strokeStyle = P.sepatu; g.lineWidth = .55; g.beginPath(); g.moveTo(kx - 1, -1.3 - angkat); g.lineTo(kx + 1, -1.3 - angkat); g.stroke();
      } else {
        bulatIsi(g, kx - 1.45, y0, 2.9, y1 - y0 + .6, .9, gradX(g, kx - 1.5, kx + 1.5, P.bawah, P.bawah, P.bawahG), true);
        bulatIsi(g, kx - lebar / 2 + (samping ? .5 : 0), -2.2 - angkat, lebar, 2.2, 1, P.sepatu, true);
        kotak(g, kx - lebar / 2 + .3 + (samping ? .5 : 0), -.75 - angkat, lebar - .6, .55, P.sol);
      }
    }
    if (samping) { kakiSatu(-1 - ay * 1.9, Math.max(0, -ay) * .6, 3.8); kakiSatu(1 + ay * 1.9, Math.max(0, ay) * .6, 3.8); }
    else { kakiSatu(-1.8, Math.max(0, ay), 3.2); kakiSatu(1.8, Math.max(0, -ay), 3.2); }

    /* --- badan --- */
    var bw = samping ? 7.2 : 9.2, bahu = -14.4;
    if (cewek) {
      // rok
      var rt = -9.2, rb = -5.2, rw = samping ? 8 : 10.6;
      poligon(g, [[-bw / 2 + .2, rt], [bw / 2 - .2, rt], [rw / 2, rb], [-rw / 2, rb]], gradX(g, -rw / 2, rw / 2, P.bawah, P.bawah, P.bawahG), true);
      g.strokeStyle = "rgba(0,0,0,.28)"; g.lineWidth = .25; for (var pl = -2; pl <= 2; pl++) { g.beginPath(); g.moveTo(pl * 1.5, rt + .6); g.lineTo(pl * 2.1, rb - .2); g.stroke(); }
      // sweater
      isiHalus(g, [[-bw / 2 + .6, bahu], [0, bahu - .5], [bw / 2 - .6, bahu], [bw / 2 + .3, bahu + 2], [bw / 2 + .5, -8.4, 1], [-bw / 2 - .5, -8.4, 1], [-bw / 2 - .3, bahu + 2]], gradX(g, -bw / 2, bw / 2, P.bajuT, P.baju, P.bajuG));
      g.save(); halus(g, [[-bw / 2 + .6, bahu], [0, bahu - .5], [bw / 2 - .6, bahu], [bw / 2 + .3, bahu + 2], [bw / 2 + .5, -8.4, 1], [-bw / 2 - .5, -8.4, 1], [-bw / 2 - .3, bahu + 2]]); g.clip();
      g.strokeStyle = "rgba(120,80,20,.22)"; g.lineWidth = .22; for (var rb2 = -bw / 2; rb2 < bw / 2; rb2 += .9) { g.beginPath(); g.moveTo(rb2, bahu); g.lineTo(rb2 * 1.06, -8.4); g.stroke(); }
      kotak(g, -bw, -9.6, bw * 2, 1.2, "rgba(140,95,25,.28)");
      g.restore();
      if (!belakang) { g.beginPath(); g.ellipse(samping ? 1.6 : 0, bahu + .1, samping ? 1.6 : 2.4, .9, 0, 0, Math.PI); g.fillStyle = P.kulitG; g.fill(); g.strokeStyle = P.bajuG; g.lineWidth = .5; g.stroke(); }
    } else {
      isiHalus(g, [[-bw / 2 + .6, bahu], [0, bahu - .5], [bw / 2 - .6, bahu], [bw / 2 + .4, bahu + 2], [bw / 2 + .6, -6.3, 1], [-bw / 2 - .6, -6.3, 1], [-bw / 2 - .4, bahu + 2]], gradX(g, -bw / 2, bw / 2, P.bajuT, P.baju, P.bajuG));
      kotak(g, -bw / 2 - .4, -7.4, bw + .8, 1.1, "rgba(70,74,80,.35)");
      if (depan) {
        bulatIsi(g, -3.2, -11, 6.4, 3.3, 1.2, "rgba(120,126,133,.55)"); g.strokeStyle = "rgba(70,74,80,.6)"; g.lineWidth = .25; jalurBulat(g, -3.2, -11, 6.4, 3.3, 1.2); g.stroke();
        g.strokeStyle = "#f2f2ef"; g.lineWidth = .32; g.lineCap = "round";
        [-1, 1].forEach(function (s) { g.beginPath(); g.moveTo(s * 1, bahu + .7); g.quadraticCurveTo(s * 1.2, bahu + 2.4, s * 1.05 + Math.sin(t * 2 + s) * .1, bahu + 3.6); g.stroke(); kotak(g, s * 1.05 - .25, bahu + 3.5, .5, .7, "#c9c9c4"); });
      } else if (belakang) {
        isiHalus(g, [[-3.6, bahu - .4], [0, bahu - 1], [3.6, bahu - .4], [2.8, bahu + 3.4], [0, bahu + 4.4], [-2.8, bahu + 3.4]], P.bajuG, .3);
      }
      // tudung di leher
      if (!belakang) { g.beginPath(); g.ellipse(samping ? -1 : 0, bahu + .2, samping ? 3.2 : 4.4, 1.5, 0, Math.PI, 0); g.fillStyle = P.bajuG; g.fill(); tepi(g, .3); }
    }

    /* --- lengan --- */
    function lengan(lx, ly, sudut, panjang) {
      g.save(); g.translate(lx, ly); g.rotate(sudut || 0); panjang = panjang || 5.6;
      bulatIsi(g, -1.3, -.2, 2.6, panjang, 1.25, gradX(g, -1.3, 1.3, P.bajuT, P.baju, P.bajuG), true);
      kotak(g, -1.2, panjang - 1.4, 2.4, .7, "rgba(0,0,0,.12)");
      lingkaran(g, 0, panjang + .2, 1.15, P.kulit, .3); g.restore();
    }
    var sw = o.jalan ? ay * .45 : 0, lb = bahu + .9;
    if (samping) lengan(.2, lb, -sw, 5.4);
    else if (pose === "hore") { lengan(-bw / 2 + .1, lb, 2.55 + Math.sin(t * 10) * .14, 5.4); lengan(bw / 2 - .1, lb, -2.55 - Math.sin(t * 10) * .14, 5.4); }
    else if (pose === "doa") { lengan(-bw / 2 + .4, lb, -.78, 4.5); lengan(bw / 2 - .4, lb, .78, 4.5); }
    else if (pose === "tulis") { lengan(-bw / 2 + .4, lb, -.92, 4.7); lengan(bw / 2 - .4, lb, .56 + Math.sin(t * 16) * .12, 4.7); }
    else { lengan(-bw / 2 - .2, lb, .1 + sw, 5.6); lengan(bw / 2 + .2, lb, -.1 - sw, 5.6); }
    if (pose === "tulis" && depan) {
      g.save(); g.translate(0, -9.8); g.rotate(-.08); bulatIsi(g, -3.4, -2.2, 6.8, 4.4, .5, "#fffaf0", true);
      for (var li = 0; li < 3; li++) kotak(g, -2.6, -1.2 + li * 1.2, Math.min(5.2, Math.max(0, (o.tulis || 0) * 16 - li * 5.2)), .32, "#8a5a6a");
      g.restore();
      g.save(); g.translate(1.6 + Math.sin(t * 16) * 1.2, -11.2); g.rotate(.5); kotak(g, -.35, -3, .7, 3.6, "#e8c25a"); kotak(g, -.35, .6, .7, .6, "#3a2a20"); g.restore();
    }

    /* --- cepol di belakang kepala (cewek) --- */
    function cepol(cx, cy) {
      lingkaran(g, cx, cy, 3.3, P.rambut, true);
      g.strokeStyle = P.rambutG; g.lineWidth = .3; g.beginPath(); g.arc(cx, cy, 2.1, .4, 4.2); g.stroke(); g.beginPath(); g.arc(cx + .3, cy + .2, 1, 2, 5.6); g.stroke();
      g.strokeStyle = P.rambutT; g.lineWidth = .45; g.beginPath(); g.arc(cx, cy, 2.6, 3.6, 4.6); g.stroke();
      elips(g, cx, cy + 3, 2.2, .75, P.bajuG);
    }
    if (cewek && !belakang) cepol(samping ? -2.2 : .4, hy - hr - 1.4);

    /* --- kepala --- */
    if (!samping || true) { [-1, 1].forEach(function (s) { if (samping && s > 0) return; elips(g, samping ? -1.2 : s * 7.3, hy + 1.2, 1.3, 1.7, P.kulit, .3); }); }
    var gk = g.createRadialGradient(-1.5, hy - 1, 1, 0, hy, hr + 1); gk.addColorStop(0, P.kulit); gk.addColorStop(.75, P.kulit); gk.addColorStop(1, P.kulitG);
    halus(g, [[-hr, hy - 1], [-hr + .4, hy - hr + 1], [0, hy - hr], [hr - .4, hy - hr + 1], [hr, hy - 1], [hr - .9, hy + 4.4], [samping ? 3 : 0, hy + 7.1], [-hr + .9, hy + 4.4]]);
    g.fillStyle = gk; g.fill(); tepi(g, .38);
    if (o.mulut === "tiup" && depan) { elips(g, -4.6, hy + 3.4, 2.1, 1.8, P.kulit); elips(g, 4.6, hy + 3.4, 2.1, 1.8, P.kulit); }

    /* --- wajah --- */
    if (!belakang) {
      var mataX = samping ? [3.5] : [-3, 3], my = hy + 1.7;
      mataX.forEach(function (ex) {
        if (o.mata === "pejam" || o.mata === "senang") {
          g.beginPath(); if (o.mata === "senang") g.arc(ex, my + .9, 1.5, Math.PI * 1.15, Math.PI * 1.85); else g.arc(ex, my - .3, 1.5, Math.PI * .15, Math.PI * .85);
          g.strokeStyle = "#2b1a12"; g.lineWidth = .7; g.lineCap = "round"; g.stroke();
          if (cewek && o.mata === "pejam") { g.beginPath(); g.moveTo(ex + (ex < 0 ? -1.5 : 1.5), my + .2); g.lineTo(ex + (ex < 0 ? -2.1 : 2.1), my - .2); g.lineWidth = .45; g.stroke(); }
        } else {
          var kedip = (Math.sin(t * 1.3 + (cewek ? 1 : 0)) > .985) ? .14 : 1, rx = samping ? 1.25 : 1.78, ry = 2.3 * kedip;
          elips(g, ex, my, rx, ry, "#fffaf6");
          var gr = g.createLinearGradient(0, my - 2.2, 0, my + 2.2); gr.addColorStop(0, "#26140c"); gr.addColorStop(.5, P.mata); gr.addColorStop(1, "#c08a5a");
          elips(g, ex + (samping ? .25 : 0), my + .18, rx * .86, ry * .9, gr);
          elips(g, ex + (samping ? .25 : 0), my + .1, rx * .4, ry * .42, "#1c0e08");
          if (kedip > .5) { lingkaran(g, ex - rx * .32, my - .8, .62, "#ffffff"); lingkaran(g, ex + rx * .35, my + .95, .3, "rgba(255,255,255,.85)"); elips(g, ex, my + 1.4, rx * .5, .35, "rgba(255,220,180,.35)"); }
          g.beginPath(); g.ellipse(ex, my + .1, rx + .2, ry + .2, 0, Math.PI * 1.06, Math.PI * 1.94); g.strokeStyle = "#2b1a12"; g.lineWidth = .78; g.lineCap = "round"; g.stroke();
          if (cewek) { var luar = ex + (ex < 0 ? -rx : rx); g.beginPath(); g.moveTo(luar, my - .9); g.lineTo(luar + (ex < 0 ? -.75 : .75), my - 1.6); g.lineWidth = .45; g.stroke(); }
          g.beginPath(); g.ellipse(ex, my + .2, rx * .8, ry * .95, 0, Math.PI * .3, Math.PI * .7); g.strokeStyle = "rgba(120,70,50,.45)"; g.lineWidth = .25; g.stroke();
        }
      });
      // pipi
      (samping ? [2.6] : [-4.6, 4.6]).forEach(function (bx) { var pg = g.createRadialGradient(bx, hy + 4.1, 0, bx, hy + 4.1, 1.9); pg.addColorStop(0, "rgba(240,128,118,.42)"); pg.addColorStop(1, "rgba(240,128,118,0)"); g.fillStyle = pg; g.beginPath(); g.ellipse(bx, hy + 4.1, 1.9, 1.1, 0, 0, 6.2832); g.fill(); });
      // hidung & mulut
      if (samping) { g.beginPath(); g.moveTo(hr - .2, hy + 2.4); g.quadraticCurveTo(hr + .7, hy + 3.4, hr - .3, hy + 3.8); g.strokeStyle = P.kulitG; g.lineWidth = .35; g.stroke(); }
      else { g.beginPath(); g.moveTo(.1, hy + 3.6); g.lineTo(.35, hy + 4.1); g.strokeStyle = P.kulitG; g.lineWidth = .35; g.stroke(); }
      var mx = samping ? 4.6 : 0, myy = hy + 5.4;
      if (o.mulut === "tiup") elips(g, mx, myy, .62, .72, "#a34a48", .3);
      else if (o.mulut === "buka") { g.beginPath(); g.moveTo(mx - 1.15, myy - .4); g.quadraticCurveTo(mx, myy + 1.9, mx + 1.15, myy - .4); g.closePath(); g.fillStyle = "#9c3f3e"; g.fill(); tepi(g, .3); elips(g, mx, myy + .7, .5, .3, "#e98a86"); }
      else { g.beginPath(); g.moveTo(mx - .85, myy - .3); g.quadraticCurveTo(mx, myy + .5, mx + .85, myy - .3); g.strokeStyle = "#8f4a42"; g.lineWidth = .36; g.lineCap = "round"; g.stroke(); }
    }

    /* --- rambut --- */
    var R1 = P.rambut;
    function kilauRambut(a0, a1, r) { g.beginPath(); g.arc(0, hy - .6, r || hr - 1.4, a0, a1); g.strokeStyle = P.rambutT; g.globalAlpha = .7; g.lineWidth = .9; g.lineCap = "round"; g.stroke(); g.globalAlpha = 1; }
    if (cewek) {
      if (belakang) {
        isiHalus(g, [[-hr - .5, hy], [-hr, hy - hr + .8], [0, hy - hr - .9], [hr, hy - hr + .8], [hr + .5, hy], [hr - .6, hy + 4.6], [0, hy + 6.2], [-hr + .6, hy + 4.6]], R1);
        g.strokeStyle = P.rambutG; g.lineWidth = .28; [-5, -2.5, 0, 2.5, 5].forEach(function (lx) { g.beginPath(); g.moveTo(lx, hy + 5); g.quadraticCurveTo(lx * .6, hy - 2, 0, hy - hr - .2); g.stroke(); });
        cepol(0, hy - hr - .9); kilauRambut(Math.PI * 1.2, Math.PI * 1.45);
      } else if (samping) {
        isiHalus(g, [[-hr - .5, hy + 4], [-hr - .4, hy - 2], [-hr + .6, hy - hr + .6], [0, hy - hr - .8], [hr - 1, hy - hr + 1.4], [hr + .3, hy - 2.2], [hr - 1.2, hy - 1.6], [hr - 2.8, hy - .6], [3.6, hy - 2, 1], [1.4, hy - .2], [-.4, hy + 1.5], [-1, hy + 5], [-3.2, hy + 6.2]], R1);
        isiHalus(g, [[hr - 2.4, hy - 1], [hr - .6, hy + 2.8], [hr - 1.2, hy + 6.6, 1], [hr - 2.6, hy + 2.6]], R1, .3);
        kilauRambut(Math.PI * 1.25, Math.PI * 1.55);
      } else {
        isiHalus(g, [[-hr - .6, hy + 3.4], [-hr - .3, hy - 3], [-hr + 1.2, hy - hr + .4], [0, hy - hr - .9], [hr - 1.2, hy - hr + .4], [hr + .3, hy - 3], [hr + .6, hy + 3.4], [hr - .6, hy + 3.6, 1], [hr - 1.2, hy - .6], [hr - 2.6, hy - 1.6], [2.4, hy - 2.9], [1, hy - 1.2, 1], [-.6, hy - 3.2], [-2.6, hy - 1.4, 1], [-4.2, hy - 2.6], [-hr + 1.6, hy - .8], [-hr + .6, hy + 3.6, 1]], R1);
        [-1, 1].forEach(function (s) { isiHalus(g, [[s * (hr - 1.2), hy - 1], [s * (hr - .1), hy + 2.6], [s * (hr - .6), hy + 6.8, 1], [s * (hr - 1.5), hy + 3]], R1, .3); });
        kilauRambut(Math.PI * 1.18, Math.PI * 1.4); kilauRambut(Math.PI * 1.55, Math.PI * 1.66);
      }
    } else {
      if (belakang) {
        isiHalus(g, [[-hr - .8, hy + 1], [-hr - 1.4, hy - 2.6, 1], [-hr + .2, hy - hr + .6], [-2.6, hy - hr - 1.6, 1], [0, hy - hr - .6], [3, hy - hr - 1.8, 1], [hr - .2, hy - hr + .8], [hr + 1.4, hy - 2.6, 1], [hr + .8, hy + 1], [hr - .4, hy + 4.4], [2, hy + 4.2, 1], [0, hy + 5.6], [-2, hy + 4.2, 1], [-hr + .4, hy + 4.4]], R1);
        kilauRambut(Math.PI * 1.25, Math.PI * 1.55);
      } else if (samping) {
        isiHalus(g, [[-hr - .7, hy + 4.2], [-hr - 1.2, hy - 2, 1], [-hr + .3, hy - hr + .4], [-2, hy - hr - 1.8, 1], [1, hy - hr - .8], [4.4, hy - hr - .4, 1], [hr - .3, hy - hr + 2], [hr + 1.4, hy - 2.4, 1], [hr - 1.2, hy - 1.4], [hr - 2, hy + .2, 1], [hr - 3.2, hy - 1.2], [3.4, hy - .2, 1], [1.6, hy - 1.4], [-.6, hy + 2.2], [-1.4, hy + 4.4, 1], [-3.4, hy + 3.6]], R1);
        kilauRambut(Math.PI * 1.3, Math.PI * 1.6);
      } else {
        isiHalus(g, [[-hr - .9, hy + 2.8], [-hr - 1.8, hy - 1.8, 1], [-hr - .8, hy - 5.4], [-hr + .6, hy - hr - 1.6, 1], [-3.2, hy - hr - 2.2], [-.6, hy - hr - 3.4, 1], [2.4, hy - hr - 2.4], [hr - 1.4, hy - hr - 1.2, 1], [hr + .6, hy - 4.8], [hr + 1.8, hy - 1.4, 1], [hr + .7, hy + 2.8], [hr - .6, hy + 1.2, 1], [hr - 1.6, hy - 1.4], [4, hy + .6, 1], [3, hy - 1.8], [1.6, hy + .4, 1], [.4, hy - 2], [-1, hy + .5, 1], [-2.2, hy - 1.8], [-3.6, hy + .7, 1], [-4.6, hy - 1.6], [-hr + 1.4, hy + 1.2, 1], [-hr + .6, hy - .2]], R1);
        kilauRambut(Math.PI * 1.2, Math.PI * 1.38); kilauRambut(Math.PI * 1.55, Math.PI * 1.7);
      }
    }
    // alis (tipis, terlihat dari balik poni)
    if (!belakang && o.mata !== "pejam") {
      g.strokeStyle = cewek ? "rgba(80,48,34,.75)" : "rgba(30,24,26,.75)"; g.lineWidth = .4; g.lineCap = "round";
      (samping ? [3.4] : [-3, 3]).forEach(function (ex) { g.beginPath(); g.moveTo(ex - 1.1, hy - 1.5); g.quadraticCurveTo(ex, hy - 2.1, ex + 1.1, hy - 1.6); g.stroke(); });
    }
    g.restore();
  }
  function potret(cv, jenis, opsi) {
    var g = cv.getContext("2d"), s = cv.width / 18; opsi = opsi || {};
    g.clearRect(0, 0, cv.width, cv.height); g.save(); g.scale(s, s);
    if (opsi.penuh) { g.translate(9, cv.height / s - 2.2); g.scale(.52, .52); } else g.translate(9, 29.5);
    gambarOrang(g, { jenis: jenis, arah: "bawah", jalan: false, anim: 0, mata: opsi.mata, mulut: opsi.mulut, pose: opsi.pose, tanpaBayangan: !opsi.penuh }, 0, 0, 0);
    g.restore();
  }

  /* ---------- Benda ---------- */
  function balon(g, x, y, r, warna, ax, ay, bentuk) {
    if (ax != null) { g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = .35; g.beginPath(); g.moveTo(x, y + r * 1.15); g.quadraticCurveTo(x + (ax - x) * .2 + 2, (y + ay) / 2, ax, ay); g.stroke(); }
    if (bentuk === "hati") { hati(g, x, y + r * .1, r * 1.05, warna, "rgba(0,0,0,.15)"); kilau(g, x - r * .45, y - r * .25, r * .3, .7); return; }
    var gr = g.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r * 1.1); gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(.35, warna); gr.addColorStop(1, warna);
    g.beginPath(); g.ellipse(x, y, r * .88, r * 1.05, 0, 0, 6.2832); g.fillStyle = gr; g.fill(); g.strokeStyle = "rgba(0,0,0,.14)"; g.lineWidth = .35; g.stroke();
    poligon(g, [[x - .9, y + r * 1.2], [x + .9, y + r * 1.2], [x, y + r * 1.0]], warna);
    kilau(g, x - r * .38, y - r * .45, r * .28, .8);
  }
  function kumpulanBalon(g, x, y, t, jml, fase, tinggi, hatiSaja) {
    tinggi = tinggi || 30;
    bayangan(g, x, y, 4, 1.4); hati(g, x, y - 1.6, 1.8, "#e85d8f");
    for (var i = 0; i < jml; i++) {
      var a = (i / jml - .5) * 1.7, r = 5 + acak(i, fase) * 1.6;
      var bx = x + Math.sin(a) * 10 + Math.sin(t * 1.1 + i + fase) * 1.4, by = y - tinggi + Math.cos(a) * 4 - acak(fase, i) * 9 + Math.sin(t * 1.6 + i * 2 + fase) * 1.3;
      balon(g, bx, by, r, hatiSaja ? ["#ff5f8f", "#ff8fb1", "#ffffff", "#e83f6f"][i % 4] : WARNA[(i + fase) % WARNA.length], x, y - 2, hatiSaja || (i + fase) % 4 === 0 ? "hati" : null);
    }
  }
  function hadiahKotak(g, x, y, w, h, warna, pitaW) {
    bayangan(g, x + w / 2, y + h, w * .6, 1.6);
    kotak(g, x, y, w, h, warna); kotak(g, x + w * .62, y, w * .38, h, "rgba(0,0,0,.1)"); kotak(g, x - .6, y - 2.6, w + 1.2, 3, warna); kotak(g, x - .6, y - 2.6, w + 1.2, 1, "rgba(255,255,255,.3)");
    kotak(g, x + w / 2 - 1, y - 2.6, 2, h + 2.6, pitaW); kotak(g, x, y + h * .4, w, 1.5, pitaW);
    elips(g, x + w / 2 - 2.2, y - 3.9, 2.4, 1.5, pitaW, .35); elips(g, x + w / 2 + 2.2, y - 3.9, 2.4, 1.5, pitaW, .35);
    g.strokeStyle = OUT; g.lineWidth = .4; g.strokeRect(x - .6, y - 2.6, w + 1.2, h + 2.6);
  }
  function hurufFoil(g, teks, cx, y, ukuran, t, warna) {
    g.font = "700 " + ukuran + "px Fredoka, Nunito, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    var lebar = teks.split("").map(function (h) { return h === " " ? ukuran * .35 : g.measureText(h).width + ukuran * .1; }), total = lebar.reduce(function (a, b) { return a + b; }, 0), x = cx - total / 2;
    teks.split("").forEach(function (h, i) {
      if (h !== " ") {
        var hx = x + lebar[i] / 2, hy = y + Math.sin(t * 1.3 + i) * .5;
        g.save(); g.translate(hx, hy); g.rotate(Math.sin(t * .9 + i * 1.7) * .06);
        var gr = g.createLinearGradient(0, -ukuran / 2, 0, ukuran / 2);
        (warna || ["#fff6cf", "#e9c25a", "#fff3c0", "#c89a35"]).forEach(function (c, k, arr) { gr.addColorStop(k / (arr.length - 1), c); });
        g.lineJoin = "round"; g.lineWidth = ukuran * .16; g.strokeStyle = "rgba(90,60,30,.55)"; g.strokeText(h, 0, 0);
        g.fillStyle = gr; g.fillText(h, 0, 0); kilau(g, -ukuran * .18, -ukuran * .22, ukuran * .12, .8);
        g.restore();
      }
      x += lebar[i];
    });
  }
  function lampuHias(g, t, x0, x1, y) {
    g.strokeStyle = "rgba(60,40,30,.55)"; g.lineWidth = .4; g.beginPath(); g.moveTo(x0, y);
    for (var x = x0; x < x1; x += 20) g.quadraticCurveTo(x + 10, y + 5, Math.min(x1, x + 20), y); g.stroke();
    for (var i = 0, xx = x0 + 5; xx < x1; xx += 10, i++) { var on = (Math.sin(t * 3 + i * 1.3) + 1) / 2, yy = y + (i % 2 ? 3.4 : 2.4); cahaya(g, xx, yy + 1, 4.5, "255,226,140", .25 + on * .4); lingkaran(g, xx, yy + 1, .95, on > .5 ? "#fff3b0" : "#ffd36e"); }
  }
  function benderaSegitiga(g, t, x0, x1, y) {
    g.strokeStyle = "rgba(90,60,60,.6)"; g.lineWidth = .4; g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo((x0 + x1) / 2, y + 10, x1, y); g.stroke();
    var n = Math.round((x1 - x0) / 9);
    for (var i = 1; i < n; i++) { var u = i / n, x = x0 + u * (x1 - x0), yy = y + 4 * 2 * u * (1 - u) * 5 - .4, sw = Math.sin(t * 2 + i) * .5; poligon(g, [[x - 3, yy], [x + 3, yy], [x + sw, yy + 6]], WARNA[i % 6]); }
  }

  /* ---------- Kue ulang tahun dengan lilin angka ---------- */
  var KUE = { padam: false, angin: 0 };
  function kue(g, cx, y, t, opsi) {
    opsi = opsi || KUE;
    elips(g, cx, y, 25, 6.4, "#ffffff", "rgba(0,0,0,.18)"); elips(g, cx, y - .8, 22, 5, "#f3eef2");
    kotak(g, cx - 20, y - 20, 40, 18, "#ff9fc0"); elips(g, cx, y - 2, 20, 4.6, "#ff9fc0");
    g.fillStyle = "rgba(160,40,90,.12)"; g.fillRect(cx + 9, y - 20, 11, 18); elips(g, cx + 14, y - 2, 6, 2.6, "rgba(160,40,90,.12)");
    elips(g, cx, y - 20, 20, 4.6, "#ffd3e2");
    g.fillStyle = "#ffffff"; for (var i = 0; i < 10; i++) { var dx = cx - 18 + i * 4; g.beginPath(); g.ellipse(dx, y - 18 + (i % 2) * 1.2, 1.5, 3 + (i % 3), 0, 0, 6.28); g.fill(); }
    for (var b = 0; b < 7; b++) hati(g, cx - 15 + b * 5, y - 8 + (b % 2) * 2, 1.1, ["#ff5f8f", "#ffffff"][b % 2]);
    kotak(g, cx - 13, y - 34, 26, 14, "#fff6ea"); elips(g, cx, y - 20.4, 13, 3.1, "#fff6ea");
    g.fillStyle = "rgba(160,110,60,.1)"; g.fillRect(cx + 6, y - 34, 7, 14);
    elips(g, cx, y - 34, 13, 3.1, "#ffffff", "rgba(0,0,0,.1)");
    for (var k = 0; k < 6; k++) lingkaran(g, cx - 10 + k * 4, y - 27 + (k % 2), .9, ["#ff6b9a", "#6cc3f0", "#ffd166"][k % 3]);
    for (var c = 0; c < 6; c++) { var a = c / 6 * 6.28 + .3, chx = cx + Math.cos(a) * 11, chy = y - 34 + Math.sin(a) * 2.4; if (Math.sin(a) > -0.2) { lingkaran(g, chx, chy - .8, 1.3, "#e3343f"); lingkaran(g, chx - .4, chy - 1.2, .35, "#ffffff"); } }
    // lilin angka usia
    var angka = String(D.usia || "").replace(/\D/g, "").slice(0, 2) || "1";
    g.font = "700 15px Fredoka, Nunito, sans-serif"; g.textAlign = "center"; g.textBaseline = "alphabetic";
    var lebar = angka.split("").map(function (h) { return g.measureText(h).width; }), tot = lebar.reduce(function (p, q) { return p + q + 1; }, -1), x = cx - tot / 2;
    angka.split("").forEach(function (h, i) {
      var hx = x + lebar[i] / 2, base = y - 33.2;
      g.lineJoin = "round"; g.lineWidth = 1.6; g.strokeStyle = "#c2406e"; g.strokeText(h, hx, base);
      var gr = g.createLinearGradient(0, base - 12, 0, base); gr.addColorStop(0, "#ffe3ef"); gr.addColorStop(1, "#ff8fb8"); g.fillStyle = gr; g.fillText(h, hx, base);
      kotak(g, hx - .12, base - 13.4, .24, 1.6, "#3a2a20");
      nyala(g, hx, base - 13.4, t + i, opsi);
      x += lebar[i] + 1;
    });
    [-9.5, 9.5].forEach(function (lx, j) {
      var ly = y - 32.4; kotak(g, cx + lx - .6, ly - 7, 1.2, 7, ["#6cc3f0", "#ffd166"][j]);
      g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = .3; for (var s = 0; s < 3; s++) { g.beginPath(); g.moveTo(cx + lx - .6, ly - 1.6 - s * 2.2); g.lineTo(cx + lx + .6, ly - 2.6 - s * 2.2); g.stroke(); }
      kotak(g, cx + lx - .1, ly - 8.2, .2, 1.2, "#3a2a20"); nyala(g, cx + lx, ly - 8.2, t + 3 + j, opsi);
    });
  }
  function nyala(g, x, y, t, opsi) {
    if (opsi.padam) return;
    var ang = opsi.angin || 0, f = Math.sin(t * 13) * .35, miring = ang * 3.2 + Math.sin(t * 30) * ang, kecil = 1 - ang * .55;
    cahaya(g, x, y - 2.5, 8 * kecil, "255,200,90", .4 * kecil);
    g.fillStyle = "#ffb43a"; g.beginPath(); g.moveTo(x + miring, y - 5 * kecil + f); g.quadraticCurveTo(x + 1.9 * kecil, y - 1.6, x, y); g.quadraticCurveTo(x - 1.9 * kecil, y - 1.6, x + miring, y - 5 * kecil + f); g.fill();
    g.fillStyle = "#fff4b8"; g.beginPath(); g.moveTo(x + miring * .7, y - 3.1 * kecil + f); g.quadraticCurveTo(x + .8, y - 1.2, x, y - .4); g.quadraticCurveTo(x - .8, y - 1.2, x + miring * .7, y - 3.1 * kecil + f); g.fill();
  }

  /* =====================================================================
     ADEGAN (satuan piksel dunia; 1 petak = 16)
     ===================================================================== */
  var fotoGaleri = (D.galeri || []).slice(0, 6).map(function (src) { var im = new Image(); im.src = src; return im; });
  /* ---------- Gaya lukisan untuk bagian luar (tanpa garis tepi, cahaya dari kanan atas) ---------- */
  var DAUN = ["#1c3519", "#24431f", "#2f5627", "#3c6b2f", "#4f8236", "#689a42", "#86b04f", "#a9c766", "#cfdd8c"];
  function warnaDaun(b) { return DAUN[Math.max(0, Math.min(DAUN.length - 1, Math.round(b * (DAUN.length - 1))))]; }
  function dab(g, x, y, rx, ry, rot, c) { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 6.2832); g.fillStyle = c; g.fill(); }
  /* gumpalan daun: titik-titik kuas; sisi kanan atas lebih terang */
  function dedaunan(g, cx, cy, rx, ry, n, k, terang, ukuran) {
    terang = terang == null ? 0 : terang; ukuran = ukuran || 1;
    dab(g, cx - rx * .05, cy + ry * .08, rx, ry, 0, "rgba(22,40,20,.92)");
    for (var i = 0; i < n; i++) {
      var a = acak(i, k) * 6.2832, r = Math.sqrt(acak(k, i)), x = cx + Math.cos(a) * r * rx, y = cy + Math.sin(a) * r * ry;
      var b = .5 + ((x - cx) / rx * .45 - (y - cy) / ry * .6) * .55 + (acak(i, k, 3) - .5) * .35 + terang;
      if (r > .85) b -= .12;
      dab(g, x, y, (1.4 + acak(i, k, 4) * 1.8) * ukuran, (.8 + acak(i, k, 5) * 1) * ukuran, acak(i, k, 6) * 3, warnaDaun(b * .85 + .05));
    }
  }
  function rumputLukis(g, x0, y0, w, h, k) {
    g.fillStyle = gradV(g, y0, y0 + h, "#6c9a43", "#5c8a3a"); g.fillRect(x0, y0, w, h);
    for (var p = 0; p < w * h / 2600; p++) { var px = x0 + acak(p, k, 1) * w, py = y0 + acak(k, p, 2) * h; cahaya(g, px, py, 14 + acak(p, k, 3) * 26, acak(p, k, 4) > .5 ? "150,190,90" : "50,90,40", .18); }
    var war = ["#577f35", "#668f3d", "#76a046", "#86ad51", "#4c7530", "#93b85c"];
    for (var i = 0; i < w * h / 9; i++) { var x = x0 + acak(i, k, 7) * w, y = y0 + acak(k, i, 8) * h; dab(g, x, y, 1.2 + acak(i, k, 9) * 1.6, .6 + acak(i, k, 10) * .6, acak(i, k, 11) * .6 - .3, war[i % 6]); }
    g.lineWidth = .4; g.lineCap = "round";
    for (var j = 0; j < w * h / 7; j++) { var bx = x0 + acak(j, k, 12) * w, by = y0 + acak(k, j, 13) * h, c = acak(j, k, 14); g.strokeStyle = c > .6 ? "rgba(170,205,110,.55)" : c > .3 ? "rgba(60,100,40,.5)" : "rgba(110,150,70,.5)"; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + (c - .5) * 1.6, by - 1.6 - c * 1.6); g.stroke(); }
  }
  function bungaKecil(g, x, y, k) {
    var w = ["#f4f1e6", "#f3d26b", "#e9a0a8", "#c9b6e4"][k % 4];
    g.strokeStyle = "#4f7a33"; g.lineWidth = .35; g.beginPath(); g.moveTo(x, y + 2.6); g.lineTo(x + .2, y); g.stroke();
    for (var i = 0; i < 5; i++) { var a = i * 1.2566 + k; dab(g, x + Math.cos(a) * .7, y + Math.sin(a) * .7, .62, .62, 0, w); }
    dab(g, x, y, .38, .38, 0, "#e3b23c");
  }
  function semak(g, cx, cy, rx, ry, k, bunga) {
    elips(g, cx - 3, cy + ry * .7, rx * 1.05, ry * .4, "rgba(20,40,15,.28)");
    dedaunan(g, cx, cy, rx, ry, Math.round(rx * ry * 1.4), k, .05, .8);
    if (bunga) for (var i = 0; i < bunga; i++) { var a = acak(i, k, 20) * 6.28, r = Math.sqrt(acak(k, i, 21)) * .8; dab(g, cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r - .5, .7, .7, 0, ["#f6f2e8", "#f2c9cf", "#f5dc85"][(i + k) % 3]); }
  }

  var JALUR = null;
  function buatLuar() {
    var W = 360, H = 414, M = 170;
    var A = { id: "luar", W: W, H: H, M: M, latar: "#24391f", padat: [], sprite: [], tempat: [], pindah: [], benda: [], lokasi: "Depan rumah", tinggi: 17.5 };
    function blok(x, y, w, h) { A.padat.push([x, y, w, h]); }
    blok(0, 0, W, 216);
    blok(0, 216, 96, 28); blok(18, 244, 48, 26);            // bawah pohon & batang
    blok(118, 216, 56, 10); blok(206, 216, 58, 10);          // bedeng bunga depan teras
    blok(90, 257, 30, 7);                                    // bangku kayu
    blok(286, 228, 34, 18);                                  // pot tanaman pojok
    blok(0, 306, 174, 30); blok(206, 306, W - 206, 30);      // pagar
    blok(224, 336, 6, 5);                                    // tiang kotak surat
    blok(117, 361, 7, 6);                                    // tiang lampu jalan
    blok(0, 370, W, H - 370);                                // jalan raya

    var POHON = { x: 42, y: 270 };
    A.lantai = function (g) {
      // halaman (melebar ke kiri-kanan agar layar lebar tetap terisi)
      rumputLukis(g, -M, 40, W + M * 2, 300, 3);
      // rimbun di belakang rumah & tetangga
      for (var i = 0; i < 46; i++) { var bx = -M + i * ((W + M * 2) / 45), by = 26 + acak(i, 2) * 30; dedaunan(g, bx, by, 26 + acak(i, 3) * 10, 30 + acak(3, i) * 8, 260, i + 40, -.1, 1.1); }
      // pagar tembok tetangga di kanan + semak
      for (var hb = 0; hb < 10; hb++) dedaunan(g, 282 + hb * 24, 150 + acak(hb, 8) * 10, 20, 28, 420, hb + 120, -.05, 1);
      elips(g, 330, 196, 40, 8, "rgba(20,35,15,.3)"); dedaunan(g, 334, 120, 44, 46, 1300, 150, .05, 1.1);
      for (var s = 0; s < 9; s++) semak(g, 286 + s * 26, 204 + acak(s, 9) * 6, 15, 11, s + 70, s % 3 === 0 ? 5 : 0);
      // bayangan pohon & cahaya yang menembus daun
      g.save(); g.beginPath(); g.ellipse(POHON.x - 30, 236, 190, 66, -.05, 0, 6.2832); g.clip();
      g.fillStyle = "rgba(20,45,20,.38)"; g.fillRect(-M, 150, 420, 200);
      for (var d = 0; d < 90; d++) { var lx = POHON.x - 200 + acak(d, 31) * 360, ly = 180 + acak(31, d) * 120; cahaya(g, lx, ly, 3 + acak(d, 32) * 6, "255,240,170", .35); }
      g.restore();
      // jalan setapak (lempeng batu) dari gerbang ke teras
      for (var py = 226; py < 306; py += 11) {
        var o = (py / 11) % 2 ? 1 : -1;
        elips(g, 190 + o, py + 5, 13, 4.2, "rgba(30,40,20,.25)");
        bulatIsi(g, 177 + o, py, 26, 8.5, 2.4, "#b9b2a4"); bulatIsi(g, 177 + o, py, 26, 7, 2.4, "#d2ccbf");
        for (var q = 0; q < 10; q++) dab(g, 179 + o + acak(q, py) * 22, py + 1 + acak(py, q) * 5, .9, .5, 0, acak(q, py, 2) > .5 ? "rgba(255,255,255,.25)" : "rgba(90,85,70,.2)");
      }
      gambarRumah(g);
      // bedeng bunga biasa di depan teras
      [[118, 174], [206, 264]].forEach(function (s, j) {
        bulatIsi(g, s[0], 216, s[1] - s[0], 11, 3, "#6a4e38"); kotak(g, s[0], 224, s[1] - s[0], 2.5, "#8d7b66");
        for (var x2 = s[0] + 5; x2 < s[1] - 2; x2 += 7) semak(g, x2, 216, 5.4, 4.6, x2 + j * 7, 3);
      });
      // pot di pojok kanan
      [[294, 236, 9], [310, 240, 7], [302, 246, 6]].forEach(function (p, j) {
        elips(g, p[0] - 2, p[1] + 2, p[2] * .8, 2, "rgba(20,30,15,.3)");
        poligon(g, [[p[0] - p[2] * .55, p[1] - p[2] * .6], [p[0] + p[2] * .55, p[1] - p[2] * .6], [p[0] + p[2] * .42, p[1] + 1], [p[0] - p[2] * .42, p[1] + 1]], gradX(g, p[0] - p[2], p[0] + p[2], "#9c5534", "#bd6c43", "#d48a5c"));
        semak(g, p[0], p[1] - p[2] * 1.1, p[2] * .75, p[2] * .65, 90 + j, j === 1 ? 4 : 0);
      });
      // bunga liar kecil di rumput
      for (var f = 0; f < 70; f++) { var fx = 70 + acak(f, 51) * 280, fy = 232 + acak(51, f) * 70; if (Math.abs(fx - 190) < 20 || (fx > 84 && fx < 124 && fy > 250 && fy < 268) || (fx > 280 && fy < 250)) continue; bungaKecil(g, fx, fy, f); }
      gambarBatang(g);
      gambarPagar(g);
      gambarJalan(g);
    };

    function gambarRumah(g) {
      // bayangan rumah jatuh ke kiri bawah
      poligon(g, [[118, 210], [262, 210], [252, 224], [104, 224]], "rgba(20,35,15,.28)");
      // atap atas (genteng)
      var atap = [[116, 86], [264, 86], [238, 28], [142, 28]];
      poligon(g, atap, gradX(g, 116, 264, "#7f4330", "#a3583a", "#c0714a"));
      g.save(); poligon(g, atap); g.clip();
      for (var sy = 30; sy < 88; sy += 4.6) { kotak(g, 100, sy + 3.4, 180, 1.2, "rgba(60,25,15,.35)"); for (var sx = 100 + (sy % 9.2); sx < 280; sx += 9.2) kotak(g, sx, sy, .6, 4.4, "rgba(60,25,15,.22)"); }
      for (var w = 0; w < 160; w++) dab(g, 116 + acak(w, 61) * 148, 30 + acak(61, w) * 56, 1.6, .9, 0, acak(w, 62) > .5 ? "rgba(255,200,160,.12)" : "rgba(50,20,10,.12)");
      poligon(g, [[190, 28], [238, 28], [264, 86], [210, 86]], "rgba(255,220,180,.10)");
      g.restore();
      kotak(g, 142, 26, 96, 3.4, "#6e3826");
      kotak(g, 114, 86, 152, 3, "#efe9dc"); kotak(g, 114, 89, 152, 1, "rgba(0,0,0,.2)");
      // dinding lantai 2
      kotak(g, 128, 89, 124, 46, gradX(g, 128, 252, "#ddd3bf", "#ebe3d1", "#f4eee0"));
      kotak(g, 128, 89, 124, 6, "rgba(40,30,20,.18)");
      [[142, 96, 24, 30], [214, 96, 24, 30]].forEach(function (j) { jendela(g, j[0], j[1], j[2], j[3]); });
      jendela(g, 183, 98, 14, 22, false, true);
      // atap teras / lantai 1
      var atap2 = [[110, 154], [270, 154], [258, 134], [122, 134]];
      poligon(g, atap2, gradX(g, 110, 270, "#7f4330", "#a3583a", "#c0714a"));
      g.save(); poligon(g, atap2); g.clip(); for (var ty = 135; ty < 155; ty += 4.4) kotak(g, 100, ty + 3.2, 180, 1.1, "rgba(60,25,15,.35)"); g.restore();
      kotak(g, 108, 154, 164, 3, "#efe9dc"); kotak(g, 108, 157, 164, 1, "rgba(0,0,0,.2)");
      // dinding lantai 1
      kotak(g, 120, 157, 140, 50, gradX(g, 120, 260, "#d9cfbb", "#e8e0cd", "#f2ebdc"));
      kotak(g, 120, 157, 140, 7, "rgba(40,30,20,.2)");
      jendela(g, 132, 166, 34, 26); jendela(g, 214, 166, 34, 26);
      // pintu kayu (bingkai; daunnya digambar sebagai sprite)
      kotak(g, 177, 160, 26, 47, "#cfc5b2"); kotak(g, 179, 162, 22, 45, "#1b1410");
      // lampu dinding, nomor rumah
      kotak(g, 170, 172, 3, 5, "#3b3530"); bulatIsi(g, 169.4, 168, 4.2, 5, 1, "#f1ead2"); kotak(g, 169.4, 172, 4.2, .8, "#3b3530");
      bulatIsi(g, 206, 170, 8, 5, .8, "#3d4a3f"); g.font = "600 3.6px Nunito, sans-serif"; g.fillStyle = "#f1ead2"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("12", 210, 172.7);
      // plint & lantai teras
      kotak(g, 118, 204, 144, 4, "#9a948a");
      kotak(g, 114, 207, 152, 9, gradV(g, 207, 216, "#cdc4b3", "#b8ae9c")); for (var tx = 114; tx < 266; tx += 9.5) kotak(g, tx, 207, .5, 9, "rgba(80,70,55,.25)");
      kotak(g, 176, 216, 28, 4, "#bdb4a3"); kotak(g, 176, 219.5, 28, .8, "rgba(0,0,0,.2)");
      bulatIsi(g, 182, 209.5, 16, 5, 1, "#7a5a3c"); // keset
      // dua pot di samping pintu
      [171, 209].forEach(function (px) { poligon(g, [[px - 3, 202], [px + 3, 202], [px + 2.4, 208], [px - 2.4, 208]], "#b0623d"); semak(g, px, 199, 4.2, 4.4, px, 0); });
    }
    function jendela(g, x, y, w, h, tanpaTirai, kecil) {
      kotak(g, x - 1.6, y - 1.6, w + 3.2, h + 3.2, "#6e4a30"); kotak(g, x - 1.6, y + h + .6, w + 3.2, 1.8, "#cfc5b2");
      var gr = g.createLinearGradient(x, y, x + w * .4, y + h); gr.addColorStop(0, "#b7c9cf"); gr.addColorStop(.5, "#7e959e"); gr.addColorStop(1, "#4f6168");
      kotak(g, x, y, w, h, gr);
      if (!kecil) { kotak(g, x, y, w * .26, h, "rgba(240,234,220,.85)"); kotak(g, x + w * .74, y, w * .26, h, "rgba(240,234,220,.85)"); for (var c = 0; c < 3; c++) { kotak(g, x + c * w * .085 + 1, y, .4, h, "rgba(150,140,120,.35)"); kotak(g, x + w * .76 + c * w * .085, y, .4, h, "rgba(150,140,120,.35)"); } }
      kotak(g, x + w / 2 - .7, y, 1.4, h, "#6e4a30"); if (!kecil) kotak(g, x, y + h * .42, w, 1.2, "#6e4a30");
      poligon(g, [[x + w * .3, y + h], [x + w * .55, y], [x + w * .66, y], [x + w * .41, y + h]], "rgba(255,255,255,.16)");
    }
    function gambarBatang(g) {
      var x = POHON.x, y = POHON.y;
      elips(g, x - 6, y + 4, 40, 9, "rgba(20,30,15,.35)");
      // akar papan menjalar di tanah (pipih, meruncing)
      function akar(x0, y0, x1, y1, cxp, cyp, w0) {
        var kiri = [], kanan = [];
        for (var i = 0; i <= 12; i++) {
          var u = i / 12, m = 1 - u, px = m * m * x0 + 2 * m * u * cxp + u * u * x1, py = m * m * y0 + 2 * m * u * cyp + u * u * y1, w = w0 * (1 - u * .92);
          kiri.push([px, py - w * .55]); kanan.unshift([px, py + w * .35]);
        }
        poligon(g, kiri.concat(kanan), "#4a3c2f"); g.strokeStyle = "rgba(170,150,115,.45)"; g.lineWidth = .7; g.beginPath(); kiri.forEach(function (p, i) { if (i) g.lineTo(p[0], p[1] + .4); else g.moveTo(p[0], p[1] + .4); }); g.stroke();
      }
      [[-1, 40, 6], [-1, 28, -4], [1, 36, 6], [1, 24, -3], [-1, 20, 11], [1, 18, 10]].forEach(function (r) { akar(x + r[0] * 10, y - 3, x + r[0] * r[1], y + r[2], x + r[0] * r[1] * .55, y + r[2] * .1 - 1, 9); });
      // batang: banyak serat yang terpilin
      var bawah = y + 2, atas = 150;
      g.fillStyle = "#3f3328"; g.beginPath(); g.moveTo(x - 26, bawah); g.bezierCurveTo(x - 13, y - 22, x - 18, 200, x - 26, atas); g.lineTo(x + 24, atas); g.bezierCurveTo(x + 14, 200, x + 12, y - 22, x + 26, bawah); g.closePath(); g.fill();
      for (var s = 0; s < 24; s++) {
        var u = s / 23, bx = x - 22 + u * 44, tx = x - 24 + u * 48 + Math.sin(s * 1.7) * 3, lw = 1.8 + acak(s, 5) * 1.8;
        var cbx = x - 26 + acak(s, 6) * 52;
        [["rgba(40,32,24,.8)", lw + 1], [["#4c3e31", "#594a3b", "#665543"][s % 3], lw], [u > .55 ? "rgba(200,180,140,.35)" : "rgba(140,120,95,.22)", lw * .3]].forEach(function (st, l) {
          g.strokeStyle = st[0]; g.lineWidth = st[1]; g.beginPath(); g.moveTo(bx + (l === 2 ? lw * .2 : 0), bawah - 2); g.bezierCurveTo(cbx, y - 24, x - 18 + acak(s, 7) * 36, 212, tx + (l === 2 ? lw * .2 : 0), atas); g.stroke();
        });
      }
      // cahaya matahari dari kanan & lumut
      g.save(); g.beginPath(); g.moveTo(x - 26, bawah); g.bezierCurveTo(x - 13, y - 22, x - 18, 200, x - 26, atas); g.lineTo(x + 24, atas); g.bezierCurveTo(x + 14, 200, x + 12, y - 22, x + 26, bawah); g.closePath(); g.clip();
      var sinar = g.createLinearGradient(x - 24, 0, x + 24, 0); sinar.addColorStop(0, "rgba(10,10,5,.35)"); sinar.addColorStop(.55, "rgba(0,0,0,0)"); sinar.addColorStop(1, "rgba(255,230,170,.25)"); g.fillStyle = sinar; g.fillRect(x - 30, atas, 60, bawah - atas);
      for (var m = 0; m < 50; m++) dab(g, x - 22 + acak(m, 81) * 44, atas + acak(81, m) * (bawah - atas), 1.6, 1, 0, acak(m, 82) > .5 ? "rgba(110,140,60,.35)" : "rgba(255,235,180,.22)");
      g.restore();
      // akar gantung yang sudah menyentuh tanah di samping batang
      [[x - 30, 6], [x + 30, 4], [x + 36, 2]].forEach(function (a, j) { g.strokeStyle = "rgba(70,56,42,.85)"; g.lineWidth = 1.2 + j * .2; g.beginPath(); g.moveTo(a[0] + 4, 196); g.quadraticCurveTo(a[0] - 2, 230, a[0], y + a[1]); g.stroke(); });
    }
    function gambarPagar(g) {
      // daun pintu gerbang (terbuka ke dalam, menempel di pagar)
      [[174, 150], [206, 230]].forEach(function (d) {
        var x0 = Math.min(d[0], d[1]), x1 = Math.max(d[0], d[1]);
        kotak(g, x0, 296, x1 - x0, 1.6, "#24221f"); kotak(g, x0, 306, x1 - x0, 1.6, "#24221f");
        for (var b = x0 + 1; b < x1; b += 3) kotak(g, b, 296, .9, 12, "#2f2c28");
      });
      // tembok pagar rendah + jeruji besi
      [[-M, 162], [218, W + M]].forEach(function (s) {
        var x0 = s[0], w = s[1] - s[0];
        kotak(g, x0, 300, w, 1.3, "#1f1d1b"); for (var b = x0 + 1; b < s[1]; b += 4) kotak(g, b, 300, 1, 12, "#2a2724");
        kotak(g, x0, 310, w, 5, gradV(g, 310, 315, "#d7d0c2", "#bdb5a5"));
        kotak(g, x0, 315, w, 17, gradV(g, 315, 332, "#e7e0d1", "#cfc6b4"));
        for (var n = 0; n < w / 3; n++) dab(g, x0 + acak(n, 91) * w, 316 + acak(91, n) * 15, 1.4, .6, 0, acak(n, 92) > .5 ? "rgba(255,255,255,.18)" : "rgba(90,80,60,.14)");
        kotak(g, x0, 331, w, 3, "rgba(30,25,20,.25)");
      });
      // pilar gerbang
      [[162, 174], [206, 218]].forEach(function (p) {
        kotak(g, p[0], 294, p[1] - p[0], 38, gradX(g, p[0], p[1], "#cfc6b4", "#e2dbcc", "#f0eadc"));
        kotak(g, p[0] - 1.4, 290, p[1] - p[0] + 2.8, 5, "#a59d8e"); kotak(g, p[0] - 1.4, 290, p[1] - p[0] + 2.8, 1.4, "#c8c0b0");
        kotak(g, p[0], 331, p[1] - p[0], 3, "rgba(30,25,20,.25)");
      });
    }
    function gambarJalan(g) {
      // trotoar
      kotak(g, -M, 334, W + M * 2, 32, "#b9b4aa");
      for (var ty = 334; ty < 366; ty += 10.7) for (var tx = -M + ((ty / 10.7) % 2) * 5; tx < W + M; tx += 10.7) {
        kotak(g, tx + .4, ty + .4, 10, 10, acak(tx, ty) > .5 ? "#c4bfb5" : "#bdb8ad");
        if (acak(ty, tx) > .8) dab(g, tx + 5, ty + 5, 2.4, 1.4, 0, "rgba(80,75,65,.12)");
      }
      kotak(g, -M, 334, W + M * 2, 3, "rgba(30,30,20,.22)");
      // trotoar masuk ke gerbang
      kotak(g, 174, 330, 32, 6, "#c6c1b7");
      // kerb
      kotak(g, -M, 366, W + M * 2, 3, "#dcd8cf"); kotak(g, -M, 369, W + M * 2, 2.5, "#8f8b84");
      for (var kx = -M; kx < W + M; kx += 16) kotak(g, kx, 366, .6, 5.5, "rgba(60,60,55,.35)");
      // aspal
      kotak(g, -M, 371.5, W + M * 2, H - 371.5, gradV(g, 371, H, "#55575a", "#4b4d50"));
      for (var a = 0; a < 2600; a++) dab(g, -M + acak(a, 101) * (W + M * 2), 372 + acak(101, a) * (H - 372), .5 + acak(a, 102) * .8, .4, 0, acak(a, 103) > .5 ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.12)");
      kotak(g, -M, 377, W + M * 2, 1.4, "rgba(235,235,225,.75)");
      for (var lx = -M; lx < W + M; lx += 30) kotak(g, lx, 404, 16, 1.8, "rgba(235,235,225,.8)");
      // saluran air
      for (var sx = 24; sx < W; sx += 140) { kotak(g, sx, 371.5, 14, 3, "#2c2d2f"); for (var sb = 0; sb < 7; sb++) kotak(g, sx + 1 + sb * 2, 372, .7, 2.2, "#6d6e70"); }
    }

    /* pintu (bisa terbuka) */
    var bukaPintu = 0;
    A.setPintu = function (v) { bukaPintu = v; };
    A.sprite.push({ y: 0, gambar: function (g) {
      var w = 22 * (1 - bukaPintu);
      if (bukaPintu > 0) kotak(g, 179, 162, 22, 45, "#0a0806");
      if (w > .5) {
        kotak(g, 179, 162, w, 45, gradX(g, 179, 179 + w, "#5e3a22", "#7a4b2c", "#8a5834"));
        g.strokeStyle = "rgba(40,22,12,.6)"; g.lineWidth = .5; g.strokeRect(179 + w * .16, 166, w * .68, 16); g.strokeRect(179 + w * .16, 186, w * .68, 17);
        for (var s = 0; s < 6; s++) kotak(g, 179 + w * (.18 + s * .12), 162, .3, 45, "rgba(30,15,8,.18)");
        lingkaran(g, 179 + w * .84, 186, .9, "#c9b07a"); kotak(g, 179 + w * .84 - .3, 188, .6, 1.4, "#3a2a1a");
      }
    } });
    /* bangku kayu di bawah pohon */
    A.sprite.push({ y: 264, gambar: function (g) {
      elips(g, 103, 265, 16, 2.6, "rgba(20,30,15,.3)");
      kotak(g, 91, 254, 26, 2.2, "#6a4a30"); kotak(g, 91, 251, 26, 1.6, "#7d5a3a");
      kotak(g, 90, 258, 28, 3, "#8b6440"); kotak(g, 90, 258, 28, .8, "#a77c52");
      [92, 114].forEach(function (lx) { kotak(g, lx, 254, 1.6, 10, "#4f3622"); });
    } });
    /* kotak surat di samping pilar gerbang */
    A.sprite.push({ y: 340, gambar: function (g, t) {
      var x = 227;
      elips(g, x - 2, 340, 6, 1.6, "rgba(20,20,15,.3)");
      kotak(g, x - 1, 324, 2, 16, "#3a3733"); kotak(g, x - .2, 324, .5, 16, "rgba(255,255,255,.2)");
      bulatIsi(g, x - 7.5, 312, 15, 13, 2.2, gradX(g, x - 7.5, x + 7.5, "#2f4637", "#3e5a47", "#4f6f58"));
      kotak(g, x - 7.5, 316.5, 15, .7, "rgba(0,0,0,.2)");
      kotak(g, x - 4.6, 319, 9.2, 1.3, "#1b231d"); kotak(g, x - 4.6, 319, 9.2, .4, "rgba(255,255,255,.18)");
      g.font = "700 2.3px Nunito, sans-serif"; g.fillStyle = "rgba(240,232,210,.85)"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("SURAT", x, 322.6);
      kotak(g, x - 7, 312.6, 14, 1, "rgba(255,255,255,.18)");
      var bendera = suratDibaca ? 0 : 1;
      g.save(); g.translate(x + 7.5, 318); g.rotate(bendera ? -1.45 : 0); kotak(g, -.4, -5, .9, 5, "#a8322c"); kotak(g, -.4, -5, 2.4, 1.8, "#c4423a"); g.restore();
    } });
    /* lampu jalan */
    A.sprite.push({ y: 367, gambar: function (g) {
      elips(g, 116, 367, 5, 1.4, "rgba(20,20,15,.3)");
      kotak(g, 119, 290, 2.4, 77, gradX(g, 119, 121.4, "#3b3e42", "#5a5e63", "#2f3236"));
      kotak(g, 118, 362, 4.4, 5, "#3b3e42");
      g.strokeStyle = "#3b3e42"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(120.2, 292); g.quadraticCurveTo(121, 282, 132, 282); g.stroke();
      bulatIsi(g, 128, 280, 10, 3.2, 1.4, "#45484c"); kotak(g, 129, 283, 8, .9, "#e9e4cf");
    } });

    /* ---------- tajuk pohon (di atas tokoh) ---------- */
    A.atas = { x: -M, y: -10, w: 330, h: 262, gambar: function (g) {
      var cx = POHON.x - 34, cy = 104;
      // dahan besar yang mengintip di sela daun
      g.lineCap = "round";
      [[POHON.x - 2, 160, POHON.x - 90, 70, 9], [POHON.x + 6, 160, POHON.x + 70, 96, 7], [POHON.x, 160, POHON.x - 20, 40, 8], [POHON.x + 4, 160, POHON.x + 110, 150, 5]].forEach(function (d) {
        g.strokeStyle = "#3a2f26"; g.lineWidth = d[4]; g.beginPath(); g.moveTo(d[0], d[1]); g.quadraticCurveTo((d[0] + d[2]) / 2 + 6, (d[1] + d[3]) / 2 + 10, d[2], d[3]); g.stroke();
        g.strokeStyle = "rgba(160,140,110,.4)"; g.lineWidth = d[4] * .3; g.beginPath(); g.moveTo(d[0] + 2, d[1]); g.quadraticCurveTo((d[0] + d[2]) / 2 + 8, (d[1] + d[3]) / 2 + 10, d[2] + 1, d[3]); g.stroke();
      });
      // gumpalan daun, dari belakang (atas) ke depan (bawah)
      var gump = [];
      for (var i = 0; i < 26; i++) { var a = acak(i, 201) * 6.2832, r = Math.sqrt(acak(201, i)); gump.push({ x: cx + Math.cos(a) * r * 150, y: cy + Math.sin(a) * r * 82, r: 30 + acak(i, 202) * 22, k: i }); }
      gump.push({ x: POHON.x + 78, y: 150, r: 30, k: 40 }, { x: POHON.x + 104, y: 128, r: 24, k: 41 }, { x: POHON.x + 30, y: 176, r: 30, k: 42 }, { x: POHON.x - 40, y: 184, r: 34, k: 43 }, { x: POHON.x - 110, y: 178, r: 34, k: 44 });
      gump.sort(function (p, q) { return p.y - q.y; });
      gump.forEach(function (c, j) {
        // dahan kecil antar gumpalan
        if (j % 4 === 1) { g.strokeStyle = "rgba(50,40,30,.8)"; g.lineWidth = 2; g.beginPath(); g.moveTo(c.x - c.r * .6, c.y + c.r * .5); g.quadraticCurveTo(c.x, c.y + c.r * .2, c.x + c.r * .5, c.y + c.r * .7); g.stroke(); }
        dedaunan(g, c.x, c.y, c.r, c.r * .82, Math.round(c.r * c.r * 1.25), c.k + 300, (c.y - 150) / -400, 1);
      });
      // akar gantung (ciri pohon beringin)
      for (var k = 0; k < 46; k++) {
        var ax = POHON.x - 150 + acak(k, 211) * 270, ay = 170 + acak(211, k) * 34, pj = 14 + acak(k, 212) * 46;
        if (ax > POHON.x + 90) continue;
        g.strokeStyle = "rgba(" + (80 + Math.round(acak(k, 213) * 30)) + ",64,48," + (.55 + acak(k, 214) * .35) + ")"; g.lineWidth = .35 + acak(k, 215) * .55;
        g.beginPath(); g.moveTo(ax, ay); g.bezierCurveTo(ax + 1.5, ay + pj * .4, ax - 1.5, ay + pj * .7, ax + .5, ay + pj); g.stroke();
      }
    } };

    /* ---------- benda yang bisa diklik (tanpa label/tombol) ---------- */
    A.benda.push({ key: "surat", x: 218, y: 308, w: 22, h: 34, ax: 227, ay: 346, r: 34 });
    A.benda.push({ key: "pintu", x: 177, y: 158, w: 26, h: 52, ax: 190, ay: 224, r: 30 });
    A.benda.push({ key: "pohon", x: 10, y: 150, w: 68, h: 124, ax: 46, ay: 284, r: 52 });
    A.awal = { x: 340, y: 352, arah: "kiri" };

    /* ---------- efek: tajuk bergoyang, daun gugur, surat jatuh, mobil lewat ---------- */
    var daun = [], goyang = 0, mobil = null, tMobil = 4;
    A.suratPohon = null;
    A.goyangPohon = function () {
      goyang = 1;
      for (var i = 0; i < 9; i++) daun.push({ x: POHON.x - 60 + Math.random() * 130, y: 160 + Math.random() * 40, vy: 10 + Math.random() * 8, p: Math.random() * 6, umur: 4 + Math.random() * 2 });
      if (D.suratPohon && !A.suratPohon) A.suratPohon = { x0: POHON.x + 30, y0: 186, x: POHON.x + 30, y: 186, ke: 292, t: 0, diam: false };
    };
    A.efek = function (g, t, dt) {
      dt = dt || .016;
      goyang = Math.max(0, goyang - dt * 1.2);
      var ox = Math.sin(t * .7) * .35 + Math.sin(t * 22) * goyang * 1.6, oy = Math.cos(t * .5) * .2;
      if (A.gambarAtas) g.drawImage(A.gambarAtas, A.atas.x + ox, A.atas.y + oy, A.atas.w, A.atas.h);
      if (Math.random() < dt * .35) daun.push({ x: POHON.x - 120 + Math.random() * 200, y: 170 + Math.random() * 30, vy: 7 + Math.random() * 6, p: Math.random() * 6, umur: 6 });
      daun = daun.filter(function (d) { return d.umur > 0; });
      daun.forEach(function (d) {
        d.umur -= dt; d.y = Math.min(d.y + d.vy * dt, 300); d.x += Math.sin(t * 2 + d.p) * 8 * dt;
        g.save(); g.translate(d.x, d.y); g.rotate(Math.sin(t * 3 + d.p) * 1.2); g.globalAlpha = Math.min(1, d.umur);
        dab(g, 0, 0, 1.6, .8, 0, d.p > 3 ? "#9bb552" : "#c9a24a"); g.restore();
      });
      var s = A.suratPohon;
      if (s) {
        if (!s.diam) {
          s.t += dt; var u = Math.min(1, s.t / 2.6);
          s.y = s.y0 + (s.ke - s.y0) * u; s.x = s.x0 + Math.sin(s.t * 3.2) * 9 * (1 - u) + u * 8;
          if (u >= 1) { s.diam = true; A.benda.push({ key: "suratPohon", x: s.x - 9, y: s.y - 9, w: 18, h: 14, ax: s.x, ay: s.y + 6, r: 34 }); }
        }
        var rot = s.diam ? -.15 : Math.sin(s.t * 3.2) * .6;
        g.save(); g.translate(s.x, s.y);
        if (s.diam) { elips(g, .5, 3.2, 6.5, 1.4, "rgba(20,30,15,.3)"); if (!suratPohonDibaca) cahaya(g, 0, 0, 10 + Math.sin(t * 3) * 2, "255,245,200", .35); }
        g.rotate(rot);
        bulatIsi(g, -5.5, -3.6, 11, 7.2, .6, "#f3ecdc"); kotak(g, -5.5, -3.6, 11, 7.2, "rgba(0,0,0,0)");
        poligon(g, [[-5.5, -3.6], [5.5, -3.6], [0, .6]], "#e4dac4"); g.strokeStyle = "rgba(120,100,70,.5)"; g.lineWidth = .3; g.strokeRect(-5.5, -3.6, 11, 7.2);
        lingkaran(g, 0, .4, 1.3, "#a8322c");
        g.restore();
      }
      // mobil sesekali lewat di jalan
      tMobil -= dt;
      if (!mobil && tMobil <= 0) { var kanan = Math.random() < .5; mobil = { x: kanan ? -M - 50 : W + M + 50, y: kanan ? 396 : 418, v: (kanan ? 1 : -1) * (60 + Math.random() * 25), w: ["#d9d6cf", "#8c2f2a", "#3d4a5c", "#b9bcc0"][Math.floor(Math.random() * 4)] }; }
      if (mobil) {
        mobil.x += mobil.v * dt; gambarMobil(g, mobil);
        if (mobil.x < -M - 80 || mobil.x > W + M + 80) { mobil = null; tMobil = 9 + Math.random() * 10; }
      }
    };
    function gambarMobil(g, m) {
      g.save(); g.translate(m.x, m.y); if (m.v < 0) g.scale(-1, 1);
      elips(g, 0, 1, 26, 4, "rgba(0,0,0,.35)");
      bulatIsi(g, -24, -14, 48, 13, 4, m.w);
      bulatIsi(g, -12, -23, 26, 11, 4, m.w);
      bulatIsi(g, -10, -21.5, 10, 8, 1.6, "#5d7178"); bulatIsi(g, 2, -21.5, 10, 8, 1.6, "#6e848b");
      kotak(g, -24, -8, 48, 1, "rgba(0,0,0,.18)"); kotak(g, -24, -14, 48, 1.4, "rgba(255,255,255,.25)");
      [-14, 14].forEach(function (wx) { lingkaran(g, wx, -1.5, 4, "#1d1d1f"); lingkaran(g, wx, -1.5, 1.8, "#8a8c90"); });
      kotak(g, 22, -12, 2, 2.4, "#f4ecc8"); kotak(g, -24, -12, 1.6, 2.4, "#c2332b");
      g.restore();
    }
    return A;
  }

  function lantaiKayu(g, x0, y0, w, h, warna, garisW) {
    kotak(g, x0, y0, w, h, warna);
    for (var y = y0, r = 0; y < y0 + h; y += 9, r++) {
      kotak(g, x0, y, w, .5, garisW);
      for (var x = x0 + (r % 3) * 22; x < x0 + w; x += 66) kotak(g, x, y, .5, 9, garisW);
      kotak(g, x0, y + 1, w, 1.4, "rgba(255,255,255,.07)");
    }
  }
  function kelopakLantai(g, x0, y0, w, h, n, k) {
    for (var i = 0; i < n; i++) { var x = x0 + acak(i, k) * w, y = y0 + acak(k, i) * h; g.save(); g.translate(x, y); g.rotate(acak(i, k, 3) * 6); elips(g, 0, 0, 1.6, .9, ["#ff5f8f", "#ff8fb1", "#e83f6f"][i % 3]); g.restore(); }
  }

  function buatLantai1() {
    var A = { id: "lantai1", W: 320, H: 224, latar: "#2a1d22", padat: [], sprite: [], tempat: [], pindah: [], lokasi: "Lantai 1 · Ruang pesta" };
    function blok(x, y, w, h) { A.padat.push([x, y, w, h]); }
    blok(0, 0, 258, 76); blok(306, 0, 14, 224); blok(0, 0, 8, 224);
    blok(0, 212, 144, 12); blok(176, 212, 144, 12);
    blok(250, 76, 8, 96); blok(102, 122, 56, 18); blok(190, 98, 46, 22); blok(170, 146, 16, 8); blok(14, 86, 50, 26);
    blok(18, 168, 14, 8); blok(226, 168, 14, 8); blok(84, 196, 12, 8); blok(228, 196, 12, 8);
    A.lantai = function (g) {
      kotak(g, 0, 0, 320, 76, "#f9e4d8");
      for (var x = 0; x < 320; x += 12) kotak(g, x, 0, 5, 76, "rgba(255,255,255,.35)");
      kotak(g, 0, 0, 320, 76, gradV(g, 0, 76, "rgba(150,70,80,.10)", "rgba(255,230,210,0)"));
      kotak(g, 0, 70, 320, 6, "#e8b7a6"); kotak(g, 0, 70, 320, 1, "rgba(255,255,255,.6)");
      lantaiKayu(g, 0, 76, 320, 148, "#e0b27c", "rgba(120,80,40,.28)");
      elips(g, 130, 142, 62, 28, "#ffd6e4"); elips(g, 130, 142, 56, 24, null, "rgba(232,93,143,.45)"); elips(g, 130, 142, 48, 19, null, "rgba(232,93,143,.25)");
      kelopakLantai(g, 20, 130, 220, 80, 70, 3);
      kotak(g, 0, 0, 8, 224, "#c98a77"); kotak(g, 312, 0, 8, 224, "#c98a77");
      kotak(g, 0, 212, 144, 12, "#9a5e52"); kotak(g, 176, 212, 144, 12, "#9a5e52"); kotak(g, 0, 212, 320, 1.5, "rgba(255,255,255,.15)");
      bulatIsi(g, 146, 206, 28, 12, 3, "#e85d8f"); hati(g, 160, 211, 2, "#ffffff");
      kotak(g, 258, 72, 48, 100, "#9a6a48");
      for (var s = 0; s < 8; s++) { var sy = 72 + s * 12.5, k = 1 - s * .05; kotak(g, 260, sy, 44, 12.5, "rgb(" + Math.round(160 * k + 60) + "," + Math.round(118 * k + 40) + "," + Math.round(78 * k + 20) + ")"); kotak(g, 260, sy + 9.5, 44, 3, "rgba(70,40,20,.35)"); kotak(g, 260, sy, 44, 1, "rgba(255,255,255,.2)"); }
      kotak(g, 272, 72, 20, 100, "rgba(230,80,120,.45)");
      poligon(g, [[282, 80], [288, 88], [276, 88]], "rgba(255,255,255,.8)");
    };
    A.sprite.push({ y: 0, gambar: function (g, t) {
      lampuHias(g, t, 8, 256, 3);
      hurufFoil(g, "HAPPY", 130, 21, 16, t);
      hurufFoil(g, "BIRTHDAY", 130, 42, 16, t + 2);
      if (D.nama) hurufFoil(g, String(D.nama).toUpperCase().slice(0, 12), 130, 61, 10, t + 4, ["#ffe3ec", "#ff8fb1", "#ffe8ef", "#e85d8f"]);
      [[28, 18, 5], [232, 16, 5], [44, 50, 3.6], [218, 50, 3.8], [70, 8, 3], [192, 8, 3]].forEach(function (b, i) { bintang(g, b[0], b[1] + Math.sin(t + i) * .6, b[2], "#f1c84f", Math.sin(t * .7 + i) * .2); kilau(g, b[0] - b[2] * .3, b[1] - b[2] * .3 + Math.sin(t + i) * .6, b[2] * .35, .8); });
      [[14, 14], [22, 30], [10, 44], [244, 12], [236, 30], [248, 46]].forEach(function (b, i) { balon(g, b[0] + Math.sin(t + i) * .7, b[1] + Math.cos(t * 1.2 + i) * .7, 6.5, WARNA[i % 6], null, null, i % 3 === 1 ? "hati" : null); });
    } });
    A.sprite.push({ y: 112, gambar: function (g) {
      bayangan(g, 39, 112, 28, 3.5);
      bulatIsi(g, 14, 78, 50, 18, 5, "#ffc2d4", true); bulatIsi(g, 12, 92, 54, 20, 4, "#ffd6e2", true);
      bulatIsi(g, 8, 84, 10, 28, 4, "#f7a9c2", true); bulatIsi(g, 60, 84, 10, 28, 4, "#f7a9c2", true);
      bulatIsi(g, 20, 84, 13, 11, 4, "#ffffff", true); hati(g, 26.5, 89.5, 2.2, "#ff6b9a"); bulatIsi(g, 44, 84, 13, 11, 4, "#fff3b0", true);
    } });
    A.sprite.push({ y: 140, gambar: function (g, t) {
      var ty = 130;
      bayangan(g, 130, ty + 10, 32, 4);
      kotak(g, 128, ty, 4, 10, "#8a5a3b");
      elips(g, 130, ty, 30, 10, "#ffffff", true); kotak(g, 100, ty, 60, 7, "#ffffff"); elips(g, 130, ty + 7, 30, 8, "#ffffff");
      g.strokeStyle = OUT; g.lineWidth = .5; g.beginPath(); g.moveTo(100, ty); g.lineTo(100, ty + 7); g.moveTo(160, ty); g.lineTo(160, ty + 7); g.stroke();
      for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI; elips(g, 130 - Math.cos(a) * 29, ty + 7 + Math.sin(a) * 7.6, 2.2, 1.5, "#ff8fb1"); }
      elips(g, 130, ty, 30, 10, null, .5);
      kue(g, 130, ty, t);
    } });
    A.sprite.push({ y: 120, gambar: function (g) {
      hadiahKotak(g, 192, 104, 16, 14, "#ff6b9a", "#ffd166"); hadiahKotak(g, 211, 100, 20, 18, "#6cc3f0", "#ffffff"); hadiahKotak(g, 198, 92, 13, 11, "#b48cf2", "#ffffff"); hadiahKotak(g, 216, 88, 11, 11, "#ffd166", "#ff6b9a");
    } });
    A.sprite.push({ y: 172, gambar: function (g) {
      for (var y = 80; y < 172; y += 8) kotak(g, 253, y - 10, 1.6, 10, "#ffffff");
      bulatIsi(g, 250, 68, 6, 104, 2.5, "#b56a52", true); lingkaran(g, 253, 168, 3.2, "#c98a77", true);
    } });
    [[25, 176, 5, 0, false], [233, 176, 5, 3, true], [90, 204, 4, 1, true], [234, 204, 4, 5, false]].forEach(function (b) { A.sprite.push({ y: b[1], gambar: function (g, t) { kumpulanBalon(g, b[0], b[1], t, b[2], b[3], 32, b[4]); } }); });
    A.efek = function (g) { if (!KUE.padam) cahaya(g, 130, 100, 60, "255,200,120", .12); };
    A.tempat.push({ key: "kue", nama: "Kue Ulang Tahun", x: 96, y: 142, w: 66, h: 24, lx: 130, ly: 76 });
    A.tempat.push({ key: "dia", nama: D.pengirim || "Si Dia", x: 164, y: 152, w: 34, h: 22, lx: 178, ly: 108 });
    A.pindah.push({ x: 260, y: 66, w: 44, h: 18, ke: "lantai2", pos: { x: 282, y: 88, arah: "bawah" }, teks: "Naik ke lantai 2" });
    A.pindah.push({ x: 144, y: 214, w: 32, h: 10, ke: "luar", pos: { x: 190, y: 228, arah: "bawah" }, teks: "Keluar" });
    return A;
  }

  function buatLantai2() {
    var A = { id: "lantai2", W: 320, H: 192, latar: "#2a1d22", padat: [], sprite: [], tempat: [], pindah: [], lokasi: "Lantai 2 · Ruang kado" };
    function blok(x, y, w, h) { A.padat.push([x, y, w, h]); }
    blok(0, 0, 320, 76); blok(0, 0, 8, 192); blok(306, 0, 14, 192); blok(0, 182, 320, 10);
    blok(250, 92, 8, 92); blok(110, 106, 40, 24); blok(14, 80, 46, 22);
    blok(26, 160, 12, 8); blok(206, 160, 12, 8); blok(64, 150, 14, 10);
    A.lantai = function (g) {
      kotak(g, 0, 0, 320, 76, "#f7d6e2");
      for (var y = 6; y < 70; y += 10) for (var x = (y / 10 % 2) * 8 + 4; x < 320; x += 16) hati(g, x, y, 1.2, "rgba(255,255,255,.75)");
      kotak(g, 0, 70, 320, 6, "#e2a0b8"); kotak(g, 0, 70, 320, 1, "rgba(255,255,255,.6)");
      lantaiKayu(g, 0, 76, 320, 116, "#ecd4b2", "rgba(140,100,60,.25)");
      elips(g, 130, 132, 66, 30, "#f6dcea"); elips(g, 130, 132, 58, 25, null, "rgba(232,93,143,.4)");
      for (var i = 0; i < 46; i++) { var a = i / 46 * 6.283, hx = 16 * Math.pow(Math.sin(a), 3), hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); g.save(); g.translate(130 + hx * 2.6, 134 + hy * 1.5); g.rotate(a * 3); elips(g, 0, 0, 1.8, 1, i % 2 ? "#ff5f8f" : "#e83f6f"); g.restore(); }
      kelopakLantai(g, 20, 90, 220, 90, 40, 9);
      kotak(g, 0, 0, 8, 192, "#d996ae"); kotak(g, 306, 0, 14, 192, "#d996ae"); kotak(g, 0, 182, 320, 10, "#b9758f");
      kotak(g, 196, 10, 44, 46, "#ffffff"); kotak(g, 199, 13, 38, 40, gradV(g, 13, 53, "#2c3a74", "#6a5aa8"));
      lingkaran(g, 228, 24, 5, "#fff6c8"); lingkaran(g, 230, 22.5, 4.4, "#2f3c76"); for (var s = 0; s < 6; s++) lingkaran(g, 203 + acak(s, 2) * 30, 16 + acak(2, s) * 32, .5, "#ffffff");
      kotak(g, 217.3, 13, 1.4, 40, "#ffffff");
      poligon(g, [[192, 6], [204, 6], [199, 60], [192, 60]], "#ff9fc0", true); poligon(g, [[244, 6], [232, 6], [237, 60], [244, 60]], "#ff9fc0", true);
      kotak(g, 258, 92, 48, 90, "#3a2a24");
      for (var t2 = 0; t2 < 8; t2++) { var sy = 94 + t2 * 11; kotak(g, 260, sy, 44, 8.5, "rgb(" + (196 - t2 * 14) + "," + (156 - t2 * 12) + "," + (116 - t2 * 10) + ")"); kotak(g, 260, sy + 8.5, 44, 2.5, "rgba(0,0,0," + (.3 + t2 * .06) + ")"); }
      poligon(g, [[282, 176], [288, 168], [276, 168]], "rgba(255,255,255,.8)");
    };
    A.sprite.push({ y: 0, gambar: function (g, t) {
      lampuHias(g, t, 8, 190, 3); lampuHias(g, t + 1, 246, 304, 3);
      var bingkai = [[66, 12, 30, 24], [102, 9, 34, 28], [142, 13, 28, 22], [74, 42, 26, 22], [106, 42, 30, 24], [142, 40, 32, 26]];
      bingkai.forEach(function (b, i) {
        g.save(); g.translate(b[0] + b[2] / 2, b[1] + b[3] / 2); g.rotate((acak(i, 9) - .5) * .1);
        kotak(g, -b[2] / 2 - 2, -b[3] / 2 - 2, b[2] + 4, b[3] + 4, i % 2 ? "#ffffff" : "#f1c84f"); g.strokeStyle = OUT; g.lineWidth = .4; g.strokeRect(-b[2] / 2 - 2, -b[3] / 2 - 2, b[2] + 4, b[3] + 4);
        var im = fotoGaleri[i];
        if (im && im.complete && im.naturalWidth) { var r = Math.max(b[2] / im.naturalWidth, b[3] / im.naturalHeight), sw = b[2] / r, sh = b[3] / r; g.drawImage(im, (im.naturalWidth - sw) / 2, (im.naturalHeight - sh) / 2, sw, sh, -b[2] / 2, -b[3] / 2, b[2], b[3]); }
        else { kotak(g, -b[2] / 2, -b[3] / 2, b[2], b[3], ["#ffe0ec", "#e2f2ff", "#fff3cc", "#e6dcff", "#dff6e6", "#ffe5d6"][i]); hati(g, 0, -1, b[3] * .18, ["#ff6b9a", "#6cc3f0", "#ffb36b", "#b48cf2", "#7ed6a0", "#ff6b9a"][i]); }
        g.restore();
      });
      [[24, 22], [36, 12], [176, 60], [286, 22], [296, 40]].forEach(function (b, i) { balon(g, b[0] + Math.sin(t + i) * .8, b[1] + Math.cos(t * 1.3 + i) * .8, 7, ["#ff5f8f", "#ffffff", "#ff8fb1", "#e83f6f", "#ffd166"][i], null, null, "hati"); });
    } });
    A.sprite.push({ y: 102, gambar: function (g, t) {
      bayangan(g, 37, 102, 24, 3); bulatIsi(g, 14, 86, 46, 12, 3, "#ffffff", true); kotak(g, 17, 98, 2, 4, "#d996ae"); kotak(g, 55, 98, 2, 4, "#d996ae");
      poligon(g, [[31, 90], [43, 90], [41, 80], [33, 80]], "#bfe3f2", true);
      for (var i = 0; i < 7; i++) { var bx = 37 + (i - 3) * 2.6, by = 76 + Math.abs(i - 3) * .8 - (i % 2) * 2.4; lingkaran(g, bx, by, 2.4, i % 3 ? "#e83f6f" : "#ff8fb1", .35); g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = .3; g.beginPath(); g.arc(bx, by, 1.2, 0, 4); g.stroke(); }
      [20, 54].forEach(function (cx, j) { kotak(g, cx - 1.2, 84, 2.4, 4, "#fff6ea"); nyala(g, cx, 84, t + j, { padam: false, angin: 0 }); });
    } });
    A.sprite.push({ y: 130, gambar: function (g, t) {
      var gerak = Math.sin(t * 3) * .4;
      bayangan(g, 130, 130, 26, 4);
      hadiahKotak(g, 112, 108 + gerak, 36, 22, "#ff5f8f", "#ffd166");
      kilau(g, 116, 112 + gerak, 2, .8); kilau(g, 146, 106 + Math.sin(t * 2), 1.6, .7 + Math.sin(t * 4) * .3);
    } });
    A.sprite.push({ y: 160, gambar: function (g) {
      var bx = 71, by = 156; bayangan(g, bx, by + 2, 6, 1.6);
      lingkaran(g, bx, by - 3, 6, "#c48a5a", true); lingkaran(g, bx, by - 10, 5, "#c48a5a", true); lingkaran(g, bx - 3.8, by - 14, 2, "#c48a5a", true); lingkaran(g, bx + 3.8, by - 14, 2, "#c48a5a", true);
      elips(g, bx, by - 8.6, 2.2, 1.5, "#f0d2b4"); lingkaran(g, bx - 1.8, by - 11, .6, "#2a1b12"); lingkaran(g, bx + 1.8, by - 11, .6, "#2a1b12"); lingkaran(g, bx, by - 9.2, .55, "#2a1b12");
      hati(g, bx, by - 3, 2.6, "#ff5f8f");
    } });
    A.sprite.push({ y: 184, gambar: function (g) {
      for (var y = 96; y < 184; y += 8) kotak(g, 253, y - 10, 1.6, 10, "#ffffff");
      bulatIsi(g, 250, 86, 6, 98, 2.5, "#b9758f", true); lingkaran(g, 253, 88, 3.2, "#d996ae", true);
    } });
    [[32, 168, 5, 2], [212, 168, 5, 6]].forEach(function (b) { A.sprite.push({ y: b[1], gambar: function (g, t) { kumpulanBalon(g, b[0], b[1], t, b[2], b[3], 34, true); } }); });
    A.tempat.push({ key: "kado", nama: "Kado untukmu", x: 100, y: 128, w: 60, h: 24, lx: 130, ly: 88 });
    if (fotoGaleri.length) A.tempat.push({ key: "galeri", nama: "Foto Kita", x: 62, y: 76, w: 116, h: 20, lx: 120, ly: 70 });
    A.pindah.push({ x: 262, y: 134, w: 40, h: 48, ke: "lantai1", pos: { x: 282, y: 184, arah: "bawah" }, teks: "Turun ke lantai 1" });
    return A;
  }

  /* =====================================================================
     PERMAINAN
     ===================================================================== */
  var ADEGAN = {}, adegan = null, cv, g, S = 3, R = 3, cam = { x: 0, y: 0 }, pemain = null, dia = null, jenisKu = "";
  var input = { x: 0, y: 0 }, kunci = {}, tahan = null, waktu = 0, sibuk = false, main = false, layarTerbuka = false;
  var kunjungan = {}, terakhir = null, kunciPindah = false, kotakLabel = [], sudahMasuk = false, kejutanSelesai = false, kueSelesai = false;
  var konfeti = [], asap = [], gelapRuang = 0, gelembung = null, suratDibaca = false, suratPohonDibaca = false;

  function prarender(A) {
    var M = A.M || 0, c = document.createElement("canvas"); c.width = Math.ceil((A.W + M * 2) * R); c.height = Math.ceil(A.H * R);
    var gg = c.getContext("2d"); gg.scale(R, R); gg.translate(M, 0); A.lantai(gg); A.gambarLantai = c;
    if (A.atas) {
      var a = document.createElement("canvas"); a.width = Math.ceil(A.atas.w * R); a.height = Math.ceil(A.atas.h * R);
      var ag = a.getContext("2d"); ag.scale(R, R); ag.translate(-A.atas.x, -A.atas.y); A.atas.gambar(ag); A.gambarAtas = a;
    }
  }
  function skala() { return Math.max(2, Math.min(innerWidth / (T * 10.5), innerHeight / (T * (adegan && adegan.tinggi || 15)))); }
  function ukur() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    S = skala() * dpr;
  }
  function solid(x, y) {
    if (x < 0 || y < 0 || x >= adegan.W || y >= adegan.H) return true;
    for (var i = 0; i < adegan.padat.length; i++) { var b = adegan.padat[i]; if (x >= b[0] && x < b[0] + b[2] && y >= b[1] && y < b[1] + b[3]) return true; }
    return false;
  }
  function bisaDi(x, y) { return !solid(x - 4, y - 3) && !solid(x + 4, y - 3) && !solid(x - 4, y + 1) && !solid(x + 4, y + 1); }
  function dalam(z, x, y) { return x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h; }
  function kamera() {
    var vw = cv.width / S, vh = cv.height / S;
    var x0 = adegan.W <= vw ? (adegan.W - vw) / 2 : Math.max(0, Math.min(adegan.W - vw, cam.x - vw / 2));
    var y0 = adegan.H <= vh ? (adegan.H - vh) / 2 : Math.max(0, Math.min(adegan.H - vh, cam.y - vh / 2));
    return { x0: x0, y0: y0, vw: vw, vh: vh };
  }
  function keDunia(cx, cy) { var k = kamera(), dpr = cv.width / innerWidth; return { x: k.x0 + cx * dpr / S, y: k.y0 + cy * dpr / S }; }

  function gerak(dt) {
    if (!pemain || layarTerbuka || sibuk || !main) { if (pemain) pemain.jalan = false; return; }
    var vx = input.x, vy = input.y;
    if (kunci.ArrowLeft || kunci.a) vx -= 1; if (kunci.ArrowRight || kunci.d) vx += 1; if (kunci.ArrowUp || kunci.w) vy -= 1; if (kunci.ArrowDown || kunci.s) vy += 1;
    if (!vx && !vy && tahan) {
      var w = keDunia(tahan.x, tahan.y), dx = w.x - pemain.x, dy = w.y - (pemain.y - 10), d = Math.hypot(dx, dy);
      if (d > 4) { vx = dx / d; vy = dy / d; if (d < 16) { vx *= d / 16; vy *= d / 16; } }
    }
    var len = Math.hypot(vx, vy);
    if (len > 1) { vx /= len; vy /= len; len = 1; }
    if (len > .08) {
      var cepat = 68 * dt, nx = pemain.x + vx * cepat, ny = pemain.y + vy * cepat;
      if (bisaDi(nx, pemain.y)) pemain.x = nx;
      if (bisaDi(pemain.x, ny)) pemain.y = ny;
      pemain.arah = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? "kanan" : "kiri") : (vy > 0 ? "bawah" : "atas");
      pemain.jalan = true; pemain.anim += dt * 8 * Math.min(1, len + .3);
      cekTempat(); cekPindah();
    } else pemain.jalan = false;
  }
  function tempatDekat() { var h = null; adegan.tempat.forEach(function (t) { if (dalam(t, pemain.x, pemain.y)) h = t; }); return h; }
  /* benda yang bisa diklik langsung (bagian luar): harus cukup dekat */
  function bendaDi(wx, wy) { var h = null; (adegan.benda || []).forEach(function (b) { if (wx >= b.x && wx <= b.x + b.w && wy >= b.y && wy <= b.y + b.h) h = b; }); return h; }
  function cukupDekat(b) { return pemain && Math.hypot(pemain.x - b.ax, pemain.y - b.ay) <= b.r; }
  function bendaDekat() { var h = null, d0 = 1e9; (adegan.benda || []).forEach(function (b) { var d = Math.hypot(pemain.x - b.ax, pemain.y - b.ay); if (d <= b.r && d < d0) { d0 = d; h = b; } }); return h; }
  function pakaiBenda(b) {
    if (sibuk || layarTerbuka) return;
    pemain.arah = arahKe(pemain, { x: b.x + b.w / 2, y: b.y + b.h / 2 });
    if (b.key === "pintu") masukRumah();
    else if (b.key === "pohon") { adegan.goyangPohon(); if (!D.suratPohon || adegan.suratPohon && adegan.suratPohon.diam) kabar("Daun-daunnya berguguran pelan…"); }
    else if (b.key === "surat") { if (!D.surat) { kabar("Kotak suratnya masih kosong."); return; } suratDibaca = true; bukaModal(ISI.surat(), "tempat-surat"); }
    else if (b.key === "suratPohon") { suratPohonDibaca = true; bukaModal(ISI.suratPohon(), "tempat-surat"); }
  }
  function cekTempat() {
    var t = tempatDekat(), key = t ? t.key : null;
    if (key === terakhir) return; terakhir = key;
    if (t && !kunjungan[key]) bukaTempat(key);
  }
  function cekPindah() {
    var z = null; adegan.pindah.forEach(function (p) { if (dalam(p, pemain.x, pemain.y)) z = p; });
    if (!z) { kunciPindah = false; return; }
    if (!kunciPindah) pindahAdegan(z.ke, z.pos, false);
  }
  function pindahAdegan(ke, pos, lama, lalu) {
    sibuk = true; tahan = null; input.x = input.y = 0; kunci = {};
    var tirai = document.getElementById("gelap");
    tirai.classList.toggle("cepat", !lama); tirai.querySelector("p").textContent = lama ? "…" : "";
    tirai.classList.add("on");
    setTimeout(function () {
      adegan = ADEGAN[ke]; pemain.x = pos.x; pemain.y = pos.y; pemain.arah = pos.arah; pemain.jalan = false;
      cam.x = pemain.x; cam.y = pemain.y - 12; kunciPindah = true; terakhir = null;
      if (adegan.setPintu) adegan.setPintu(0);
      ukur(); perbaruiHud();
      setTimeout(function () { tirai.classList.remove("on"); if (lalu) lalu(); else sibuk = false; }, lama ? 2600 : 120);
    }, lama ? 950 : 380);
  }
  function masukRumah() {
    if (sibuk || layarTerbuka) return;
    sibuk = true; pemain.arah = "atas";
    var mulai = performance.now();
    (function animPintu(t) {
      var p = Math.min(1, (t - mulai) / 700); ADEGAN.luar.setPintu(p);
      if (p < 1) { requestAnimationFrame(animPintu); return; }
      if (!sudahMasuk) { sudahMasuk = true; gelapRuang = .92; pindahAdegan("lantai1", { x: 160, y: 196, arah: "atas" }, true, kejutan); }
      else pindahAdegan("lantai1", { x: 160, y: 196, arah: "atas" }, false);
    })(mulai);
  }

  /* ---------- Kejutan saat masuk pertama kali ---------- */
  function jenisDia() { return jenisKu === "cowok" ? "cewek" : "cowok"; }
  function halaman(teks) { var h = String(teks || "").split(/\n\s*\n/).map(function (s) { return s.trim(); }).filter(Boolean); return h.length ? h : ["Selamat ulang tahun!"]; }
  function kejutan() {
    sibuk = true; dia.arah = "bawah";
    setTimeout(function () {
      gelapRuang = 0; dia.pose = "hore"; dia.mulut = "buka"; dia.mata = "senang";
      gelembung = { teks: "SURPRISE!!", sampai: waktu + 2.6 };
      semburKonfeti(dia.x, dia.y - 30, 110); semburKonfeti(60, 40, 50); semburKonfeti(220, 40, 50);
      pemain.mulut = "buka";
      setTimeout(function () {
        dia.pose = ""; dia.mulut = ""; dia.mata = ""; pemain.mulut = "";
        bicara(D.pengirim || "Si Dia", jenisDia(), halaman(D.pesanKejutan), function () {
          kejutanSelesai = true; sibuk = false; kabar("Sekarang datangi kuenya 🎂");
        });
      }, 2400);
    }, 900);
  }

  /* ---------- Dialog bergaya anime (kotak bawah dengan potret) ---------- */
  var dlg, dlgTeks, dlgNama, dlgPotret, dlgAntrian = null;
  function bicara(nama, jenis, daftar, selesai) {
    layarTerbuka = true; tahan = null; input.x = input.y = 0; kunci = {}; document.body.classList.add("sibuk");
    dlgNama.textContent = nama; potret(dlgPotret, jenis, { mata: "senang" }); dlg.hidden = false;
    dlgAntrian = { daftar: daftar.slice(), i: 0, huruf: 0, selesai: selesai, timer: null };
    tampilHalaman();
  }
  function tampilHalaman() {
    var q = dlgAntrian, teks = q.daftar[q.i] || ""; q.huruf = 0; clearInterval(q.timer);
    dlg.classList.remove("siap");
    q.timer = setInterval(function () { q.huruf += 2; dlgTeks.textContent = teks.slice(0, q.huruf); if (q.huruf >= teks.length) { clearInterval(q.timer); dlg.classList.add("siap"); } }, 28);
  }
  function lanjutDialog() {
    var q = dlgAntrian; if (!q) return;
    var teks = q.daftar[q.i] || "";
    if (q.huruf < teks.length) { q.huruf = teks.length; dlgTeks.textContent = teks; clearInterval(q.timer); dlg.classList.add("siap"); return; }
    q.i++;
    if (q.i < q.daftar.length) { tampilHalaman(); return; }
    dlg.hidden = true; dlgAntrian = null; layarTerbuka = false; document.body.classList.remove("sibuk"); if (q.selesai) q.selesai();
  }

  /* ---------- Adegan dekat: menulis wish, hitung mundur, tiup lilin ---------- */
  var cut = null;
  function adeganKue() {
    layarTerbuka = true; tahan = null; input.x = input.y = 0; kunci = {}; document.body.classList.add("sibuk");
    var contoh = D.harapan || "Semoga semua impianku terwujud";
    var w = el("div", "cutin", '<canvas class="cut-kanvas" width="720" height="720" aria-hidden="true"></canvas>' +
      '<div class="cut-atas">Make a wish…</div><div class="cut-angka" hidden></div>' +
      '<div class="cut-kartu" hidden><div class="cut-tulisan"></div></div>' +
      '<form class="cut-form"><label>Tulis harapanmu (rahasia, tidak dikirim ke mana-mana)</label><input maxlength="80" placeholder="' + esc(contoh) + '"><button class="tombol" type="submit">Tulis wish ✍️</button></form>');
    document.body.appendChild(w);
    cut = { el: w, kanvas: w.querySelector("canvas"), fase: "siap", tulis: 0, angin: 0, padam: false, pose: "", mata: "", mulut: "", kon: [] };
    var form = w.querySelector("form"), inp = form.querySelector("input");
    if (!SENTUH) setTimeout(function () { inp.focus({ preventScroll: true }); }, 200);
    form.addEventListener("submit", function (e) { e.preventDefault(); form.hidden = true; mulaiTulis(inp.value.trim() || contoh); });
  }
  function mulaiTulis(wish) {
    var w = cut.el, kartu = w.querySelector(".cut-kartu"), tulisan = w.querySelector(".cut-tulisan"), atas = w.querySelector(".cut-atas"), angka = w.querySelector(".cut-angka");
    cut.fase = "tulis"; cut.pose = "tulis"; cut.mata = "senang"; kartu.hidden = false; atas.textContent = "Menulis wish…";
    var i = 0, tm = setInterval(function () { i++; tulisan.textContent = wish.slice(0, i); cut.tulis = i / wish.length; if (i >= wish.length) { clearInterval(tm); setTimeout(doa, 900); } }, 70);
    function doa() { kartu.classList.add("lipat"); cut.fase = "doa"; cut.pose = "doa"; cut.mata = "pejam"; atas.textContent = "Pejamkan mata… 🙏"; setTimeout(function () { hitung(3); }, 1700); }
    function letup(teks, kelas) { angka.hidden = false; angka.textContent = teks; angka.className = "cut-angka " + (kelas || ""); void angka.offsetWidth; angka.classList.add("pop"); }
    function hitung(n) {
      cut.pose = ""; cut.mata = ""; atas.textContent = "Siap tiup lilin!"; letup(n);
      setTimeout(function () { if (n > 1) hitung(n - 1); else tiup(); }, 950);
    }
    function tiup() {
      letup("Fuuuh~", "kecil"); cut.fase = "tiup"; cut.mulut = "tiup"; atas.textContent = "";
      var t0 = waktu;
      (function hembus() { cut.angin = Math.min(1, (waktu - t0) / .9); if (cut.angin < 1) requestAnimationFrame(hembus); else padam(); })();
    }
    function padam() {
      cut.padam = true; KUE.padam = true; cut.mulut = "buka"; cut.mata = "senang"; cut.pose = "hore";
      for (var j = 0; j < 4; j++) asap.push({ x: 130 + (j - 1.5) * 6, y: 86, umur: 2.2, p: j, adegan: "lantai1" });
      letup("Selamat Ulang Tahun!", "judul");
      for (var k = 0; k < 120; k++) cut.kon.push({ x: 50, y: 40, vx: (Math.random() - .5) * 120, vy: -40 - Math.random() * 60, r: Math.random() * 6, w: WARNA[k % 6], umur: 3 });
      setTimeout(function () {
        w.classList.add("tutup");
        setTimeout(function () {
          w.remove(); cut = null; layarTerbuka = false; kueSelesai = true; document.body.classList.remove("sibuk");
          dia.pose = "hore"; dia.mata = "senang"; semburKonfeti(130, 80, 140);
          setTimeout(function () { dia.pose = ""; bicara(D.pengirim || "Si Dia", jenisDia(), halaman(D.pesanSetelahTiup || "Yeay! Semoga semua harapanmu terkabul ya.\n\nMasih ada kejutan di lantai 2, coba naik tangganya!"), function () { dia.mata = ""; }); }, 900);
        }, 500);
      }, 2800);
    }
  }
  function gambarCut(dt) {
    if (!cut) return;
    var c = cut.kanvas, k = c.getContext("2d"), s = c.width / 100;
    k.setTransform(s, 0, 0, s, 0, 0);
    var gr = k.createRadialGradient(50, 40, 5, 50, 50, 75); gr.addColorStop(0, cut.padam ? "#5a3a58" : "#8a4a52"); gr.addColorStop(1, "#1d1220"); k.fillStyle = gr; k.fillRect(0, 0, 100, 100);
    for (var b = 0; b < 14; b++) cahaya(k, acak(b, 1) * 100, acak(1, b) * 70, 6 + acak(b, 2) * 8, b % 2 ? "255,190,210" : "255,226,150", .18 + Math.sin(waktu + b) * .05);
    if (!cut.padam) cahaya(k, 70, 60, 40, "255,190,110", .3);
    // meja
    elips(k, 50, 104, 60, 14, "#fff2f6"); kotak(k, -10, 104, 120, 10, "#fff2f6"); for (var m = 0; m < 14; m++) elips(k, m * 8 - 2, 104 + (m % 2), 3, 2, "#ff8fb1");
    k.save(); k.translate(33, 104); k.scale(2.5, 2.5);
    gambarOrang(k, { jenis: jenisKu, arah: "bawah", pose: cut.pose, mata: cut.mata, mulut: cut.mulut, tulis: cut.tulis, tanpaBayangan: true }, 0, 0, waktu);
    k.restore();
    elips(k, 50, 106, 62, 9, "rgba(255,240,246,.95)");
    if (cut.fase === "tiup" && !cut.padam) { k.strokeStyle = "rgba(255,255,255,.85)"; k.lineWidth = .9; k.lineCap = "round"; for (var a = 0; a < 3; a++) { var o = (waktu * 1.8 + a * .33) % 1; k.beginPath(); k.moveTo(40 + o * 18, 62 + (a - 1) * 3); k.quadraticCurveTo(46 + o * 18, 60 + (a - 1) * 3.5, 50 + o * 18, 62 + (a - 1) * 4); k.stroke(); } }
    k.save(); k.translate(70, 104); k.scale(1.12, 1.12); kue(k, 0, 0, waktu, { padam: cut.padam, angin: cut.angin }); k.restore();
    if (cut.padam) for (var j = 0; j < 3; j++) { var u = (waktu * .6 + j * .33) % 1; lingkaran(k, 70 + (j - 1) * 7 + Math.sin(waktu * 2 + j) * 2, 50 - u * 28, 1.6 + u * 3.6, "rgba(230,230,240," + (.5 * (1 - u)) + ")"); }
    cut.kon = cut.kon.filter(function (p) { return p.umur > 0; });
    cut.kon.forEach(function (p) { p.umur -= dt; p.vy += 70 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 6; k.save(); k.translate(p.x, p.y); k.rotate(p.r); kotak(k, -1, -.5, 2, 1, p.w); k.restore(); });
  }

  /* ---------- konfeti, asap, kabar ---------- */
  function semburKonfeti(x, y, n) { for (var i = 0; i < n; i++) konfeti.push({ x: x + (Math.random() - .5) * 30, y: y, vx: (Math.random() - .5) * 150, vy: -60 - Math.random() * 120, r: Math.random() * 6, vr: (Math.random() - .5) * 10, w: WARNA[i % 6], umur: 2.6 + Math.random() * 1.5, adegan: adegan.id }); }
  function efekPartikel(g, dt) {
    konfeti = konfeti.filter(function (k) { return k.umur > 0; });
    konfeti.forEach(function (k) { k.umur -= dt; if (k.adegan !== adegan.id) return; if (k.y > adegan.H - 4) { k.umur = 0; return; } k.vy += 160 * dt; k.vx *= .98; k.x += k.vx * dt; k.y += k.vy * dt; k.r += k.vr * dt; g.save(); g.translate(k.x, k.y); g.rotate(k.r); g.globalAlpha = Math.min(1, k.umur); kotak(g, -1.5, -.75, 3, 1.5, k.w); g.restore(); });
    asap = asap.filter(function (a) { return a.umur > 0; });
    asap.forEach(function (a) { a.umur -= dt; if (a.adegan !== adegan.id) return; a.y -= 10 * dt; a.x += Math.sin(waktu * 3 + a.p) * 4 * dt; lingkaran(g, a.x, a.y, 1.2 + (2.2 - a.umur) * 1.5, "rgba(225,225,232," + Math.max(0, a.umur / 2.2 * .55) + ")"); });
  }
  var timerKabar;
  function kabar(teks) {
    var lama = document.querySelector(".toast"); if (lama) lama.remove();
    var t = el("div", "toast", esc(teks)); document.body.appendChild(t);
    clearTimeout(timerKabar); timerKabar = setTimeout(function () { t.remove(); }, 3600);
  }

  /* ---------- gambar dunia ---------- */
  function gambar(dt) {
    if (pemain) {
      var ty = pemain.y - 12;
      if (adegan.id === "luar") ty = pemain.y - 44;
      cam.x += (pemain.x - cam.x) * .12; cam.y += (ty - cam.y) * .1;
    }
    var k = kamera(), x0 = k.x0, y0 = k.y0;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = adegan.latar; g.fillRect(0, 0, cv.width, cv.height);
    g.setTransform(S, 0, 0, S, -x0 * S, -y0 * S);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
    var M = adegan.M || 0; g.drawImage(adegan.gambarLantai, -M, 0, adegan.W + M * 2, adegan.H);
    var daftar = adegan.sprite.slice();
    if (adegan.id === "lantai1" && dia) daftar.push({ y: dia.y, gambar: function (gg, t) { gambarOrang(gg, dia, dia.x, dia.y, t); } });
    if (pemain) daftar.push({ y: pemain.y + .01, gambar: function (gg, t) { gambarOrang(gg, pemain, pemain.x, pemain.y, t); } });
    daftar.sort(function (a, b) { return a.y - b.y; });
    daftar.forEach(function (s) { s.gambar(g, waktu); });
    if (adegan.efek) adegan.efek(g, waktu, dt);
    efekPartikel(g, dt);
    if (adegan.id === "lantai1" && gelapRuang > 0) { g.fillStyle = "rgba(8,4,12," + gelapRuang + ")"; g.fillRect(x0, y0, k.vw, k.vh); }
    if (gelembung && waktu < gelembung.sampai && adegan.id === "lantai1") {
      var sk = Math.min(1, (waktu - gelembung.sampai + 2.6) * 6);
      g.save(); g.translate(dia.x, dia.y - 44); g.scale(sk, sk); g.rotate(Math.sin(waktu * 12) * .03);
      var pts = []; for (var i = 0; i < 18; i++) { var a = i / 18 * 6.283, r = i % 2 ? 15 : 21; pts.push([Math.cos(a) * r * 1.6, Math.sin(a) * r * .7]); }
      poligon(g, pts, "#fff36b", .8); g.font = "700 11px Fredoka, Nunito, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
      g.lineWidth = 2.4; g.strokeStyle = "#ffffff"; g.strokeText(gelembung.teks, 0, .5); g.fillStyle = "#e8385f"; g.fillText(gelembung.teks, 0, .5);
      g.restore();
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    kotakLabel = [];
    if (!main) return;
    var px = Math.round(Math.max(14 * (cv.width / innerWidth), S * 4.4)), dekat = pemain ? tempatDekat() : null;
    g.font = "600 " + px + "px Fredoka, Nunito, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    adegan.tempat.forEach(function (tp) {
      if (adegan.id === "lantai1" && !kejutanSelesai) return;
      var sudah = kunjungan[tp.key], disini = dekat === tp;
      var sx = (tp.lx - x0) * S, sy = (tp.ly - y0) * S + (sudah && !disini ? 0 : Math.sin(waktu * 3 + tp.lx) * S * .9);
      var teks = tp.nama, tw = g.measureText(teks).width, ik = sudah ? px * 1.05 : 0, w = tw + ik + px * 1.6, h = px * 2;
      var x = sx - w / 2, y = sy - h / 2, warna = "#e85d8f";
      g.shadowColor = "rgba(0,0,0,.28)"; g.shadowBlur = px * .6; g.shadowOffsetY = px * .18;
      g.fillStyle = sudah ? "#fffaf5" : warna; jalurBulat(g, x, y, w, h, h / 2); g.fill();
      g.shadowColor = "transparent"; g.shadowBlur = 0; g.shadowOffsetY = 0;
      g.lineWidth = Math.max(2, px * .16); g.strokeStyle = sudah ? warna : "rgba(255,250,245,.9)"; jalurBulat(g, x + g.lineWidth / 2, y + g.lineWidth / 2, w - g.lineWidth, h - g.lineWidth, h / 2); g.stroke();
      if (!sudah) poligon(g, [[sx - px * .45, y + h - 1], [sx + px * .45, y + h - 1], [sx, y + h + px * .55]], warna);
      else { var cx = x + px * .8 + ik / 2; lingkaran(g, cx, sy, ik * .45, warna); g.strokeStyle = "#fffaf5"; g.lineWidth = Math.max(1.5, px * .13); g.beginPath(); g.moveTo(cx - ik * .2, sy); g.lineTo(cx - ik * .04, sy + ik * .17); g.lineTo(cx + ik * .22, sy - ik * .17); g.stroke(); }
      g.fillStyle = sudah ? warna : "#fffaf5"; g.fillText(teks, sx + ik / 2, sy + px * .06);
      if (disini && sudah && !layarTerbuka) { g.font = "500 " + Math.round(px * .78) + "px Fredoka, Nunito, sans-serif"; g.fillStyle = "rgba(255,250,245,.95)"; g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = px * .4; g.fillText("ketuk untuk membuka", sx, y - px * .7); g.shadowColor = "transparent"; g.shadowBlur = 0; g.font = "600 " + px + "px Fredoka, Nunito, sans-serif"; }
      kotakLabel.push({ tp: tp, x: x, y: y, w: w, h: h });
    });
    adegan.pindah.forEach(function (p) {
      if (!p.teks || !pemain || Math.hypot(pemain.x - (p.x + p.w / 2), pemain.y - (p.y + p.h / 2)) > 46) return;
      var sx = (p.x + p.w / 2 - x0) * S, sy = (p.y + (p.y < 110 ? -4 : p.h + 8) - y0) * S;
      g.font = "500 " + Math.round(px * .8) + "px Fredoka, Nunito, sans-serif"; g.fillStyle = "#fffaf5"; g.shadowColor = "rgba(0,0,0,.7)"; g.shadowBlur = px * .5; g.fillText(p.teks, sx, sy); g.shadowColor = "transparent"; g.shadowBlur = 0;
    });
  }
  var lalu = 0;
  function putar(t) {
    var dt = Math.min(.05, (t - lalu) / 1000 || 0); lalu = t; waktu += dt;
    gerak(dt); gambar(dt); gambarCut(dt);
    requestAnimationFrame(putar);
  }

  /* ---------- jendela (modal) ---------- */
  var modal, panel, isi, tutupBtn, aksiTutup = null;
  function bukaModal(html, kelas, saatTutup) {
    isi.innerHTML = ""; panel.className = "panel " + (kelas || "");
    if (typeof html === "string") isi.innerHTML = html; else isi.appendChild(html);
    isi.scrollTop = 0; modal.hidden = false; layarTerbuka = true; input.x = input.y = 0; tahan = null; kunci = {}; aksiTutup = saatTutup || null;
    setTimeout(function () { var f = panel.classList.contains("wajib") ? isi.querySelector("button") : tutupBtn; if (f) f.focus({ preventScroll: true }); }, 60);
  }
  function tutupModal() {
    if (modal.hidden) return;
    modal.hidden = true; layarTerbuka = false;
    var a = aksiTutup; aksiTutup = null; if (a) a();
  }
  function arahKe(a, b) { var dx = b.x - a.x, dy = b.y - a.y; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "kanan" : "kiri") : (dy > 0 ? "bawah" : "atas"); }
  function bukaTempat(key) {
    if (adegan.id === "lantai1" && !kejutanSelesai) return;
    kunjungan[key] = true;
    if (key === "kue") { if (!kueSelesai) adeganKue(); else bicara(D.nama || "", jenisKu, ["Lilinnya sudah kutiup dan wish-ku sudah kutulis. Semoga terkabul! 🎂"], null); return; }
    if (key === "dia") { dia.arah = arahKe(dia, pemain); bicara(D.pengirim || "Si Dia", jenisDia(), halaman(D.pesanKejutan), function () { dia.arah = "bawah"; }); return; }
    bukaModal(ISI[key](), "tempat-" + key);
  }
  var ISI = {
    surat: function () {
      return '<div class="surat"><div class="perangko">♥</div><div class="kicker">Untuk ' + esc(D.nama || "kamu") + '</div>' + paragraf(D.surat) +
        (D.pengirim ? '<div class="ttd">— ' + esc(D.pengirim) + '</div>' : '') + '</div>';
    },
    suratPohon: function () {
      return '<div class="surat surat-pohon"><div class="perangko">🍃</div><div class="kicker">Jatuh dari pohon</div>' + paragraf(D.suratPohon) +
        (D.pengirim ? '<div class="ttd">— ' + esc(D.pengirim) + '</div>' : '') + '</div>';
    },
    kado: function () {
      var w = el("div");
      w.innerHTML = '<div class="kicker">Kado untukmu</div><h2>Untuk ' + esc(D.nama || "kamu") + ' 🎁</h2>' +
        '<div class="surat">' + paragraf(D.pesanAkhir || "Selamat ulang tahun!") + (D.pengirim ? '<div class="ttd">— ' + esc(D.pengirim) + '</div>' : '') + '</div>' +
        ((D.galeri || []).length ? '<div class="galeri">' + D.galeri.map(function (s) { return '<img loading="lazy" alt="" src="' + esc(s) + '">'; }).join("") + '</div>' : '');
      pasangGaleri(w); setTimeout(function () { semburKonfeti(130, 100, 80); }, 100);
      return w;
    },
    galeri: function () {
      var w = el("div"); w.innerHTML = '<div class="kicker">Kenangan kita</div><h2>Foto Kita 📸</h2><div class="galeri">' + (D.galeri || []).map(function (s) { return '<img loading="lazy" alt="" src="' + esc(s) + '">'; }).join("") + '</div>';
      pasangGaleri(w); return w;
    }
  };
  function pasangGaleri(w) {
    w.querySelectorAll(".galeri img").forEach(function (im) { im.addEventListener("click", function () { var v = el("div", "lihat-foto", '<img alt="" src="' + esc(im.getAttribute("src")) + '">'); v.addEventListener("click", function () { v.remove(); }); document.body.appendChild(v); }); });
  }

  /* ---------- alur awal ---------- */
  function pilihTokoh() {
    if (D.jenis === "cowok" || D.jenis === "cewek") { jenisKu = D.jenis; mulaiMain(); return; }
    var w = el("div", null, '<div class="kicker">Yang berulang tahun</div><h2>Pilih tokohmu</h2><div class="pilih-tokoh"></div>');
    [["cowok", "Cowok"], ["cewek", "Cewek"]].forEach(function (p) {
      var b = el("button", "kartu-tokoh", '<canvas width="216" height="288"></canvas><span>' + p[1] + '</span>'); b.type = "button";
      potret(b.querySelector("canvas"), p[0], { penuh: true });
      b.addEventListener("click", function () { jenisKu = p[0]; tutupModal(); });
      w.querySelector(".pilih-tokoh").appendChild(b);
    });
    bukaModal(w, "wajib", function () { if (!jenisKu) jenisKu = "cewek"; mulaiMain(); });
  }
  function mulaiMain() {
    var aw = ADEGAN.luar.awal;
    pemain = { x: aw.x, y: aw.y, arah: aw.arah, jalan: false, anim: 0, jenis: jenisKu };
    dia = { x: 178, y: 152, arah: "bawah", jalan: false, anim: 0, jenis: jenisDia() };
    potret(document.getElementById("avatar"), jenisKu);
    main = true; document.body.classList.add("main"); perbaruiHud();
    petunjuk.hidden = false; setTimeout(function () { petunjuk.hidden = true; }, 6000);
    cam.x = aw.x; cam.y = aw.y - 44;
    kabar("Selamat bermain! Jelajahi sekitar rumah, klik apa saja yang menarik perhatianmu.");
  }
  function perbaruiHud() { var s = document.getElementById("hudSisa"); if (s && adegan) s.textContent = adegan.lokasi; }

  var petunjuk;
  function pasangKontrol() {
    var joy = el("div", "joy", '<div class="knob"></div>'), knob = joy.firstChild, aktif = null;
    document.body.appendChild(joy);
    petunjuk = el("div", "petunjuk", SENTUH ? "Tahan jarimu di layar ke arah tujuan, atau geser lingkaran ini" : "Tahan klik ke arah tujuan, atau pakai tombol panah"); petunjuk.hidden = true; document.body.appendChild(petunjuk);
    function gerakJoy(e) {
      var r = joy.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = e.clientX - cx, dy = e.clientY - cy, max = r.width * .38, d = Math.hypot(dx, dy);
      if (d > max) { dx = dx / d * max; dy = dy / d * max; }
      knob.style.transform = "translate(" + dx + "px," + dy + "px)";
      input.x = Math.abs(dx) > 4 ? dx / max : 0; input.y = Math.abs(dy) > 4 ? dy / max : 0;
    }
    joy.addEventListener("pointerdown", function (e) { aktif = e.pointerId; joy.setPointerCapture(e.pointerId); petunjuk.hidden = true; gerakJoy(e); e.preventDefault(); });
    joy.addEventListener("pointermove", function (e) { if (e.pointerId === aktif) gerakJoy(e); });
    function lepas(e) { if (e.pointerId !== aktif) return; aktif = null; input.x = input.y = 0; knob.style.transform = ""; }
    joy.addEventListener("pointerup", lepas); joy.addEventListener("pointercancel", lepas);
    cv.addEventListener("pointerdown", function (e) {
      if (!pemain || layarTerbuka || !main) return;
      var dp = cv.width / innerWidth, px = e.clientX * dp, py = e.clientY * dp, kena = null;
      kotakLabel.forEach(function (k) { if (px >= k.x - 6 && px <= k.x + k.w + 6 && py >= k.y - 6 && py <= k.y + k.h + 6) kena = k.tp; });
      if (kena && tempatDekat() === kena) { bukaTempat(kena.key); return; }
      var wd = keDunia(e.clientX, e.clientY), bd = bendaDi(wd.x, wd.y);
      if (bd && cukupDekat(bd)) { pakaiBenda(bd); return; }
      petunjuk.hidden = true;
      tahan = { id: e.pointerId, x: e.clientX, y: e.clientY }; try { cv.setPointerCapture(e.pointerId); } catch (er) {}
    });
    cv.addEventListener("pointermove", function (e) {
      if (tahan && e.pointerId === tahan.id) { tahan.x = e.clientX; tahan.y = e.clientY; return; }
      if (e.pointerType === "mouse" && main) { var w = keDunia(e.clientX, e.clientY), b = bendaDi(w.x, w.y); cv.style.cursor = b && cukupDekat(b) ? "pointer" : ""; }
    });
    function lepasTahan(e) { if (tahan && e.pointerId === tahan.id) tahan = null; }
    cv.addEventListener("pointerup", lepasTahan); cv.addEventListener("pointercancel", lepasTahan); cv.addEventListener("lostpointercapture", lepasTahan);
    dlg.addEventListener("click", lanjutDialog);
    addEventListener("keydown", function (e) {
      var tag = (e.target || {}).tagName || "";
      if (!dlg.hidden && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); lanjutDialog(); return; }
      if (e.key === "Escape" && !modal.hidden && !panel.classList.contains("wajib")) { tutupModal(); return; }
      if (layarTerbuka || /^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
      if ((e.key === "Enter" || e.key === " ") && pemain && main && !/^(BUTTON|A)$/.test(tag)) {
        var bd = bendaDekat(); if (bd) { e.preventDefault(); pakaiBenda(bd); return; }
        var t = tempatDekat(); if (t) { e.preventDefault(); bukaTempat(t.key); return; }
      }
      var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (/^Arrow|^[wasd]$/.test(k)) { kunci[k] = true; e.preventDefault(); }
    });
    addEventListener("keyup", function (e) { var k = e.key.length === 1 ? e.key.toLowerCase() : e.key; kunci[k] = false; });
    addEventListener("blur", function () { kunci = {}; tahan = null; });
  }

  function mulai() {
    document.title = "Selamat Ulang Tahun " + (D.nama || "");
    cv = el("canvas", "dunia"); cv.setAttribute("role", "img"); cv.setAttribute("aria-label", "Halaman rumah dan pesta kejutan ulang tahun " + (D.nama || ""));
    document.body.appendChild(cv); g = cv.getContext("2d");
    R = Math.max(3, Math.min(4, Math.ceil(skala() * Math.min(window.devicePixelRatio || 1, 2))));
    ADEGAN.luar = buatLuar(); ADEGAN.lantai1 = buatLantai1(); ADEGAN.lantai2 = buatLantai2();
    Object.keys(ADEGAN).forEach(function (k) { prarender(ADEGAN[k]); });
    adegan = ADEGAN.luar; cam.x = 300; cam.y = 330;
    ukur(); addEventListener("resize", ukur);

    document.body.appendChild(el("div", "hud", '<canvas id="avatar" width="96" height="96" aria-hidden="true"></canvas><div class="hud-judul"><b>Happy Birthday, ' + esc(D.nama) + '!</b><small id="hudSisa"></small></div>'));
    if (D.musik) {
      var audio = new Audio(D.musik); audio.loop = true;
      var mb = el("button", "musik", '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>'); mb.type = "button"; mb.setAttribute("aria-label", "Musik");
      mb.addEventListener("click", function () { if (audio.paused) { audio.play(); mb.classList.remove("mati"); } else { audio.pause(); mb.classList.add("mati"); } });
      document.body.appendChild(mb); window.__musik = function () { audio.play().catch(function () { mb.classList.add("mati"); }); };
    }
    modal = el("div", "modal", '<div class="panel" role="dialog" aria-modal="true"><button type="button" class="tutup" aria-label="Tutup">&times;</button><div class="isi"></div></div>');
    modal.hidden = true; document.body.appendChild(modal);
    panel = modal.firstChild; isi = panel.querySelector(".isi"); tutupBtn = panel.querySelector(".tutup");
    tutupBtn.addEventListener("click", tutupModal);
    modal.addEventListener("click", function (e) { if (e.target === modal && !panel.classList.contains("wajib")) tutupModal(); });
    dlg = el("div", "dialog", '<canvas width="160" height="160" aria-hidden="true"></canvas><div class="dialog-isi"><b></b><p></p><span class="lanjut">▼</span></div>');
    dlg.hidden = true; document.body.appendChild(dlg); dlgPotret = dlg.querySelector("canvas"); dlgNama = dlg.querySelector("b"); dlgTeks = dlg.querySelector("p");
    document.body.appendChild(el("div", "gelap", "<p></p>")).id = "gelap";
    pasangKontrol();

    var sampul = el("div", "sampul",
      '<div class="kartu-sampul"><div class="kecil">Untuk ' + esc(D.nama || "kamu") + '</div><div class="nama">Selamat bermain!</div>' +
      '<p class="ajak">Berjalanlah ke rumah itu. Klik apa saja yang menarik perhatianmu.</p></div>' +
      '<button type="button" class="tombol" id="bukaUndangan">Mulai</button>');
    document.body.appendChild(sampul);
    sampul.querySelector("#bukaUndangan").addEventListener("click", function () {
      sampul.classList.add("buka"); if (window.__musik) window.__musik();
      setTimeout(function () { sampul.remove(); pilihTokoh(); }, 700);
    });
    requestAnimationFrame(putar);
    // untuk pengujian otomatis
    window.__ultah = { pemain: function () { return pemain; }, adegan: function () { return adegan.id; }, ke: function (id, x, y) { pindahAdegan(id, { x: x, y: y, arah: "atas" }, false); }, status: function () { return { kejutan: kejutanSelesai, kue: kueSelesai, dialog: !dlg.hidden, modal: !modal.hidden }; }, keLayar: function (x, y) { var k = kamera(), dp = cv.width / innerWidth; return { x: (x - k.x0) * S / dp, y: (y - k.y0) * S / dp }; } };
  }
  function siap() {
    var jalan = false; function go() { if (!jalan) { jalan = true; mulai(); } }
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load("700 20px Fredoka"), document.fonts.load("600 20px Fredoka")]).then(go, go);
    setTimeout(go, 2500);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", siap); else siap();
})();
