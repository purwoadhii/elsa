/* ===== Kejutan ulang tahun "Jalan-jalan ke Rumah" (gaya anime) =====
   Yang berulang tahun (tokoh cowok atau cewek) berjalan melewati halaman rumput & bunga ke rumah.
   Kotak surat di depan rumah berisi surat yang diketik lewat admin/. Di pintu ada tombol Open:
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
     TOKOH ANIME (chibi). Kaki di (0,0), tinggi sekitar 30.
     o: {jenis: "cowok"|"cewek", arah: bawah|atas|kiri|kanan, jalan, anim, pose, mata, mulut}
     ===================================================================== */
  var GAYA = {
    cowok: { kulit: "#ffe0c8", rambut: "#3b2a3a", iris: "#4a6fb5", baju: "#ffffff", baju2: "#dfe6f2", jaket: "#4c6fae", jaket2: "#3c5a93", celana: "#3a3f58", sepatu: "#f1f1f1", tali: "#d04f6a" },
    cewek: { kulit: "#ffe3cf", rambut: "#7a4a3a", iris: "#b0507a", baju: "#ffb3cf", kerah: "#ffffff", sepatu: "#e0607e", pita: "#ff5f8f" }
  };
  function pita(g, x, y, s, warna, sudut) {
    g.save(); g.translate(x, y); g.rotate(sudut || 0);
    poligon(g, [[0, 0], [-3.2 * s, -1.9 * s], [-3.2 * s, 1.9 * s]], warna, true); poligon(g, [[0, 0], [3.2 * s, -1.9 * s], [3.2 * s, 1.9 * s]], warna, true); lingkaran(g, 0, 0, .9 * s, warna, true);
    g.restore();
  }
  function gambarOrang(g, o, x, y, t) {
    var P = GAYA[o.jenis], cewek = o.jenis === "cewek", sk = o.skala || 1;
    var ay = o.jalan ? Math.sin(o.anim * 1.25) : 0, naik = o.jalan ? Math.abs(Math.sin(o.anim * 1.25)) * .8 : Math.sin(t * 2.2 + x) * .18;
    var samping = o.arah === "kiri" || o.arah === "kanan", belakang = o.arah === "atas", depan = !samping && !belakang;
    var pose = o.pose || "";
    if (!o.tanpaBayangan) bayangan(g, x, y, 6 * sk, 2 * sk);
    g.save(); g.translate(x, y - naik * sk); g.scale(sk, sk);
    if (o.arah === "kiri") g.scale(-1, 1);
    var hy = -21, hr = 7.4;

    // rambut panjang (cewek) di belakang badan
    if (cewek && !belakang) {
      var gs = samping ? -2.5 : 0, lb = samping ? 6.5 : 8.6;
      g.beginPath(); g.moveTo(-lb + gs, hy); g.quadraticCurveTo(-lb - 1.2 + gs, -8, -lb + 1.2 + gs, -6.4 + Math.sin(t * 2) * .3);
      g.lineTo(lb - 1.2 + gs, -6.4 + Math.cos(t * 2) * .3); g.quadraticCurveTo(lb + 1.2 + gs, -8, lb + gs, hy); g.closePath();
      g.fillStyle = P.rambut; g.fill(); garis(g);
    }
    // kaki
    var kakiY = -5.8, warnaKaki = cewek ? P.kulit : P.celana;
    if (samping) {
      [-1.2 - ay * 2, 1.2 + ay * 2].forEach(function (kx) { bulatIsi(g, kx - 1.3, kakiY, 2.6, 5.4, 1.1, warnaKaki, true); bulatIsi(g, kx - 1.4, -1.6, 3.6, 1.9, .9, P.sepatu, true); });
    } else {
      [[-1.9, Math.max(0, ay)], [1.9, Math.max(0, -ay)]].forEach(function (k) { bulatIsi(g, k[0] - 1.3, kakiY - k[1], 2.6, 5.4, 1.1, warnaKaki, true); bulatIsi(g, k[0] - 1.6, -1.8 - k[1], 3.2, 2, .9, P.sepatu, true); });
    }
    // badan
    var bw = samping ? 7 : 9.4, by0 = -14.2, by1 = -5.6;
    if (cewek) {
      g.beginPath(); g.moveTo(-bw / 2 + 1, by0); g.lineTo(bw / 2 - 1, by0); g.lineTo(bw / 2 + 1.6, by1 + .3); g.quadraticCurveTo(0, by1 + 1.6, -bw / 2 - 1.6, by1 + .3); g.closePath();
      g.fillStyle = P.baju; g.fill(); garis(g);
      g.save(); g.clip(); kotak(g, 1.2, by0, 8, 12, "rgba(200,60,110,.18)"); kotak(g, -8, by1 - 1.3, 16, .9, "#ffffff"); g.restore();
      if (!belakang) { poligon(g, [[-2.6, by0], [0, by0 + 2.2], [2.6, by0]], P.kerah, true); hati(g, 0, by0 + 3.3, .9, P.pita); }
      else elips(g, 0, by0 + 3.8, 2.4, 1.2, P.pita);
    } else {
      bulatIsi(g, -bw / 2, by0, bw, by1 - by0 + .4, 2, P.jaket, true);
      g.save(); jalurBulat(g, -bw / 2, by0, bw, by1 - by0 + .4, 2); g.clip(); kotak(g, 1.5, by0, 6, 10, P.jaket2);
      if (depan) { kotak(g, -1.8, by0, 3.6, 9, P.baju); kotak(g, -1.8, by0, 1, 9, P.baju2); poligon(g, [[-.5, by0 + .6], [.5, by0 + .6], [.9, by0 + 4.6], [0, by0 + 5.6], [-.9, by0 + 4.6]], P.tali); }
      else if (samping) kotak(g, 1.4, by0, 1.6, 9, P.baju);
      g.restore();
    }
    // lengan
    function lengan(lx, ly, sudut, panjang) {
      g.save(); g.translate(lx, ly); g.rotate(sudut || 0);
      bulatIsi(g, -1.2, 0, 2.4, panjang || 5.4, 1.2, cewek ? P.baju : P.jaket, true);
      lingkaran(g, 0, (panjang || 5.4) + .3, 1.25, P.kulit, true); g.restore();
    }
    var bahu = by0 + .8, sw = o.jalan ? ay * .5 : 0;
    if (samping) lengan(0, bahu, -sw, 5.2);
    else if (pose === "hore") { lengan(-bw / 2, bahu, 2.5 + Math.sin(t * 10) * .15, 5.4); lengan(bw / 2, bahu, -2.5 - Math.sin(t * 10) * .15, 5.4); }
    else if (pose === "doa") { lengan(-bw / 2 + .2, bahu, -.75, 4.4); lengan(bw / 2 - .2, bahu, .75, 4.4); }
    else if (pose === "tulis") { lengan(-bw / 2 + .2, bahu, -.9, 4.6); lengan(bw / 2 - .2, bahu, .55 + Math.sin(t * 16) * .12, 4.6); }
    else { lengan(-bw / 2 - .5, bahu, .12 + sw, 5.4); lengan(bw / 2 + .5, bahu, -.12 - sw, 5.4); }
    // kertas & pena saat menulis wish
    if (pose === "tulis" && depan) {
      g.save(); g.translate(0, -9.6); g.rotate(-.08); bulatIsi(g, -3.4, -2.2, 6.8, 4.4, .5, "#fffaf0", true);
      for (var li = 0; li < 3; li++) kotak(g, -2.6, -1.2 + li * 1.2, Math.min(5.2, Math.max(0, (o.tulis || 0) * 16 - li * 5.2)), .35, "#d0607e");
      g.restore();
      g.save(); g.translate(1.6 + Math.sin(t * 16) * 1.2, -11); g.rotate(.5); kotak(g, -.35, -3, .7, 3.6, "#ffd166"); kotak(g, -.35, .6, .7, .6, "#3a2a20"); g.restore();
    }

    // kepala & wajah
    lingkaran(g, 0, hy, hr, P.kulit, true);
    if (o.mulut === "tiup" && depan) { lingkaran(g, -4.4, hy + 3.2, 2.5, P.kulit); lingkaran(g, 4.4, hy + 3.2, 2.5, P.kulit); }
    if (!belakang) {
      var mataX = samping ? [3.6] : [-2.9, 2.9], my = hy + 1.4;
      mataX.forEach(function (ex) {
        if (o.mata === "pejam" || o.mata === "senang") {
          g.beginPath(); if (o.mata === "senang") g.arc(ex, my + .8, 1.4, Math.PI * 1.15, Math.PI * 1.85); else g.arc(ex, my - .4, 1.4, Math.PI * .15, Math.PI * .85);
          g.strokeStyle = "#2a1820"; g.lineWidth = .65; g.lineCap = "round"; g.stroke();
        } else {
          var kedip = (Math.sin(t * 1.3 + (cewek ? 1 : 0)) > .985) ? .15 : 1;
          elips(g, ex, my, samping ? 1.2 : 1.55, 2.05 * kedip, "#ffffff");
          var gr = g.createLinearGradient(0, my - 2, 0, my + 2); gr.addColorStop(0, "#2a1820"); gr.addColorStop(.55, P.iris); gr.addColorStop(1, "#ffd9e8");
          elips(g, ex + (samping ? .3 : 0), my + .15, samping ? .95 : 1.25, 1.85 * kedip, gr);
          elips(g, ex + (samping ? .3 : 0), my + .25, .5, .8 * kedip, "#1d1018");
          if (kedip > .5) { lingkaran(g, ex - .45, my - .75, .55, "#ffffff"); lingkaran(g, ex + .5, my + .85, .25, "rgba(255,255,255,.85)"); }
          g.beginPath(); g.ellipse(ex, my - .1, samping ? 1.4 : 1.75, 2.2 * kedip, 0, Math.PI * 1.08, Math.PI * 1.92); g.strokeStyle = "#2a1820"; g.lineWidth = .7; g.stroke();
          if (cewek) { var luar = ex + (ex < 0 ? -1.6 : 1.6); g.beginPath(); g.moveTo(luar, my - 1); g.lineTo(luar + (ex < 0 ? -.8 : .8), my - 1.8); g.lineWidth = .45; g.stroke(); }
        }
      });
      (samping ? [2.4] : [-4.3, 4.3]).forEach(function (bx) { elips(g, bx, hy + 3.9, 1.4, .65, "rgba(255,120,150,.45)"); g.strokeStyle = "rgba(230,90,120,.5)"; g.lineWidth = .25; for (var k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(bx + k * .6 - .2, hy + 4.2); g.lineTo(bx + k * .6 + .25, hy + 3.5); g.stroke(); } });
      var mx = samping ? 4.6 : 0, myy = hy + 4.6;
      if (o.mulut === "tiup") elips(g, mx, myy + .2, .7, .8, "#c0406a", true);
      else if (o.mulut === "buka") { g.beginPath(); g.moveTo(mx - 1.2, myy - .3); g.quadraticCurveTo(mx, myy + 2.2, mx + 1.2, myy - .3); g.closePath(); g.fillStyle = "#c0406a"; g.fill(); garis(g, .35, "#2a1820"); elips(g, mx, myy + .9, .55, .35, "#ff8fa8"); }
      else { g.beginPath(); g.arc(mx, myy - .5, .9, .35, 2.8); g.strokeStyle = "#7a3a40"; g.lineWidth = .4; g.stroke(); }
    }
    // rambut
    if (belakang) {
      g.beginPath(); g.arc(0, hy, hr + .5, Math.PI * .95, Math.PI * 2.05); g.lineTo(hr + .5, hy + (cewek ? 15 : 4)); g.quadraticCurveTo(0, hy + (cewek ? 17 : 6), -hr - .5, hy + (cewek ? 15 : 4)); g.closePath();
      g.fillStyle = P.rambut; g.fill(); garis(g);
      if (cewek) pita(g, 0, hy - 6.2, 1.05, P.pita);
    } else if (samping) {
      g.beginPath(); g.moveTo(-hr - .6, hy + (cewek ? 8 : 3)); g.lineTo(-hr - .6, hy - 2); g.arc(0, hy, hr + .6, Math.PI, Math.PI * 1.9);
      g.lineTo(hr + 1, hy - 2.2); g.lineTo(hr - 1.4, hy - 1.6); g.lineTo(hr - .6, hy - .2); g.lineTo(hr - 3, hy - 1.4); g.lineTo(hr - 3.6, hy + .6); g.lineTo(hr - 5.2, hy - 1.2); g.lineTo(-1, hy + 1); g.lineTo(-2.6, hy + (cewek ? 8 : 4)); g.closePath();
      g.fillStyle = P.rambut; g.fill(); garis(g);
      if (cewek) pita(g, -3.6, hy - 6, .95, P.pita);
    } else {
      g.beginPath(); g.moveTo(-hr - .8, hy + (cewek ? 9 : 2.6));
      g.quadraticCurveTo(-hr - 1.4, hy - hr - 1.8, 0, hy - hr - 1.4);
      g.quadraticCurveTo(hr + 1.4, hy - hr - 1.8, hr + .8, hy + (cewek ? 9 : 2.6));
      var gigi = cewek ? [[hr - .4, hy + 6], [hr - 1.6, hy - .6], [hr - 2.8, hy - 1.6], [3.4, hy + .2], [2, hy - 2.2], [.4, hy + .4], [-1.2, hy - 2], [-2.8, hy + .2], [-4, hy - 1.8], [-hr + 1.6, hy - .4], [-hr + .4, hy + 6]]
        : [[hr - .2, hy + 1.6], [hr - 1.2, hy - .8], [hr - 2.4, hy - .2], [3.2, hy - 2.6], [2.2, hy + .2], [.6, hy - 2.4], [-.8, hy - .2], [-2.2, hy - 2.6], [-3.4, hy], [-hr + 2, hy - 1.6], [-hr + .6, hy + 1]];
      gigi.forEach(function (p) { g.lineTo(p[0], p[1]); });
      g.closePath(); g.fillStyle = P.rambut; g.fill(); garis(g);
      if (cewek) {
        [-1, 1].forEach(function (s) { g.beginPath(); g.moveTo(s * (hr - .6), hy - 1); g.quadraticCurveTo(s * (hr + 1.2), hy + 5, s * (hr - .4), hy + 10.5); g.quadraticCurveTo(s * (hr - 2), hy + 6, s * (hr - 2), hy - 1); g.closePath(); g.fillStyle = P.rambut; g.fill(); garis(g); });
        pita(g, 4.6, hy - 6.4, 1, P.pita, .4);
      } else poligon(g, [[-1, hy - hr - 1.2], [.6, hy - hr - 3.4], [1.4, hy - hr - .9]], P.rambut, true);
      g.beginPath(); g.arc(0, hy - .4, hr - 1.6, Math.PI * 1.18, Math.PI * 1.42); g.strokeStyle = "rgba(255,255,255,.45)"; g.lineWidth = 1; g.lineCap = "round"; g.stroke();
      g.beginPath(); g.arc(0, hy - .4, hr - 1.6, Math.PI * 1.5, Math.PI * 1.6); g.stroke();
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
  var JALUR = [[150, 420], [104, 350], [214, 300], [160, 214]];
  function titikJalur(u) { var m = 1 - u, s = JALUR; return { x: m * m * m * s[0][0] + 3 * m * m * u * s[1][0] + 3 * m * u * u * s[2][0] + u * u * u * s[3][0], y: m * m * m * s[0][1] + 3 * m * m * u * s[1][1] + 3 * m * u * u * s[2][1] + u * u * u * s[3][1] }; }
  function jarakKeJalur(x, y) { var d = 1e9; for (var u = 0; u <= 1; u += .02) { var p = titikJalur(u); d = Math.min(d, Math.hypot(p.x - x, p.y - y)); } return d; }
  var WARNA_BUNGA = ["#ffffff", "#ff8fb1", "#ffd166", "#c9a8ff", "#ff6b6b", "#ffb36b", "#8fd3ff"];
  function rumpunBunga(g, x, y, n, k) {
    for (var c = 0; c < n; c++) {
      var bx = x + (acak(k, c) - .5) * 10, by = y + (acak(c, k) - .5) * 6, w = WARNA_BUNGA[(k + c) % WARNA_BUNGA.length];
      g.strokeStyle = "#3f8f44"; g.lineWidth = .45; g.beginPath(); g.moveTo(bx, by + 3); g.quadraticCurveTo(bx + .6, by + 1.5, bx, by); g.stroke();
      elips(g, bx + 1.2, by + 2, 1, .45, "#4fa24b"); bunga(g, bx, by, .95 + acak(c, k, 2) * .4, w);
    }
  }

  function buatLuar() {
    var A = { id: "luar", W: 320, H: 400, latar: "#79bf57", padat: [], sprite: [], tempat: [], pindah: [], lokasi: "Halaman depan" };
    function blok(x, y, w, h) { A.padat.push([x, y, w, h]); }
    blok(0, 0, 320, 212); blok(70, 208, 70, 18); blok(180, 208, 70, 18);
    blok(0, 212, 14, 188); blok(306, 212, 14, 188);
    blok(36, 290, 72, 22); blok(214, 322, 72, 22); blok(212, 244, 10, 6);
    A.lantai = function (g) {
      kotak(g, 0, 0, 320, 400, "#7cc25a");
      for (var i = 0; i < 700; i++) { var x = acak(i, 1) * 320, y = acak(1, i) * 400; elips(g, x, y, 3 + acak(i, 2) * 5, 2 + acak(2, i) * 2.5, acak(i, 3) > .5 ? "rgba(160,220,120,.45)" : "rgba(90,160,64,.3)"); }
      g.strokeStyle = "rgba(60,130,50,.45)"; g.lineWidth = .45;
      for (var r = 0; r < 1400; r++) { var rx = acak(r, 7) * 320, ry = acak(7, r) * 400; g.beginPath(); g.moveTo(rx, ry); g.quadraticCurveTo(rx + .5, ry - 1.2, rx + (acak(r, 8) - .5) * 1.6, ry - 2.6); g.stroke(); }
      for (var f = 0; f < 120; f++) { var fx = acak(f, 41) * 320, fy = acak(41, f) * 214; if (fx > 62 && fx < 258 && fy > 6) continue; rumpunBunga(g, fx, fy, 4, f); }
      [7, 313].forEach(function (hx) { for (var hy = 214; hy < 404; hy += 10) { lingkaran(g, hx + 1, hy + 3, 9, "#3f8f44"); lingkaran(g, hx, hy, 8, "#56a64e"); for (var z = 0; z < 3; z++) bunga(g, hx + (acak(hy, z) - .5) * 10, hy - 2 + acak(z, hy) * 5, 1.3, WARNA_BUNGA[(hy + z) % 7]); } });
      function jalan(w, c, dash) { g.save(); g.lineCap = "round"; g.lineWidth = w; g.strokeStyle = c; if (dash) g.setLineDash(dash); g.beginPath(); g.moveTo(JALUR[0][0], JALUR[0][1]); g.bezierCurveTo(JALUR[1][0], JALUR[1][1], JALUR[2][0], JALUR[2][1], JALUR[3][0], JALUR[3][1]); g.stroke(); g.restore(); }
      jalan(34, "rgba(50,90,40,.22)"); jalan(31, "#c9ab84"); jalan(28, "#f0e1c4"); jalan(28, "rgba(170,135,95,.35)", [.7, 6.3]); jalan(10, "rgba(255,255,255,.18)");
      for (var b = 0; b < 170; b++) {
        var bx = 20 + acak(b, 11) * 280, by = 228 + acak(11, b) * 170;
        if (jarakKeJalur(bx, by) < 22 || A.padat.some(function (q) { return bx > q[0] - 6 && bx < q[0] + q[2] + 6 && by > q[1] - 6 && by < q[1] + q[3] + 6; })) continue;
        rumpunBunga(g, bx, by, 3, b);
      }
      [[72, 300, 38, 16], [250, 332, 38, 16]].forEach(function (d, j) {
        elips(g, d[0], d[1] + 2, d[2] + 3, d[3] + 3, "#c98a5e"); elips(g, d[0], d[1], d[2], d[3], "#7a5a3e");
        for (var k = 0; k < 70; k++) { var a = acak(k, 21 + j) * 6.28, rr = Math.sqrt(acak(21 + j, k)), x2 = d[0] + Math.cos(a) * rr * (d[2] - 4), y2 = d[1] + Math.sin(a) * rr * (d[3] - 3); lingkaran(g, x2, y2 + 1.2, 2.6, "#3f8f44"); bunga(g, x2, y2 - .6, 1.35, [["#ff6b9a", "#ffffff", "#ffd166"], ["#c9a8ff", "#ff8fb1", "#ffffff"]][j][k % 3]); }
      });
      gambarRumah(g);
      [[70, 140], [180, 250]].forEach(function (s) {
        bulatIsi(g, s[0], 208, s[1] - s[0], 18, 6, "#7a5a3e", true);
        for (var x2 = s[0] + 5; x2 < s[1] - 3; x2 += 7) { lingkaran(g, x2 + 1, 217, 6, "#3f8f44"); lingkaran(g, x2, 215, 5.4, "#56a64e"); for (var z = 0; z < 3; z++) bunga(g, x2 - 3 + z * 3, 212 + acak(x2, z) * 5, 1.2, WARNA_BUNGA[(x2 + z) % 7]); }
      });
    };
    function jendela(g, x, y, w, h, pintu) {
      bulatIsi(g, x - 2, y - 2, w + 4, h + 4, 2, "#ffffff", true);
      var gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, "#a9cbe6"); gr.addColorStop(.6, "#d9ecf7"); gr.addColorStop(1, "#ffe2b0");
      kotak(g, x, y, w, h, gr); kotak(g, x + w / 2 - .7, y, 1.4, h, "#ffffff"); if (!pintu) kotak(g, x, y + h / 2 - .7, w, 1.4, "#ffffff");
      poligon(g, [[x + 2, y + h - 2], [x + 7, y + 2], [x + 10, y + 2], [x + 5, y + h - 2]], "rgba(255,255,255,.35)");
    }
    function gambarRumah(g) {
      bayangan(g, 160, 210, 100, 7, .25);
      kotak(g, 204, 12, 14, 30, "#c46a52"); kotak(g, 202, 10, 18, 4, "#9a4c3a");
      poligon(g, [[74, 74], [246, 74], [216, 22], [104, 22]], "#7b8fc4", true);
      g.save(); poligon(g, [[74, 74], [246, 74], [216, 22], [104, 22]]); g.clip();
      for (var sy = 24; sy < 76; sy += 5.5) { kotak(g, 60, sy, 200, .6, "rgba(40,50,90,.25)"); for (var sx = 60 + (sy % 11); sx < 260; sx += 11) kotak(g, sx, sy, .5, 5.5, "rgba(40,50,90,.18)"); }
      kotak(g, 60, 22, 200, 8, "rgba(255,255,255,.15)"); g.restore();
      kotak(g, 72, 72, 176, 3.5, "#ffffff");
      kotak(g, 84, 75, 152, 54, "#fff8ee"); kotak(g, 84, 75, 152, 3, "rgba(0,0,0,.07)"); kotak(g, 170, 75, 66, 54, "rgba(220,170,140,.12)");
      jendela(g, 98, 84, 22, 28); jendela(g, 200, 84, 22, 28); jendela(g, 145, 82, 30, 38, true);
      kotak(g, 136, 116, 48, 3, "#ffffff"); kotak(g, 136, 126, 48, 2.6, "#ffffff"); for (var bx = 138; bx < 184; bx += 5) kotak(g, bx, 118, 1.4, 8, "#ffffff");
      g.strokeStyle = OUT; g.lineWidth = .4; g.strokeRect(136, 116, 48, 13);
      poligon(g, [[70, 144], [250, 144], [238, 128], [82, 128]], "#7b8fc4", true);
      kotak(g, 76, 144, 168, 62, "#fffaf2"); kotak(g, 76, 144, 168, 3.5, "rgba(0,0,0,.09)"); kotak(g, 176, 144, 68, 62, "rgba(220,170,140,.12)"); kotak(g, 74, 202, 172, 7, "#e2d6c6");
      [104, 216].forEach(function (wx) { jendela(g, wx - 12, 156, 24, 30); kotak(g, wx - 14, 186, 28, 4.5, "#c46a52"); for (var z = 0; z < 5; z++) bunga(g, wx - 11 + z * 5.5, 185.5, 1.5, WARNA_BUNGA[z + 1]); });
      poligon(g, [[138, 160], [182, 160], [160, 147]], "#ffffff", true); kotak(g, 138, 160, 44, 2.6, "#efe4d6");
      bulatIsi(g, 144, 162, 32, 44, 1, "#efe4d6", true); kotak(g, 147, 165, 26, 41, "#2b1d18");
      [138, 182].forEach(function (lx) { kotak(g, lx - 1.2, 170, 2.4, 4, "#5a5f6e"); bulatIsi(g, lx - 2.3, 172, 4.6, 6, 1.4, "#fff3c4", true); });
      kotak(g, 140, 206, 40, 5, "#d8cfc2"); kotak(g, 136, 211, 48, 5, "#c7bdaf"); kotak(g, 140, 206, 40, 1, "rgba(255,255,255,.6)");
      bulatIsi(g, 148, 218, 24, 8, 2, "#e85d8f"); hati(g, 160, 221.5, 1.6, "#ffffff");
    }
    var bukaPintu = 0;
    A.setPintu = function (v) { bukaPintu = v; };
    A.sprite.push({ y: 0, gambar: function (g, t) {
      var w = 26 * (1 - bukaPintu);
      if (bukaPintu > 0) kotak(g, 147, 165, 26, 41, "#0a060a");
      if (w > .5) {
        kotak(g, 147, 165, w, 41, "#9a6240"); g.strokeStyle = "#6b4228"; g.lineWidth = .6;
        g.strokeRect(147 + w * .14, 169, w * .72, 14); g.strokeRect(147 + w * .14, 187, w * .72, 15);
        lingkaran(g, 147 + w * .86, 188, 1, "#ffd166");
        if (w > 20) hati(g, 147 + w / 2, 175.5, 3.6, "#ff6b9a", .35);
      }
      cahaya(g, 138, 176, 12, "255,232,160", .35 + Math.sin(t * 2) * .05); cahaya(g, 182, 176, 12, "255,232,160", .35 + Math.cos(t * 2) * .05);
      benderaSegitiga(g, t, 80, 240, 146);
      kumpulanBalon(g, 139, 118, t, 3, 1, 18); kumpulanBalon(g, 181, 118, t, 3, 4, 18);
    } });
    A.sprite.push({ y: 248, gambar: function (g, t) {
      var x = 217, y = 248;
      bayangan(g, x, y, 5, 1.6);
      kotak(g, x - 1.2, y - 15, 2.4, 15, "#ffffff"); g.strokeStyle = OUT; g.lineWidth = .4; g.strokeRect(x - 1.2, y - 15, 2.4, 15);
      bulatIsi(g, x - 6.5, y - 24, 13, 10, 4, "#ff7aa8", true); kotak(g, x - 6.5, y - 19, 13, 5, "#ff7aa8"); g.strokeRect(x - 6.5, y - 19, 13, 5);
      kotak(g, x - 6.5, y - 16, 13, 2, "#e85d8f"); hati(g, x, y - 19.5, 1.8, "#ffffff");
      kotak(g, x + 6.5, y - 26 + Math.sin(t * 3) * .4, 1, 7, "#5a5f6e"); poligon(g, [[x + 7.5, y - 26 + Math.sin(t * 3) * .4], [x + 12, y - 24.5], [x + 7.5, y - 23]], "#ffd166");
      var u = (t * .75) % 1; g.globalAlpha = 1 - u; hati(g, x + 1, y - 30 - u * 8, 1.6, "#ff5f8f"); g.globalAlpha = 1;
    } });
    var kupu = []; for (var k = 0; k < 7; k++) kupu.push({ x: 40 + k * 40, y: 240 + (k % 3) * 50, p: k * 1.7, w: ["#ffd166", "#ff8fb1", "#ffffff", "#9ad0ff"][k % 4] });
    A.efek = function (g, t) {
      kupu.forEach(function (b) {
        var x = b.x + Math.sin(t * .5 + b.p) * 30, y = b.y + Math.sin(t * .8 + b.p * 2) * 16 - 12, kep = Math.abs(Math.sin(t * 14 + b.p)) * 2.4 + .4;
        elips(g, x - kep / 2, y, kep / 2 + .3, 1.9, b.w); elips(g, x + kep / 2, y, kep / 2 + .3, 1.9, b.w); kotak(g, x - .25, y - 1.4, .5, 2.8, "#3a2a20");
      });
      for (var p = 0; p < 10; p++) { var px = (p * 37 + t * 9) % 340 - 10, py = 230 + ((p * 53 + t * 14) % 180); g.save(); g.translate(px, py); g.rotate(Math.sin(t * 2 + p)); elips(g, 0, 0, 1.4, .8, p % 2 ? "rgba(255,170,200,.9)" : "rgba(255,255,255,.9)"); g.restore(); }
    };
    if (D.surat) A.tempat.push({ key: "surat", nama: "Kotak Surat", x: 200, y: 246, w: 40, h: 24, lx: 217, ly: 212 });
    A.pintu = { x: 140, y: 210, w: 40, h: 22, ax: 160, ay: 150 };
    A.awal = { x: 160, y: 386, arah: "atas" };
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
    A.pindah.push({ x: 144, y: 214, w: 32, h: 10, ke: "luar", pos: { x: 160, y: 232, arah: "bawah" }, teks: "Keluar" });
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
  var konfeti = [], asap = [], gelapRuang = 0, gelembung = null;

  function prarender(A) {
    var c = document.createElement("canvas"); c.width = Math.ceil(A.W * R); c.height = Math.ceil(A.H * R);
    var gg = c.getContext("2d"); gg.scale(R, R); A.lantai(gg); A.gambarLantai = c;
    if (A.id === "luar") {
      var p = document.createElement("canvas"); p.width = p.height = 96 * R; var pg = p.getContext("2d"); pg.scale(R, R);
      kotak(pg, 0, 0, 96, 96, "#7cc25a");
      for (var i = 0; i < 60; i++) elips(pg, acak(i, 5) * 96, acak(5, i) * 96, 3 + acak(i, 6) * 4, 2 + acak(6, i) * 2, acak(i, 7) > .5 ? "rgba(160,220,120,.45)" : "rgba(90,160,64,.3)");
      pg.strokeStyle = "rgba(60,130,50,.45)"; pg.lineWidth = .45; for (var r2 = 0; r2 < 120; r2++) { var rx = acak(r2, 9) * 96, ry = acak(9, r2) * 96; pg.beginPath(); pg.moveTo(rx, ry); pg.lineTo(rx + (acak(r2, 3) - .5) * 1.6, ry - 2.6); pg.stroke(); }
      for (var f = 0; f < 7; f++) rumpunBunga(pg, 10 + acak(f, 12) * 76, 10 + acak(12, f) * 76, 3, f + 3);
      A.pola = p;
    }
  }
  function skala() { return Math.max(2, Math.min(innerWidth / (T * 10.5), innerHeight / (T * 15))); }
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
  function diPintu() { return adegan.pintu && pemain && dalam(adegan.pintu, pemain.x, pemain.y); }
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
      perbaruiHud();
      setTimeout(function () { tirai.classList.remove("on"); if (lalu) lalu(); else sibuk = false; }, lama ? 2600 : 120);
    }, lama ? 950 : 380);
  }
  function masukRumah() {
    if (sibuk || layarTerbuka) return;
    sibuk = true; tombolPintu.hidden = true; pemain.arah = "atas";
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
      if (adegan.id === "luar") { var vh0 = cv.height / S, bias = Math.max(0, Math.min(1, (330 - pemain.y) / 100)) * 90; ty = Math.max(ty - bias, pemain.y + (SENTUH ? 80 : 40) - vh0 / 2); }
      cam.x += (pemain.x - cam.x) * .12; cam.y += (ty - cam.y) * .1;
    }
    var k = kamera(), x0 = k.x0, y0 = k.y0;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = adegan.latar; g.fillRect(0, 0, cv.width, cv.height);
    g.setTransform(S, 0, 0, S, -x0 * S, -y0 * S);
    if (adegan.pola) { g.save(); g.scale(1 / R, 1 / R); g.fillStyle = g.createPattern(adegan.pola, "repeat"); g.fillRect(x0 * R, y0 * R, k.vw * R, k.vh * R); g.restore(); }
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
    g.drawImage(adegan.gambarLantai, 0, 0, adegan.W, adegan.H);
    var daftar = adegan.sprite.slice();
    if (adegan.id === "lantai1" && dia) daftar.push({ y: dia.y, gambar: function (gg, t) { gambarOrang(gg, dia, dia.x, dia.y, t); } });
    if (pemain) daftar.push({ y: pemain.y + .01, gambar: function (gg, t) { gambarOrang(gg, pemain, pemain.x, pemain.y, t); } });
    daftar.sort(function (a, b) { return a.y - b.y; });
    daftar.forEach(function (s) { s.gambar(g, waktu); });
    if (adegan.efek) adegan.efek(g, waktu);
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
    var dp = cv.width / innerWidth;
    if (diPintu() && !sibuk && !layarTerbuka) { tombolPintu.hidden = false; tombolPintu.style.left = ((adegan.pintu.ax - x0) * S / dp) + "px"; tombolPintu.style.top = ((adegan.pintu.ay - y0) * S / dp) + "px"; }
    else tombolPintu.hidden = true;
  }
  var lalu = 0;
  function putar(t) {
    var dt = Math.min(.05, (t - lalu) / 1000 || 0); lalu = t; waktu += dt;
    gerak(dt); gambar(dt); gambarCut(dt);
    requestAnimationFrame(putar);
  }

  /* ---------- jendela (modal) ---------- */
  var modal, panel, isi, tutupBtn, aksiTutup = null, tombolPintu;
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
        (D.pengirim ? '<div class="ttd">— ' + esc(D.pengirim) + '</div>' : '') + '</div><p class="catatan">Masuk ke rumah lewat pintu depan, lalu tekan <b>Open</b> ya…</p>';
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
    kabar(D.surat ? "Ada surat di kotak surat depan rumah 💌" : "Jalan ke pintu rumah, lalu tekan Open");
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
      petunjuk.hidden = true;
      tahan = { id: e.pointerId, x: e.clientX, y: e.clientY }; try { cv.setPointerCapture(e.pointerId); } catch (er) {}
    });
    cv.addEventListener("pointermove", function (e) { if (tahan && e.pointerId === tahan.id) { tahan.x = e.clientX; tahan.y = e.clientY; } });
    function lepasTahan(e) { if (tahan && e.pointerId === tahan.id) tahan = null; }
    cv.addEventListener("pointerup", lepasTahan); cv.addEventListener("pointercancel", lepasTahan); cv.addEventListener("lostpointercapture", lepasTahan);
    dlg.addEventListener("click", lanjutDialog);
    addEventListener("keydown", function (e) {
      var tag = (e.target || {}).tagName || "";
      if (!dlg.hidden && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); lanjutDialog(); return; }
      if (e.key === "Escape" && !modal.hidden && !panel.classList.contains("wajib")) { tutupModal(); return; }
      if (layarTerbuka || /^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
      if ((e.key === "Enter" || e.key === " ") && pemain && main && !/^(BUTTON|A)$/.test(tag)) {
        if (diPintu()) { e.preventDefault(); masukRumah(); return; }
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
    adegan = ADEGAN.luar; cam.x = 160; cam.y = 330;
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
    tombolPintu = el("button", "tombol tombol-pintu", '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 21V3h11v2H6v14h9v2zm11.5-4-1.4-1.45L16.65 13H9v-2h7.65l-2.55-2.55L15.5 7l5 5z"/></svg>Open');
    tombolPintu.type = "button"; tombolPintu.hidden = true; tombolPintu.addEventListener("click", masukRumah); document.body.appendChild(tombolPintu);
    document.body.appendChild(el("div", "gelap", "<p></p>")).id = "gelap";
    pasangKontrol();

    var sampul = el("div", "sampul",
      '<div class="kartu-sampul"><div class="kecil">Ada kejutan untukmu</div><div class="nama">' + esc(D.nama) + '</div>' +
      (D.usia ? '<div class="usia"><small>ke-</small>' + esc(D.usia) + '</div><br>' : '') + '<div class="tgl">Happy Birthday ♥</div></div>' +
      '<button type="button" class="tombol" id="bukaUndangan">Buka Kejutan</button>');
    for (var i = 0; i < 9; i++) { var b = el("span", "balon-sampul"); b.style.left = (5 + i * 11) + "%"; b.style.background = WARNA[i % 6]; b.style.animationDuration = (9 + (i % 4) * 2.5) + "s"; b.style.animationDelay = (-i * 1.7) + "s"; sampul.appendChild(b); }
    document.body.appendChild(sampul);
    sampul.querySelector("#bukaUndangan").addEventListener("click", function () {
      sampul.classList.add("buka"); if (window.__musik) window.__musik();
      setTimeout(function () { sampul.remove(); pilihTokoh(); }, 700);
    });
    requestAnimationFrame(putar);
    // untuk pengujian otomatis
    window.__ultah = { pemain: function () { return pemain; }, adegan: function () { return adegan.id; }, ke: function (id, x, y) { pindahAdegan(id, { x: x, y: y, arah: "atas" }, false); }, status: function () { return { kejutan: kejutanSelesai, kue: kueSelesai, dialog: !dlg.hidden }; } };
  }
  function siap() {
    var jalan = false; function go() { if (!jalan) { jalan = true; mulai(); } }
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load("700 20px Fredoka"), document.fonts.load("600 20px Fredoka")]).then(go, go);
    setTimeout(go, 2500);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", siap); else siap();
})();
