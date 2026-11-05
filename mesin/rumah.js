/* ===== Mesin undangan ulang tahun "Jalan-jalan ke Rumah" =====
   Tamu berjalan dari trotoar, melewati halaman berumput & berbunga, sampai pintu rumah.
   Di depan pintu ada tombol Open: layar gelap beberapa detik lalu tamu berada di dalam rumah
   (kue ulang tahun, lilin, balon). Rumah bertingkat: tangga di kanan menuju lantai 2.
   Tidak ada jalan otomatis: tokoh hanya bergerak dengan kursor/sentuhan, joystick, atau tombol panah. */
(function () {
  var D = window.ULTAH || {};
  var T = 16, GARIS = "rgba(70,40,50,.5)";
  var HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  var BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  /* ---------- Alat bantu ---------- */
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function acak(x, y, k) { var n = Math.sin(x * 127.1 + y * 311.7 + (k || 0) * 74.7) * 43758.5453; return n - Math.floor(n); }
  function kotak(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }
  function elips(g, cx, cy, rx, ry, c, garis) { g.beginPath(); g.ellipse(cx, cy, Math.max(.01, rx), Math.max(.01, ry), 0, 0, 6.2832); if (c) { g.fillStyle = c; g.fill(); } if (garis) { g.strokeStyle = garis === true ? GARIS : garis; g.lineWidth = .45; g.stroke(); } }
  function lingkaran(g, cx, cy, r, c, garis) { elips(g, cx, cy, r, r, c, garis); }
  function jalurBulat(g, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function bulatIsi(g, x, y, w, h, r, c, garis) { jalurBulat(g, x, y, w, h, r); if (c) { g.fillStyle = c; g.fill(); } if (garis) { g.strokeStyle = garis === true ? GARIS : garis; g.lineWidth = .45; g.stroke(); } }
  function gradV(g, y0, y1, a, b) { var gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, a); gr.addColorStop(1, b); return gr; }
  function cahaya(g, cx, cy, r, rgb, kuat) { var gr = g.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, "rgba(" + rgb + "," + kuat + ")"); gr.addColorStop(1, "rgba(" + rgb + ",0)"); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, 6.2832); g.fill(); }
  function bayangan(g, cx, cy, rx, ry, a) { elips(g, cx, cy, rx, ry, "rgba(40,25,30," + (a || .2) + ")"); }
  function bungaKecil(g, x, y, r, warna, tengah) { for (var i = 0; i < 5; i++) { var a = i * 1.2566; lingkaran(g, x + Math.cos(a) * r, y + Math.sin(a) * r, r * .85, warna); } lingkaran(g, x, y, r * .6, tengah || "#f7c948"); }
  function poligon(g, titik, c, garis) { g.beginPath(); titik.forEach(function (p, i) { if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.closePath(); if (c) { g.fillStyle = c; g.fill(); } if (garis) { g.strokeStyle = garis === true ? GARIS : garis; g.lineWidth = .5; g.stroke(); } }
  function hati(g, x, y, s, c) { g.fillStyle = c; g.beginPath(); g.moveTo(x, y + s); g.bezierCurveTo(x - s * 1.6, y, x - s * .8, y - s * 1.1, x, y - s * .3); g.bezierCurveTo(x + s * .8, y - s * 1.1, x + s * 1.6, y, x, y + s); g.fill(); }
  function bintang(g, x, y, r, c, sudut) { g.beginPath(); for (var i = 0; i < 10; i++) { var a = (sudut || 0) - Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fillStyle = c; g.fill(); }
  var WARNA_BALON = ["#ff6b9a", "#ffd166", "#6cc3f0", "#b48cf2", "#7ed6a0", "#ff9f6b", "#ffffff"];

  /* ---------- Tanggal ---------- */
  function tglAcara() { var p = String(D.tanggal || "").split("-"), j = String(D.jamMulai || "00.00").split(/[.:]/); return new Date(+p[0], (+p[1] || 1) - 1, +p[2] || 1, +j[0] || 0, +j[1] || 0); }
  function tglPanjang() { var d = tglAcara(); return isNaN(d) ? "" : HARI[d.getDay()] + ", " + d.getDate() + " " + BULAN[d.getMonth()] + " " + d.getFullYear(); }
  function tglPendek() { var d = tglAcara(); return isNaN(d) ? "" : ("0" + d.getDate()).slice(-2) + " . " + ("0" + (d.getMonth() + 1)).slice(-2) + " . " + d.getFullYear(); }

  /* ---------- Orang (kartun halus) ---------- */
  var PALET = {
    L: { kulit: "#f1c29b", rambut: "#3a2618", atas: "#5b8fd6", atas2: "#ffffff", bawah: "#34405a", sepatu: "#3b2a1d", gaya: "kaos" },
    P: { kulit: "#f3c7a3", rambut: "#4a2c1a", atas: "#f49ab8", atas2: "#ffffff", bawah: "#f49ab8", sepatu: "#c0607e", gaya: "gaun", panjang: true },
    ultahL: { kulit: "#f0c09a", rambut: "#2a1b12", atas: "#ffd166", atas2: "#ef476f", bawah: "#2f6f9f", sepatu: "#3b2a1d", gaya: "kaos", topi: true },
    ultahP: { kulit: "#f0c09a", rambut: "#2a1b12", atas: "#c39bf0", atas2: "#ffffff", bawah: "#c39bf0", sepatu: "#a06fd0", gaya: "gaun", panjang: true, topi: true }
  };
  function topiPesta(g, hy, hr, warna) {
    g.save(); g.translate(.6, hy - hr + 1.2); g.rotate(.12);
    poligon(g, [[-3.2, 0], [3.2, 0], [0, -8.6]], warna || "#ff6b9a", true);
    g.save(); poligon(g, [[-3.2, 0], [3.2, 0], [0, -8.6]]); g.clip();
    g.strokeStyle = "#ffffff"; g.lineWidth = 1.1; for (var i = -8; i < 2; i += 2.6) { g.beginPath(); g.moveTo(-4, i); g.lineTo(4, i - 2.4); g.stroke(); }
    g.restore();
    lingkaran(g, 0, -8.8, 1.3, "#ffd166", true);
    g.restore();
  }
  function gambarOrang(g, o, x, y, t) {
    var P = PALET[o.palet], gaun = P.gaya === "gaun", sk = o.skala || 1;
    var ay = o.jalan ? Math.sin(o.anim * 1.25) : 0, naik = o.jalan ? Math.abs(Math.sin(o.anim * 1.25)) * .7 : Math.sin(t * 2.2 + x) * .15;
    var samping = o.arah === "kiri" || o.arah === "kanan", belakang = o.arah === "atas";
    bayangan(g, x, y, 5.2 * sk, 1.8 * sk);
    g.save(); g.translate(x, y - naik * sk); g.scale(sk, sk);
    if (o.arah === "kiri") g.scale(-1, 1);
    var hy = -20.2, hr = 5.3;
    // rambut panjang di belakang badan
    if (P.panjang && !belakang) bulatIsi(g, samping ? -hr - .2 : -hr - .7, hy - 1, samping ? hr * 1.5 : hr * 2 + 1.4, 10.5, 3, P.rambut, true);
    // kaki & bawahan
    if (gaun) {
      if (samping) { elips(g, 1.6 + ay * 1.6, -.4, 1.5, .9, P.sepatu); elips(g, -1.2 - ay * 1.6, -.4, 1.5, .9, P.sepatu); kotak(g, ay * 1.2 - .6 + .8, -4, 1.2, 3.5, P.kulit); kotak(g, -ay * 1.2 - .6 - .4, -4, 1.2, 3.5, P.kulit); }
      else { elips(g, -1.6, -.4 - Math.max(0, ay) * .8, 1.3, .9, P.sepatu); elips(g, 1.6, -.4 - Math.max(0, -ay) * .8, 1.3, .9, P.sepatu); kotak(g, -2.2, -4.2 - Math.max(0, ay) * .8, 1.2, 3.6, P.kulit); kotak(g, 1, -4.2 - Math.max(0, -ay) * .8, 1.2, 3.6, P.kulit); }
      var lb = samping ? 4 : 5, sw = samping ? ay * .8 : 0;
      g.beginPath(); g.moveTo(-3.1, -10); g.lineTo(3.1, -10); g.quadraticCurveTo(lb + .4 + sw, -6, lb + sw, -3.4); g.quadraticCurveTo(0, -2.6, -lb + sw, -3.4); g.quadraticCurveTo(-lb - .4 + sw, -6, -3.1, -10); g.closePath();
      g.fillStyle = P.bawah; g.fill(); g.strokeStyle = GARIS; g.lineWidth = .45; g.stroke();
      g.save(); g.clip(); kotak(g, -7, -4.6, 14, 1.1, P.atas2); for (var d = -4; d <= 4; d += 2.4) lingkaran(g, d + sw * .5, -7, .45, "rgba(255,255,255,.75)"); g.restore();
    } else {
      var kk = samping ? [[-1 - ay * 1.8, 0], [1 + ay * 1.8, 0]] : [[-1.7, Math.max(0, ay)], [1.7, Math.max(0, -ay)]];
      kk.forEach(function (k) { bulatIsi(g, k[0] - 1.35, -7.5 - k[1], 2.7, 6.6, 1.2, P.bawah, true); elips(g, k[0] + (samping ? .5 : 0), -.6 - k[1], samping ? 1.7 : 1.4, .95, P.sepatu); });
    }
    // badan
    var bw = samping ? 6.2 : 8.4;
    g.beginPath(); g.moveTo(-bw / 2 + .5, -15.5); g.quadraticCurveTo(-bw / 2 - .4, -12, -bw / 2 + .2, -8.6); g.lineTo(bw / 2 - .2, -8.6); g.quadraticCurveTo(bw / 2 + .4, -12, bw / 2 - .5, -15.5); g.closePath();
    g.fillStyle = P.atas; g.fill(); g.strokeStyle = GARIS; g.lineWidth = .45; g.stroke();
    if (!belakang) {
      if (gaun) { g.fillStyle = P.atas2; g.beginPath(); g.moveTo(-1.8, -15.6); g.quadraticCurveTo(0, -13.4, 1.8, -15.6); g.fill(); kotak(g, -bw / 2 + .2, -10, bw - .4, .9, P.atas2); }
      else if (!samping) bintang(g, 0, -12.2, 1.7, P.atas2);
    }
    // lengan
    function lengan(lx, ly) { bulatIsi(g, lx - 1.1, ly, 2.2, 5.6, 1.1, P.atas, true); lingkaran(g, lx, ly + 5.6, 1.05, P.kulit, true); }
    if (samping) lengan(ay * 1.2, -15);
    else { lengan(-bw / 2 - .6, -15 + (o.jalan ? ay * .7 : 0)); lengan(bw / 2 + .6, -15 - (o.jalan ? ay * .7 : 0)); }
    // kepala
    lingkaran(g, 0, hy, hr, P.kulit, true);
    g.save(); g.beginPath(); g.arc(0, hy, hr, 0, 6.2832); g.clip();
    g.fillStyle = P.rambut;
    if (belakang) g.fillRect(-hr, hy - hr, hr * 2, hr * 2 - (P.panjang ? -.5 : 1.8));
    else if (samping) { g.beginPath(); g.moveTo(-hr, hy + 3); g.lineTo(-hr, hy - hr); g.lineTo(hr, hy - hr); g.lineTo(hr, hy - 2.2); g.quadraticCurveTo(1.5, hy - 2.8, .6, hy - 1); g.quadraticCurveTo(-.6, hy + 1.6, -1.2, hy + (P.panjang ? 4 : 2.6)); g.closePath(); g.fill(); }
    else {
      var pj = P.panjang ? 2.5 : .8;
      g.beginPath(); g.moveTo(-hr, hy + pj); g.lineTo(-hr, hy - hr); g.lineTo(hr, hy - hr); g.lineTo(hr, hy + pj);
      g.quadraticCurveTo(hr - .6, hy - 2.4, 1.4, hy - 2.6); g.quadraticCurveTo(0, hy - 1.6, -.6, hy - 2.9); g.quadraticCurveTo(-3.5, hy - 2.5, -hr, hy + pj); g.closePath(); g.fill();
    }
    g.restore();
    g.beginPath(); g.arc(0, hy, hr, 0, 6.2832); g.strokeStyle = GARIS; g.lineWidth = .45; g.stroke();
    if (P.panjang && belakang) bulatIsi(g, -hr - .4, hy - 1, hr * 2 + .8, 10, 3, P.rambut, true);
    if (!belakang) {
      var ex = samping ? [2.6] : [-2, 2];
      ex.forEach(function (e) { elips(g, e, hy + .6, .62, .85, "#2a1b12"); lingkaran(g, e + .22, hy + .25, .22, "#ffffff"); elips(g, e + (samping ? .3 : (e < 0 ? -.5 : .5)), hy + 2.2, .9, .55, "rgba(240,120,120,.45)"); });
      g.beginPath(); if (samping) g.arc(3.4, hy + 2.6, .7, 1.2, 2.6); else g.arc(0, hy + 2.3, .9, .35, 2.8); g.strokeStyle = "#8a4b3a"; g.lineWidth = .4; g.stroke();
      if (P.panjang) { var fx = samping ? -1.5 : 3, fy = hy - 4.2; bungaKecil(g, fx, fy, .75, "#ffffff", "#ff8fb1"); }
    }
    if (P.topi || o.topi) topiPesta(g, hy, hr, o.warnaTopi);
    g.restore();
  }
  function potretOrang(cv, palet, potong) {
    var g = cv.getContext("2d"), s = potong ? cv.width / 13 : cv.height / 30;
    g.clearRect(0, 0, cv.width, cv.height);
    g.save(); g.scale(s, s);
    if (potong) g.translate(6.5, 27); else g.translate(cv.width / s / 2, 28);
    gambarOrang(g, { palet: palet, arah: "bawah", jalan: false, anim: 0 }, 0, 0, 0);
    g.restore();
  }

  /* ---------- Benda (dipakai di beberapa adegan) ---------- */
  function balon(g, x, y, r, warna, ax, ay) {
    // tali ke titik ikat (ax, ay)
    if (ax != null) { g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = .35; g.beginPath(); g.moveTo(x, y + r * 1.15); g.quadraticCurveTo(x + (ax - x) * .2 + 2, (y + ay) / 2, ax, ay); g.stroke(); }
    g.beginPath(); g.ellipse(x, y, r * .88, r * 1.05, 0, 0, 6.2832); g.fillStyle = warna; g.fill(); g.strokeStyle = "rgba(0,0,0,.12)"; g.lineWidth = .35; g.stroke();
    poligon(g, [[x - .9, y + r * 1.2], [x + .9, y + r * 1.2], [x, y + r * 1.0]], warna);
    elips(g, x - r * .32, y - r * .42, r * .22, r * .34, "rgba(255,255,255,.55)");
  }
  function kumpulanBalon(g, x, y, t, jml, fase, tinggi) {
    tinggi = tinggi || 30;
    bayangan(g, x, y, 4, 1.4);
    lingkaran(g, x, y - 1, 2, "#e85d8f", true);
    for (var i = 0; i < jml; i++) {
      var a = (i / jml - .5) * 1.6, r = 5 + acak(i, fase) * 1.5;
      var bx = x + Math.sin(a) * 9 + Math.sin(t * 1.1 + i + fase) * 1.4, by = y - tinggi + Math.cos(a) * 4 - acak(fase, i) * 8 + Math.sin(t * 1.6 + i * 2 + fase) * 1.3;
      balon(g, bx, by, r, WARNA_BALON[(i + fase) % WARNA_BALON.length], x, y - 2);
    }
  }
  function lampuTaman(g, x, y, t) {
    bayangan(g, x, y, 3.5, 1.3);
    kotak(g, x - .8, y - 22, 1.6, 22, "#3d4450"); kotak(g, x - 2, y - 2, 4, 2, "#3d4450");
    bulatIsi(g, x - 3, y - 29, 6, 7, 1.5, "#fff3c4", "#3d4450"); poligon(g, [[x - 4, y - 29], [x + 4, y - 29], [x, y - 32.5]], "#3d4450");
    cahaya(g, x, y - 25.5, 10, "255,236,170", .25 + Math.sin(t * 2 + x) * .05);
  }
  function semakMawar(g, x, y, r, warnaBunga) {
    bayangan(g, x, y, r * 1.1, r * .35);
    [[-.6, -.5, .7], [.6, -.5, .7], [0, -.9, .8], [-.3, -.2, .6], [.4, -.2, .6]].forEach(function (c) { lingkaran(g, x + c[0] * r, y + c[1] * r, c[2] * r, "#3f8a3e"); });
    [[-.6, -.65, .5], [.55, -.7, .5], [0, -1.1, .55]].forEach(function (c) { lingkaran(g, x + c[0] * r, y + c[1] * r, c[2] * r, "#56a64e"); });
    for (var i = 0; i < 9; i++) { var bx = x + (acak(i, x) - .5) * r * 1.8, by = y - r * .3 - acak(x, i) * r * 1.1; bungaKecil(g, bx, by, r * .1, warnaBunga, "#fff2a8"); }
  }
  function pohon(g, x, y, r, besar) {
    bayangan(g, x + 4, y, r * .9, r * .3, .18);
    // batang bercabang
    g.lineCap = "round"; g.strokeStyle = "#7a5638";
    var cab = besar ? [[0, 0, -10, -30, 5], [0, 0, 16, -34, 4], [-4, -14, -28, -30, 3], [6, -18, 30, -26, 2.6], [-8, -24, -6, -44, 2.6]] : [[0, 0, 0, -26, 4]];
    cab.forEach(function (c) { g.lineWidth = c[4]; g.beginPath(); g.moveTo(x + c[0], y + c[1]); g.quadraticCurveTo(x + (c[0] + c[2]) / 2 + 4, y + (c[1] + c[3]) / 2, x + c[2], y + c[3]); g.stroke(); });
    g.lineWidth = .6; g.strokeStyle = "rgba(255,255,255,.15)"; g.beginPath(); g.moveTo(x - 1, y - 2); g.quadraticCurveTo(x - 4, y - 16, x - 9, y - 28); g.stroke();
    var awan = besar ? [[-26, -40, 16], [-6, -52, 18], [18, -44, 17], [32, -34, 12], [-34, -30, 11], [4, -36, 14], [-16, -56, 12], [14, -60, 12]] : [[0, -36, 13], [-9, -30, 9], [9, -30, 9], [0, -44, 9]];
    awan.forEach(function (c) { lingkaran(g, x + c[0] + 1.5, y + c[1] + 2, c[2] * r / 20, "#2f7036"); });
    awan.forEach(function (c) { lingkaran(g, x + c[0], y + c[1], c[2] * r / 20, "#3f8f44"); });
    awan.forEach(function (c, i) { lingkaran(g, x + c[0] - c[2] * .25, y + c[1] - c[2] * .3, c[2] * r / 20 * .6, i % 2 ? "#58ad52" : "#4fa24b"); });
    awan.forEach(function (c, i) { if (i % 2) cahaya(g, x + c[0] - 4, y + c[1] - 5, c[2] * .7, "255,250,200", .18); });
  }
  function kotakSurat(g, x, y, t) {
    bayangan(g, x, y, 4, 1.3);
    kotak(g, x - 1, y - 14, 2, 14, "#7a5638");
    bulatIsi(g, x - 5, y - 21, 10, 8, 3, "#e85d8f", true); kotak(g, x - 5, y - 17, 10, 4, "#e85d8f");
    kotak(g, x + 4, y - 22, 1, 6, "#ffd166");
    bulatIsi(g, x - 3, y - 18.5, 6, 1.2, .5, "#a33a63");
    kumpulanBalon(g, x - 6, y - 10, t, 3, 2, 16);
  }
  function hadiahKotak(g, x, y, w, h, warna, pita) {
    bayangan(g, x + w / 2, y + h, w * .6, 1.6);
    kotak(g, x, y, w, h, warna); kotak(g, x, y - 2.4, w, 2.6, warna); kotak(g, x, y - 2.4, w, 1, "rgba(255,255,255,.25)");
    kotak(g, x + w / 2 - .9, y - 2.4, 1.8, h + 2.4, pita); kotak(g, x, y + h * .35, w, 1.4, pita);
    elips(g, x + w / 2 - 2, y - 3.6, 2.2, 1.4, pita); elips(g, x + w / 2 + 2, y - 3.6, 2.2, 1.4, pita);
    g.strokeStyle = GARIS; g.lineWidth = .4; g.strokeRect(x, y - 2.4, w, h + 2.4);
  }

  /* ---------- Kue ulang tahun ---------- */
  var lilinPadam = 0, asap = [], konfeti = [];
  function kue(g, cx, y, t) {
    elips(g, cx, y, 24, 6, "#ffffff", "rgba(0,0,0,.15)"); elips(g, cx, y - .8, 21, 4.8, "#f3eef2");
    // tingkat bawah
    kotak(g, cx - 19, y - 20, 38, 18, "#ff9fc0"); elips(g, cx, y - 2, 19, 4.4, "#ff9fc0");
    g.fillStyle = "rgba(0,0,0,.08)"; g.fillRect(cx + 8, y - 20, 11, 18);
    elips(g, cx, y - 20, 19, 4.4, "#ffd3e2");
    g.fillStyle = "#ffffff"; for (var i = 0; i < 9; i++) { var dx = cx - 17 + i * 4.3; g.beginPath(); g.ellipse(dx, y - 17.8 + (i % 2) * 1.2, 1.4, 3 + (i % 3), 0, 0, 6.28); g.fill(); }
    for (var b = 0; b < 7; b++) lingkaran(g, cx - 15 + b * 5, y - 8 + (b % 2) * 2, .9, ["#ffd166", "#6cc3f0", "#7ed6a0", "#b48cf2"][b % 4]);
    // tingkat atas
    kotak(g, cx - 12, y - 33, 24, 13, "#fff6ea"); elips(g, cx, y - 20.4, 12, 3, "#fff6ea");
    g.fillStyle = "rgba(0,0,0,.06)"; g.fillRect(cx + 5, y - 33, 7, 13);
    elips(g, cx, y - 33, 12, 3, "#ffffff", "rgba(0,0,0,.08)");
    for (var k = 0; k < 6; k++) hati(g, cx - 10 + k * 4, y - 27 + (k % 2), 1, "#ff6b9a");
    // lilin
    var n = Math.max(1, Math.min(9, +D.usia || 5));
    for (var j = 0; j < n; j++) {
      var a = (j / n) * 6.2832 + .4, lx = cx + Math.cos(a) * 8, ly = y - 33 + Math.sin(a) * 1.7;
      kotak(g, lx - .7, ly - 8, 1.4, 8, ["#6cc3f0", "#ffd166", "#b48cf2", "#7ed6a0"][j % 4]);
      g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = .35; for (var s = 0; s < 3; s++) { g.beginPath(); g.moveTo(lx - .7, ly - 2 - s * 2.6); g.lineTo(lx + .7, ly - 3.2 - s * 2.6); g.stroke(); }
      kotak(g, lx - .1, ly - 9.2, .2, 1.2, "#3a2a20");
      if (t > lilinPadam) {
        var f = Math.sin(t * 13 + j * 2.1) * .35;
        cahaya(g, lx, ly - 11, 7, "255,200,90", .35);
        g.fillStyle = "#ffb43a"; g.beginPath(); g.moveTo(lx, ly - 14.6 + f); g.quadraticCurveTo(lx + 1.8, ly - 11, lx, ly - 9.4); g.quadraticCurveTo(lx - 1.8, ly - 11, lx, ly - 14.6 + f); g.fill();
        g.fillStyle = "#fff4b8"; g.beginPath(); g.moveTo(lx, ly - 12.8 + f); g.quadraticCurveTo(lx + .8, ly - 10.8, lx, ly - 9.8); g.quadraticCurveTo(lx - .8, ly - 10.8, lx, ly - 12.8 + f); g.fill();
      }
    }
    // hiasan angka usia
    if (D.usia) {
      kotak(g, cx - .4, y - 54, .8, 21, "#c9a24a");
      bulatIsi(g, cx - 5.5, y - 62, 11, 8, 2, "#ffd166", true);
      g.fillStyle = "#e85d8f"; g.font = "700 6.5px Fredoka, Nunito, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(D.usia), cx, y - 57.7);
    }
  }

  /* =====================================================================
     ADEGAN: luar (halaman), lantai1, lantai2.  Satuan = piksel dunia (1 petak = 16)
     ===================================================================== */
  var ADA_GALERI = (D.galeri || []).length > 0, ADA_KADO = (D.hadiah || []).length > 0 || !!D.alamatKado;
  var fotoGaleri = (D.galeri || []).slice(0, 6).map(function (src) { var im = new Image(); im.src = src; return im; });

  // jalan setapak melengkung di halaman (dua kurva bezier)
  var JALUR = [[[236, 590], [150, 500], [340, 430], [276, 352]], [[276, 352], [236, 300], [240, 290], [240, 252]]];
  function titikJalur(u) {
    var s = JALUR[Math.min(1, Math.floor(u))], t = u - Math.min(1, Math.floor(u)), m = 1 - t;
    return { x: m * m * m * s[0][0] + 3 * m * m * t * s[1][0] + 3 * m * t * t * s[2][0] + t * t * t * s[3][0], y: m * m * m * s[0][1] + 3 * m * m * t * s[1][1] + 3 * m * t * t * s[2][1] + t * t * t * s[3][1] };
  }
  function jarakKeJalur(x, y) { var d = 1e9; for (var u = 0; u <= 2; u += .02) { var p = titikJalur(u); d = Math.min(d, Math.hypot(p.x - x, p.y - y)); } return d; }

  function buatLuar() {
    var A = { id: "luar", nama: "Halaman Depan", W: 480, H: 576, latar: "#5ea64a", padat: [], sprite: [], tempat: [], pindah: [], awal: { x: 240, y: 566, arah: "atas" } };
    function blok(x, y, w, h) { A.padat.push([x, y, w, h]); }
    blok(0, 0, 480, 250);                 // rumah & pepohonan belakang
    blok(100, 246, 116, 18); blok(264, 246, 116, 18); // bedeng bunga depan rumah
    blok(0, 250, 22, 290); blok(458, 250, 22, 290);   // pagar tanaman samping
    blok(0, 536, 218, 10); blok(262, 536, 218, 10);  // pagar depan (ada gerbang)
    blok(72, 318, 26, 14); blok(400, 348, 22, 12); blok(30, 486, 20, 10); blok(432, 486, 20, 10);
    blok(66, 434, 92, 34);                // bedeng bunga bundar
    [[372, 452, 16], [404, 470, 15], [346, 480, 13], [426, 430, 12]].forEach(function (b) { blok(b[0] - b[2] * .9, b[1] - 6, b[2] * 1.8, 8); });
    var lampu = [[1.75, -26], [1.25, 28], [.55, -28], [.3, -30]].map(function (l) { var p = titikJalur(l[0]); return [p.x + l[1], p.y]; });
    lampu.forEach(function (l) { blok(l[0] - 3, l[1] - 3, 6, 4); });
    blok(296, 520, 8, 6);                 // kotak surat

    A.lantai = function (g) {
      // rumput
      kotak(g, 0, 0, 480, 576, "#7cc25a");
      for (var i = 0; i < 900; i++) { var x = acak(i, 1) * 480, y = acak(1, i) * 576; elips(g, x, y, 3 + acak(i, 2) * 5, 2 + acak(2, i) * 2.5, acak(i, 3) > .5 ? "rgba(146,210,110,.45)" : "rgba(90,160,64,.35)"); }
      g.strokeStyle = "rgba(60,130,50,.45)"; g.lineWidth = .4;
      for (var r = 0; r < 1600; r++) { var rx = acak(r, 7) * 480, ry = 250 + acak(7, r) * 300; g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx + (acak(r, 8) - .5) * 1.4, ry - 2.2); g.stroke(); }
      // pohon & semak di belakang / samping rumah
      for (var p = 0; p < 26; p++) { var px = (p * 37) % 480, py = 20 + acak(p, 4) * 210; if (px > 92 && px < 388 && py > 10) continue; lingkaran(g, px, py + 6, 26, "#2f7036"); lingkaran(g, px - 3, py, 24, "#3f8f44"); lingkaran(g, px - 8, py - 7, 13, "#55a84f"); }
      for (var q = 0; q < 12; q++) { var qx = 30 + q * 40; lingkaran(g, qx, 8, 30, "#2f7036"); lingkaran(g, qx - 4, 2, 24, "#3f8f44"); }
      // pagar tanaman samping
      [8, 470].forEach(function (hx) { for (var hy = 240; hy < 540; hy += 14) { lingkaran(g, hx + 2, hy + 4, 14, "#2f7036"); lingkaran(g, hx, hy, 12.5, "#3f8f44"); lingkaran(g, hx - 3, hy - 4, 6, "#58ad52"); if (acak(hx, hy) > .55) bungaKecil(g, hx + (acak(hy, hx) - .5) * 12, hy - 2, 1.2, acak(hy, 3) > .5 ? "#ff8fb1" : "#ffffff"); } });
      // trotoar
      kotak(g, 0, 546, 480, 30, "#d9d4cb"); kotak(g, 0, 546, 480, 2, "#b9b2a6");
      g.strokeStyle = "rgba(120,110,100,.35)"; g.lineWidth = .5; for (var tx = 0; tx < 480; tx += 24) { g.beginPath(); g.moveTo(tx, 548); g.lineTo(tx, 576); g.stroke(); } g.beginPath(); g.moveTo(0, 562); g.lineTo(480, 562); g.stroke();
      // jalan setapak
      function garisJalur(w, c, dash) {
        g.save(); g.lineCap = "butt"; g.lineJoin = "round"; g.lineWidth = w; g.strokeStyle = c; if (dash) g.setLineDash(dash);
        g.beginPath(); g.moveTo(JALUR[0][0][0], JALUR[0][0][1]);
        JALUR.forEach(function (s) { g.bezierCurveTo(s[1][0], s[1][1], s[2][0], s[2][1], s[3][0], s[3][1]); }); g.stroke(); g.restore();
      }
      garisJalur(36, "rgba(50,90,40,.25)"); garisJalur(33, "#b99c7a"); garisJalur(30, "#e2cfae");
      garisJalur(30, "rgba(150,118,86,.38)", [.7, 6.3]); garisJalur(1, "rgba(150,118,86,.35)");
      garisJalur(14, "rgba(255,255,255,.12)");
      // bunga liar di rumput
      for (var f = 0; f < 140; f++) {
        var fx = 30 + acak(f, 11) * 420, fy = 270 + acak(11, f) * 260;
        if (jarakKeJalur(fx, fy) < 24 || A.padat.some(function (b) { return fx > b[0] - 4 && fx < b[0] + b[2] + 4 && fy > b[1] - 4 && fy < b[1] + b[3] + 4; })) continue;
        var w = ["#ffffff", "#ff8fb1", "#ffd166", "#c9a8ff", "#ff7b7b"][f % 5];
        for (var c = 0; c < 3; c++) { g.strokeStyle = "#3f8f44"; g.lineWidth = .4; var bx = fx + (c - 1) * 3, by = fy + (c % 2) * 2; g.beginPath(); g.moveTo(bx, by + 2.5); g.lineTo(bx, by); g.stroke(); bungaKecil(g, bx, by, .9, w); }
      }
      // bedeng bunga bundar
      elips(g, 112, 452, 52, 24, "#6b4a33"); elips(g, 112, 450, 48, 21, "#7a5a3e");
      for (var b = 0; b < 60; b++) { var a = acak(b, 21) * 6.28, rr = Math.sqrt(acak(21, b)), bx2 = 112 + Math.cos(a) * rr * 44, by2 = 450 + Math.sin(a) * rr * 18; lingkaran(g, bx2, by2 + 1, 2.6, "#3f8f44"); bungaKecil(g, bx2, by2 - .5, 1.3, ["#ff6b9a", "#ffd166", "#ffffff", "#b48cf2", "#ff9f6b"][b % 5]); }
      // rumah
      gambarRumah(g);
      // bedeng depan rumah
      [[100, 216], [264, 380]].forEach(function (s) {
        bulatIsi(g, s[0], 246, s[1] - s[0], 18, 6, "#6b4a33");
        for (var x2 = s[0] + 6; x2 < s[1] - 4; x2 += 9) { lingkaran(g, x2 + 1, 254, 7, "#2f7036"); lingkaran(g, x2, 252, 6.4, "#3f8f44"); lingkaran(g, x2 - 2, 249.6, 3, "#58ad52"); for (var z = 0; z < 3; z++) bungaKecil(g, x2 - 3 + z * 3, 249 + acak(x2, z) * 4, 1.1, ["#ffffff", "#ff8fb1", "#ffd166"][(x2 + z) % 3]); }
      });
    };
    function gambarRumah(g) {
      var cx = 240;
      bayangan(g, cx, 248, 150, 8, .25);
      // atap utama (lantai 2)
      kotak(g, 316, 4, 18, 40, "#a0563c"); kotak(g, 314, 2, 22, 5, "#7e3f2a");
      poligon(g, [[110, 84], [370, 84], [334, 22], [146, 22]], "#5d6475", true);
      g.save(); poligon(g, [[110, 84], [370, 84], [334, 22], [146, 22]]); g.clip();
      g.strokeStyle = "rgba(255,255,255,.12)"; g.lineWidth = .7; for (var sy = 26; sy < 84; sy += 6) { g.beginPath(); g.moveTo(100, sy); g.lineTo(380, sy); g.stroke(); }
      g.strokeStyle = "rgba(0,0,0,.12)"; for (var sy2 = 26; sy2 < 84; sy2 += 6) for (var sx = 100 + (sy2 % 12); sx < 380; sx += 12) { g.beginPath(); g.moveTo(sx, sy2); g.lineTo(sx, sy2 + 6); g.stroke(); }
      kotak(g, 100, 22, 280, 6, "rgba(255,255,255,.1)");
      g.restore();
      kotak(g, 106, 82, 268, 4, "#eae4d6");
      // dinding lantai 2
      kotak(g, 122, 86, 236, 64, "#f7f1e4"); kotak(g, 122, 86, 236, 3, "rgba(0,0,0,.08)");
      // jendela lantai 2
      [150, 330].forEach(function (wx) { jendela(g, wx - 14, 96, 28, 34); });
      // pintu balkon + balkon
      jendela(g, 222, 94, 36, 46, true);
      kotak(g, 200, 136, 80, 4, "#ffffff"); kotak(g, 200, 148, 80, 3, "#ffffff");
      for (var bx = 202; bx < 280; bx += 6) kotak(g, bx, 138, 1.6, 10, "#ffffff");
      g.strokeStyle = GARIS; g.lineWidth = .4; g.strokeRect(200, 136, 80, 15);
      // atap teras (antara lantai)
      poligon(g, [[96, 166], [384, 166], [368, 148], [112, 148]], "#5d6475", true);
      g.save(); poligon(g, [[96, 166], [384, 166], [368, 148], [112, 148]]); g.clip(); g.strokeStyle = "rgba(0,0,0,.13)"; g.lineWidth = .6; for (var y3 = 152; y3 < 166; y3 += 5) { g.beginPath(); g.moveTo(90, y3); g.lineTo(390, y3); g.stroke(); } g.restore();
      // dinding lantai 1
      kotak(g, 106, 166, 268, 78, "#f9f4e8"); kotak(g, 106, 166, 268, 4, "rgba(0,0,0,.1)"); kotak(g, 104, 238, 272, 8, "#d8cfbd");
      [128, 176, 304, 352].forEach(function (wx) { jendela(g, wx - 14, 184, 28, 40); kotak(g, wx - 16, 224, 32, 5, "#8a5a3b"); for (var z = 0; z < 5; z++) bungaKecil(g, wx - 12 + z * 6, 223, 1.5, ["#ff6b9a", "#ffffff", "#ffd166"][z % 3]); });
      // tanaman rambat di pojok kanan (seperti foto)
      for (var iv = 0; iv < 40; iv++) { var ix = 360 + acak(iv, 31) * 22, iy = 120 + acak(31, iv) * 122; lingkaran(g, ix, iy, 4 + acak(iv, 9) * 3, iv % 3 ? "#3f8f44" : "#58ad52"); }
      // kanopi pintu
      poligon(g, [[212, 184], [268, 184], [240, 168]], "#ffffff", true); kotak(g, 212, 184, 56, 3, "#e3dccd");
      // kusen pintu (daun pintu digambar terpisah, bisa dibuka)
      kotak(g, 222, 190, 36, 54, "#e3dccd"); kotak(g, 225, 193, 30, 51, "#2b1d18");
      // lampu dinding
      [214, 266].forEach(function (lx) { kotak(g, lx - 1.5, 200, 3, 6, "#3d4450"); bulatIsi(g, lx - 2.5, 202, 5, 7, 1.5, "#fff3c4", "#3d4450"); });
      // tangga teras
      kotak(g, 216, 244, 48, 6, "#cfc7b8"); kotak(g, 212, 250, 56, 6, "#bdb4a4"); kotak(g, 216, 244, 48, 1, "rgba(255,255,255,.5)");
    }
    function jendela(g, x, y, w, h, pintu) {
      kotak(g, x - 2, y - 2, w + 4, h + 4, "#59677a");
      var gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, "#9fb6c9"); gr.addColorStop(.55, "#cfe0ea"); gr.addColorStop(1, "#ffe0a8");
      kotak(g, x, y, w, h, gr);
      kotak(g, x + w / 2 - .8, y, 1.6, h, "#59677a"); if (!pintu) kotak(g, x, y + h / 2 - .8, w, 1.6, "#59677a");
      poligon(g, [[x + 2, y + h - 2], [x + 8, y + 2], [x + 12, y + 2], [x + 6, y + h - 2]], "rgba(255,255,255,.25)");
    }

    // ---- benda yang bergerak / berurutan menurut y ----
    var bukaPintu = 0; // 0..1
    A.setPintu = function (v) { bukaPintu = v; };
    A.sprite.push({ y: 0, gambar: function (g, t) {
      // daun pintu
      var w = 30 * (1 - bukaPintu);
      if (bukaPintu > 0) { cahaya(g, 240, 220, 30 * bukaPintu, "255,214,150", .5 * bukaPintu); kotak(g, 225, 193, 30, 51, "rgba(255,200,130," + (.35 * bukaPintu) + ")"); }
      if (w > .5) {
        kotak(g, 225, 193, w, 51, "#8a5a3b"); g.strokeStyle = "#6b4228"; g.lineWidth = .6;
        g.strokeRect(225 + w * .12, 197, w * .76, 18); g.strokeRect(225 + w * .12, 219, w * .76, 21);
        lingkaran(g, 225 + w * .85, 220, 1.1, "#ffd166");
        // papan "Pesta!" di pintu
        if (w > 18) { kotak(g, 240 - 9 * (w / 30) - (30 - w) / 2, 199, 18 * (w / 30), 9, "#ffd166"); g.fillStyle = "#e85d8f"; g.font = "700 5.5px Fredoka, Nunito, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("PESTA!", 225 + w / 2, 203.8); }
      }
      // cahaya lampu dinding
      cahaya(g, 214, 205, 14, "255,232,160", .3 + Math.sin(t * 2) * .04); cahaya(g, 266, 205, 14, "255,232,160", .3 + Math.cos(t * 2) * .04);
      // bendera segitiga warna-warni di teras
      g.strokeStyle = "rgba(90,60,60,.6)"; g.lineWidth = .4; g.beginPath(); g.moveTo(112, 168); g.quadraticCurveTo(176, 182, 240, 170); g.quadraticCurveTo(304, 182, 368, 168); g.stroke();
      for (var i = 0; i < 22; i++) { var u = i / 21, xx = 112 + u * 256, yy = 168 + Math.sin(u * Math.PI * 2 - Math.PI) * -6 + Math.abs(Math.sin(u * Math.PI * 2)) * 4 - 2; var sw = Math.sin(t * 2 + i) * .6; poligon(g, [[xx - 3, yy], [xx + 3, yy], [xx + sw, yy + 6]], WARNA_BALON[i % 6]); }
      // balon di balkon
      kumpulanBalon(g, 204, 140, t, 4, 1, 22); kumpulanBalon(g, 276, 140, t, 4, 4, 22);
    } });
    A.sprite.push({ y: 332, gambar: function (g) { pohon(g, 85, 330, 24, true); } });
    A.sprite.push({ y: 360, gambar: function (g) { pohon(g, 411, 358, 20, false); } });
    A.sprite.push({ y: 494, gambar: function (g) { semakMawar(g, 40, 494, 14, "#ffffff"); } });
    A.sprite.push({ y: 494, gambar: function (g) { semakMawar(g, 442, 494, 14, "#ff8fb1"); } });
    [[372, 452, 16], [404, 470, 15], [346, 480, 13], [426, 430, 12]].forEach(function (b) { A.sprite.push({ y: b[1], gambar: function (g) { semakMawar(g, b[0], b[1], b[2], "#ffffff"); } }); });
    lampu.forEach(function (l) { A.sprite.push({ y: l[1], gambar: function (g, t) { lampuTaman(g, l[0], l[1], t); } }); });
    A.sprite.push({ y: 526, gambar: kotakSuratSprite });
    function kotakSuratSprite(g, t) { kotakSurat(g, 300, 526, t); }
    A.sprite.push({ y: 546, gambar: function (g) {
      // pagar kayu putih
      [[0, 218], [262, 480]].forEach(function (s) {
        kotak(g, s[0], 534, s[1] - s[0], 3, "#ffffff"); kotak(g, s[0], 541, s[1] - s[0], 3, "#ffffff");
        for (var x = s[0] + 2; x < s[1] - 2; x += 7) { poligon(g, [[x, 546], [x, 528], [x + 2, 525.5], [x + 4, 528], [x + 4, 546]], "#ffffff", "rgba(120,100,90,.5)"); }
      });
      [214, 262].forEach(function (x) { kotak(g, x, 522, 6, 24, "#f3efe8"); kotak(g, x - 1, 520, 8, 3, "#ffffff"); g.strokeStyle = GARIS; g.lineWidth = .4; g.strokeRect(x, 522, 6, 24); });
    } });
    // kupu-kupu
    var kupu = []; for (var k = 0; k < 6; k++) kupu.push({ x: 60 + k * 70, y: 300 + (k % 3) * 70, p: k * 1.7, w: ["#ffd166", "#ff8fb1", "#ffffff", "#9ad0ff"][k % 4] });
    A.efek = function (g, t) {
      kupu.forEach(function (b) {
        var x = b.x + Math.sin(t * .5 + b.p) * 40, y = b.y + Math.sin(t * .8 + b.p * 2) * 18 - 14, kep = Math.abs(Math.sin(t * 14 + b.p)) * 2.2 + .4;
        elips(g, x - kep / 2, y, kep / 2 + .3, 1.8, b.w); elips(g, x + kep / 2, y, kep / 2 + .3, 1.8, b.w); kotak(g, x - .25, y - 1.4, .5, 2.8, "#3a2a20");
      });
    };
    A.tempat.push({ key: "surat", nama: "Surat Undangan", x: 280, y: 516, w: 40, h: 30, lx: 300, ly: 488 });
    A.pintu = { x: 216, y: 248, w: 48, h: 26, ax: 240, ay: 186 };
    A.pindahPintu = { ke: "lantai1", pos: { x: 176, y: 212, arah: "atas" } };
    A.lokasi = "Halaman depan";
    return A;
  }

  function lantaiKayu(g, x0, y0, w, h, warna, garisW) {
    kotak(g, x0, y0, w, h, warna);
    for (var y = y0, r = 0; y < y0 + h; y += 9, r++) {
      kotak(g, x0, y, w, .5, garisW);
      for (var x = x0 + (r % 3) * 22; x < x0 + w; x += 66) kotak(g, x, y, .5, 9, garisW);
      kotak(g, x0, y + 1, w, 1.4, "rgba(255,255,255,.06)");
    }
  }
  function lampuHias(g, t, x0, x1, y) {
    g.strokeStyle = "rgba(60,40,30,.6)"; g.lineWidth = .4; g.beginPath(); g.moveTo(x0, y);
    for (var x = x0; x <= x1; x += 20) g.quadraticCurveTo(x + 10, y + 5, x + 20, y); g.stroke();
    for (var i = 0, xx = x0 + 5; xx < x1; xx += 10, i++) { var on = (Math.sin(t * 3 + i * 1.3) + 1) / 2, yy = y + (i % 2 ? 3.4 : 2.4); cahaya(g, xx, yy + 1, 4, "255,226,140", .25 + on * .35); lingkaran(g, xx, yy + 1, .9, on > .5 ? "#fff3b0" : "#ffd36e"); }
  }
  function benderaSegitiga(g, t, x0, x1, y) {
    g.strokeStyle = "rgba(90,60,60,.6)"; g.lineWidth = .4; g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo((x0 + x1) / 2, y + 10, x1, y); g.stroke();
    var n = Math.round((x1 - x0) / 9);
    for (var i = 1; i < n; i++) { var u = i / n, x = x0 + u * (x1 - x0), yy = y + 4 * 2 * u * (1 - u) * 5 - .4, sw = Math.sin(t * 2 + i) * .5; poligon(g, [[x - 3, yy], [x + 3, yy], [x + sw, yy + 6]], WARNA_BALON[i % 6]); }
  }
  function hurufFoil(g, teks, cx, y, ukuran, t, warna) {
    g.font = "700 " + ukuran + "px Fredoka, Nunito, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    var lebar = teks.split("").map(function (h) { return g.measureText(h).width + ukuran * .08; }), total = lebar.reduce(function (a, b) { return a + b; }, 0), x = cx - total / 2;
    teks.split("").forEach(function (h, i) {
      var hx = x + lebar[i] / 2, hy = y + Math.sin(t * 1.3 + i) * .5;
      g.save(); g.translate(hx, hy); g.rotate(Math.sin(t * .9 + i * 1.7) * .05);
      var gr = g.createLinearGradient(0, -ukuran / 2, 0, ukuran / 2);
      (warna || ["#ffffff", "#c3c9d1", "#f4f6f9", "#9aa3ad"]).forEach(function (c, k, arr) { gr.addColorStop(k / (arr.length - 1), c); });
      g.lineJoin = "round"; g.lineWidth = ukuran * .14; g.strokeStyle = "rgba(60,70,80,.55)"; g.strokeText(h, 0, 0);
      g.fillStyle = gr; g.fillText(h, 0, 0);
      g.restore(); x += lebar[i];
    });
  }

  function buatLantai1() {
    var A = { id: "lantai1", nama: "Lantai 1", W: 352, H: 240, latar: "#2a1d22", padat: [], sprite: [], tempat: [], pindah: [], awal: { x: 176, y: 212, arah: "atas" } };
    function blok(x, y, w, h) { A.padat.push([x, y, w, h]); }
    blok(0, 0, 286, 80); blok(340, 0, 12, 240); blok(0, 0, 8, 240);
    blok(0, 228, 160, 12); blok(192, 228, 160, 12);
    blok(276, 80, 10, 104);              // pegangan tangga
    blok(16, 80, 116, 32);               // sofa
    blok(134, 82, 18, 14);               // meja lampu
    blok(128, 124, 96, 26);              // meja kue
    blok(104, 144, 18, 8);               // anak yang berulang tahun
    blok(22, 184, 72, 18);               // meja buku tamu
    blok(8, 126, 18, 10); blok(254, 104, 18, 8); blok(136, 214, 18, 10); blok(198, 214, 18, 10); blok(318, 206, 22, 14);
    A.lantai = function (g) {
      // dinding belakang berpanel kayu
      kotak(g, 0, 0, 352, 80, "#b98b60");
      for (var x = 0; x < 352; x += 22) { kotak(g, x, 0, .8, 80, "rgba(70,40,20,.25)"); kotak(g, x + 1, 0, 1.6, 80, "rgba(255,255,255,.07)"); }
      kotak(g, 0, 0, 352, 80, gradV(g, 0, 80, "rgba(40,20,10,.15)", "rgba(255,220,170,.08)"));
      kotak(g, 0, 76, 352, 4, "#8a6040");
      // lantai kayu
      lantaiKayu(g, 0, 80, 352, 160, "#dcae78", "rgba(120,80,40,.3)");
      // karpet
      bulatIsi(g, 96, 112, 160, 72, 14, "#f3e6d8"); bulatIsi(g, 100, 116, 152, 64, 11, null, "rgba(232,93,143,.5)");
      for (var k = 0; k < 14; k++) lingkaran(g, 104 + k * 10.6, 180, 1.2, "#ffb3cb");
      // dinding samping & depan
      kotak(g, 0, 0, 8, 240, "#7a5238"); kotak(g, 344, 0, 8, 240, "#7a5238");
      kotak(g, 0, 228, 160, 12, "#5e3d29"); kotak(g, 192, 228, 160, 12, "#5e3d29"); kotak(g, 0, 228, 352, 1.5, "rgba(255,255,255,.12)");
      bulatIsi(g, 160, 222, 32, 14, 3, "#c0605f"); g.fillStyle = "rgba(255,255,255,.55)"; g.font = "600 5px Fredoka, Nunito, sans-serif"; g.textAlign = "center"; g.fillText("WELCOME", 176, 230);
      // tangga naik (di kanan)
      kotak(g, 286, 76, 54, 110, "#8a6040");
      for (var s = 0; s < 9; s++) { var sy = 76 + s * 12, terang = 1 - s * .05; kotak(g, 288, sy, 50, 12, "rgb(" + Math.round(150 * terang + 60) + "," + Math.round(110 * terang + 40) + "," + Math.round(70 * terang + 20) + ")"); kotak(g, 288, sy + 9, 50, 3, "rgba(70,40,20,.35)"); kotak(g, 288, sy, 50, 1, "rgba(255,255,255,.18)"); }
      kotak(g, 302, 76, 22, 108, "rgba(200,70,90,.55)"); for (var s2 = 0; s2 < 9; s2++) kotak(g, 302, 85 + s2 * 12, 22, 1.2, "rgba(120,30,50,.35)");
      // panah naik
      g.fillStyle = "rgba(255,255,255,.7)"; poligon(g, [[313, 88], [319, 96], [307, 96]], "rgba(255,255,255,.7)");
    };
    // dinding: papan HAPPY BIRTHDAY, bintang, balon hati, lampu hias
    A.sprite.push({ y: 0, gambar: function (g, t) {
      lampuHias(g, t, 8, 284, 4);
      bulatIsi(g, 46, 12, 196, 56, 3, "#33463a"); bulatIsi(g, 48, 14, 192, 52, 2, null, "rgba(0,0,0,.3)");
      for (var i = 0; i < 30; i++) lingkaran(g, 50 + acak(i, 3) * 188, 16 + acak(3, i) * 48, 2 + acak(i, 4) * 3, "rgba(80,120,90,.35)");
      hurufFoil(g, "HAPPY", 128, 28, 15, t);
      hurufFoil(g, "BIRTHDAY", 150, 52, 15, t + 2);
      [[58, 18, 4], [228, 20, 4.5], [40, 46, 3.6], [250, 48, 3.4], [210, 70, 3], [70, 68, 3.2], [118, 10, 3]].forEach(function (b, i) { bintang(g, b[0], b[1] + Math.sin(t + i) * .5, b[2], "#e9c65a", Math.sin(t * .7 + i) * .2); bintang(g, b[0] - .4, b[1] - .4 + Math.sin(t + i) * .5, b[2] * .5, "rgba(255,255,255,.4)"); });
      // balon hati merah
      var hy = 30 + Math.sin(t * 1.2) * 1.2; g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = .35; g.beginPath(); g.moveTo(262, hy + 8); g.lineTo(264, 76); g.stroke();
      hati(g, 262, hy, 9, "#e3343f"); elips(g, 257, hy - 3, 1.6, 2.4, "rgba(255,255,255,.5)");
      // nama di bawah papan
      // lampu lantai pojok
      cahaya(g, 143, 74, 26, "255,226,160", .35);
    } });
    A.sprite.push({ y: 112, gambar: function (g) {
      // sofa (seperti foto: krem dengan bantal hijau)
      bayangan(g, 74, 112, 60, 4);
      bulatIsi(g, 16, 78, 116, 20, 5, "#c7b8a2", true);       // sandaran
      bulatIsi(g, 14, 92, 120, 20, 4, "#d6c8b2", true);       // dudukan
      bulatIsi(g, 10, 82, 12, 30, 5, "#bcac95", true); bulatIsi(g, 126, 82, 12, 30, 5, "#bcac95", true);
      kotak(g, 52, 92, .6, 18, "rgba(0,0,0,.1)"); kotak(g, 94, 92, .6, 18, "rgba(0,0,0,.1)");
      [[28, 84, "#6b7d4a"], [70, 83, "#8a9a62"], [108, 84, "#6b7d4a"]].forEach(function (b) { bulatIsi(g, b[0] - 8, b[1], 16, 12, 4, b[2], true); });
      // botol balon besar di sofa
      g.save(); g.translate(46, 98); g.rotate(-.5); bulatIsi(g, -4, -9, 8, 18, 3.5, "#1d3b2a", true); kotak(g, -1.6, -14, 3.2, 6, "#d8b25a"); kotak(g, -4, -2, 8, 5, "#f3eadb"); g.restore();
      // meja lampu
      kotak(g, 134, 86, 18, 10, "#5e3d29"); kotak(g, 140, 78, 1.4, 9, "#3d2a20"); poligon(g, [[136, 76], [148, 76], [146, 68], [138, 68]], "#f6ead2", true);
    } });
    A.sprite.push({ y: 150, gambar: function (g, t) {
      // meja kopi + kue + camilan
      bayangan(g, 176, 150, 52, 4);
      kotak(g, 130, 140, 4, 10, "#3d2a20"); kotak(g, 218, 140, 4, 10, "#3d2a20");
      bulatIsi(g, 126, 122, 100, 22, 3, "#4a3328", true); kotak(g, 128, 124, 96, 2, "rgba(255,255,255,.12)");
      [[140, 130, "#ffd166"], [152, 136, "#ff9f6b"], [208, 130, "#7ed6a0"], [198, 137, "#ff6b9a"], [216, 138, "#6cc3f0"]].forEach(function (s) { elips(g, s[0], s[1], 5, 2.6, "#ffffff", true); for (var i = 0; i < 4; i++) lingkaran(g, s[0] - 2.4 + i * 1.6, s[1] - .6 + (i % 2) * .8, 1.1, s[2]); });
      kotak(g, 144, 120, 3, 8, "#e3343f"); kotak(g, 206, 120, 3, 8, "#3a7bd5");
      kue(g, 176, 136, t);
    } });
    A.sprite.push({ y: 202, gambar: function (g) {
      // meja buku tamu
      bayangan(g, 58, 202, 38, 3);
      kotak(g, 26, 196, 3, 6, "#5e3d29"); kotak(g, 87, 196, 3, 6, "#5e3d29");
      bulatIsi(g, 22, 182, 72, 16, 2, "#f6ede0", true); kotak(g, 22, 194, 72, 4, "#e85d8f");
      poligon(g, [[44, 186], [58, 184.5], [58, 194], [44, 195]], "#ffffff", true); poligon(g, [[58, 184.5], [72, 186], [72, 195], [58, 194]], "#ffffff", true);
      for (var l = 0; l < 4; l++) { kotak(g, 46, 188 + l * 1.8, 10, .3, "#b9a9c4"); kotak(g, 60, 188 + l * 1.8, 10, .3, "#b9a9c4"); }
      g.strokeStyle = "#3a7bd5"; g.lineWidth = .8; g.beginPath(); g.moveTo(74, 192); g.lineTo(80, 186); g.stroke();
      bulatIsi(g, 30, 178, 7, 9, 2, "#9ad0ff", true); bungaKecil(g, 33.5, 176, 1.6, "#ff8fb1"); bungaKecil(g, 31, 178, 1.2, "#ffd166");
    } });
    A.sprite.push({ y: 186, gambar: function (g) {
      // pegangan tangga
      kotak(g, 276, 80, 8, 104, "rgba(0,0,0,.15)");
      for (var y = 84; y < 184; y += 8) kotak(g, 279, y - 12, 1.6, 12, "#f3efe8");
      bulatIsi(g, 276, 70, 6, 112, 2.5, "#6b4228", true); bulatIsi(g, 275, 176, 8, 12, 2, "#5e3d29", true); lingkaran(g, 279, 175, 3, "#7a5238", true);
    } });
    A.sprite.push({ y: 220, gambar: function (g) { pot(g, 329, 220); } });
    [[16, 134, 5, 0], [262, 110, 5, 3], [144, 222, 4, 1], [206, 222, 4, 5]].forEach(function (b) { A.sprite.push({ y: b[1], gambar: function (g, t) { kumpulanBalon(g, b[0], b[1], t, b[2], b[3], 32); } }); });
    A.npc = [{ x: 113, y: 150, arah: "kanan", jalan: false, anim: 0, palet: D.jenis === "laki-laki" ? "ultahL" : "ultahP", skala: .86 }];
    A.efek = function (g, t) { cahaya(g, 176, 100, 70, "255,200,120", .1 + (t > lilinPadam ? .05 : 0)); };
    A.tempat.push({ key: "kue", nama: "Kue Ulang Tahun", x: 126, y: 148, w: 104, h: 26, lx: 176, ly: 70 });
    A.tempat.push({ key: "bukutamu", nama: "Buku Tamu", x: 16, y: 200, w: 86, h: 28, lx: 58, ly: 164 });
    A.pindah.push({ x: 286, y: 70, w: 54, h: 24, ke: "lantai2", pos: { x: 312, y: 98, arah: "bawah" }, teks: "Naik ke lantai 2" });
    A.pindah.push({ x: 160, y: 230, w: 32, h: 12, ke: "luar", pos: { x: 240, y: 268, arah: "bawah" }, teks: "Keluar" });
    A.lokasi = "Lantai 1 · Ruang pesta";
    return A;
  }
  function pot(g, x, y) {
    bayangan(g, x, y, 8, 2);
    poligon(g, [[x - 7, y - 10], [x + 7, y - 10], [x + 5, y], [x - 5, y]], "#d9825b", true);
    [[-6, -18, 6], [5, -19, 6], [0, -24, 7], [-3, -14, 5], [4, -14, 5]].forEach(function (c) { lingkaran(g, x + c[0], y + c[1], c[2], "#3f8f44"); lingkaran(g, x + c[0] - 1.5, y + c[1] - 1.5, c[2] * .5, "#58ad52"); });
  }

  function buatLantai2() {
    var A = { id: "lantai2", nama: "Lantai 2", W: 352, H: 208, latar: "#2a1d22", padat: [], sprite: [], tempat: [], pindah: [], awal: { x: 312, y: 98, arah: "bawah" } };
    function blok(x, y, w, h) { A.padat.push([x, y, w, h]); }
    blok(0, 0, 352, 80); blok(0, 0, 8, 208); blok(344, 0, 8, 208); blok(0, 198, 352, 10);
    blok(276, 104, 10, 98);               // pagar lubang tangga
    blok(14, 80, 84, 36);                 // tempat tidur
    blok(24, 152, 70, 30);                // tumpukan kado
    blok(226, 176, 18, 8); blok(110, 176, 18, 8); blok(232, 84, 30, 18);
    A.lantai = function (g) {
      // dinding belakang: wallpaper pastel berbintik
      kotak(g, 0, 0, 352, 80, "#f7d9e3");
      for (var y = 6; y < 76; y += 10) for (var x = (y / 10 % 2) * 8 + 4; x < 352; x += 16) lingkaran(g, x, y, 1.3, "rgba(255,255,255,.7)");
      kotak(g, 0, 0, 352, 80, gradV(g, 0, 80, "rgba(120,60,90,.08)", "rgba(255,255,255,0)"));
      kotak(g, 0, 76, 352, 4, "#e2a9bf");
      // lantai kayu terang + karpet bundar
      lantaiKayu(g, 0, 80, 352, 128, "#ead2b0", "rgba(140,100,60,.25)");
      elips(g, 168, 146, 70, 34, "#d9c7f2"); elips(g, 168, 146, 62, 28, "#e8dcf8"); elips(g, 168, 146, 50, 22, null, "rgba(139,111,214,.4)");
      for (var c = 0; c < 40; c++) { var cx = 110 + acak(c, 5) * 120, cy = 120 + acak(5, c) * 60; kotak(g, cx, cy, 1.4, .8, WARNA_BALON[c % 6]); }
      // dinding samping & depan
      kotak(g, 0, 0, 8, 208, "#c98aa3"); kotak(g, 344, 0, 8, 208, "#c98aa3"); kotak(g, 0, 198, 352, 10, "#b07490");
      // jendela ke balkon
      kotak(g, 248, 10, 52, 52, "#ffffff"); kotak(g, 251, 13, 46, 46, gradV(g, 13, 59, "#9ad0ff", "#e6f5ff"));
      lingkaran(g, 286, 26, 5, "#fff6c8"); elips(g, 262, 40, 8, 3, "#ffffff"); elips(g, 270, 38, 6, 3, "#ffffff");
      kotak(g, 273.2, 13, 1.6, 46, "#ffffff");
      poligon(g, [[244, 6], [258, 6], [252, 64], [244, 64]], "#ff9fc0"); poligon(g, [[304, 6], [290, 6], [296, 64], [304, 64]], "#ff9fc0");
      // lubang tangga turun
      kotak(g, 286, 104, 54, 94, "#3a2a24");
      for (var s = 0; s < 8; s++) { var sy = 106 + s * 11.5, gelap = s * .08; kotak(g, 288, sy, 50, 9, "rgb(" + Math.round(190 - s * 14) + "," + Math.round(150 - s * 12) + "," + Math.round(110 - s * 10) + ")"); kotak(g, 288, sy + 9, 50, 2.5, "rgba(0,0,0," + (.3 + gelap) + ")"); }
      g.fillStyle = "rgba(255,255,255,.75)"; poligon(g, [[313, 188], [319, 180], [307, 180]], "rgba(255,255,255,.75)");
    };
    A.sprite.push({ y: 0, gambar: function (g, t) {
      benderaSegitiga(g, t, 10, 240, 4);
      // dinding foto (galeri)
      var bingkai = [[112, 14, 30, 24], [148, 10, 34, 30], [188, 16, 28, 22], [120, 44, 26, 22], [152, 46, 30, 24], [188, 44, 32, 26]];
      bingkai.forEach(function (b, i) {
        g.save(); g.translate(b[0] + b[2] / 2, b[1] + b[3] / 2); g.rotate((acak(i, 9) - .5) * .08);
        kotak(g, -b[2] / 2 - 2, -b[3] / 2 - 2, b[2] + 4, b[3] + 4, i % 2 ? "#ffffff" : "#e9c65a");
        var im = fotoGaleri[i];
        if (im && im.complete && im.naturalWidth) {
          var r = Math.max(b[2] / im.naturalWidth, b[3] / im.naturalHeight), sw = b[2] / r, sh = b[3] / r;
          g.drawImage(im, (im.naturalWidth - sw) / 2, (im.naturalHeight - sh) / 2, sw, sh, -b[2] / 2, -b[3] / 2, b[2], b[3]);
        } else {
          kotak(g, -b[2] / 2, -b[3] / 2, b[2], b[3], ["#ffe0ec", "#e2f2ff", "#fff3cc", "#e6dcff", "#dff6e6", "#ffe5d6"][i]);
          lingkaran(g, 0, -b[3] * .08, b[3] * .18, "#f0c09a"); g.beginPath(); g.arc(0, -b[3] * .14, b[3] * .19, Math.PI, 0); g.fillStyle = "#3a2618"; g.fill();
          bulatIsi(g, -b[3] * .26, b[3] * .14, b[3] * .52, b[3] * .36, b[3] * .14, WARNA_BALON[i]);
        }
        g.restore();
      });
      hurufFoil(g, String(D.nama || "").toUpperCase().slice(0, 10), 60, 30, 11, t, ["#fff2b8", "#e9c65a", "#fff6d0", "#c9a24a"]);
      if (D.usia) { g.font = "700 9px Fredoka, Nunito, sans-serif"; g.fillStyle = "#e85d8f"; g.textAlign = "center"; g.fillText("ke-" + D.usia, 60, 48); }
      // balon menempel di langit-langit
      [[20, 12], [34, 8], [322, 10], [334, 16], [236, 14]].forEach(function (b, i) { balon(g, b[0] + Math.sin(t + i) * .8, b[1] + Math.cos(t * 1.3 + i) * .8, 6, WARNA_BALON[(i + 2) % 7], b[0], b[1] + 22 + Math.sin(t + i) * 2); });
    } });
    A.sprite.push({ y: 116, gambar: function (g) {
      // tempat tidur anak + boneka beruang
      bayangan(g, 56, 116, 44, 3);
      bulatIsi(g, 14, 72, 84, 12, 4, "#c98aa3", true);
      bulatIsi(g, 16, 82, 80, 34, 3, "#ffffff", true);
      bulatIsi(g, 16, 94, 80, 22, 3, "#b48cf2", true); for (var i = 0; i < 6; i++) bintang(g, 24 + i * 13, 104 + (i % 2) * 4, 2, "#fff6c8");
      bulatIsi(g, 22, 84, 22, 9, 4, "#fff0f5", true);
      var bx = 74, by = 92; lingkaran(g, bx, by + 5, 6, "#b07a4f", true); lingkaran(g, bx, by - 2, 4.6, "#b07a4f", true); lingkaran(g, bx - 3.6, by - 5.6, 1.8, "#b07a4f", true); lingkaran(g, bx + 3.6, by - 5.6, 1.8, "#b07a4f", true);
      elips(g, bx, by - .6, 2, 1.4, "#e9c7a6"); lingkaran(g, bx - 1.6, by - 3, .5, "#2a1b12"); lingkaran(g, bx + 1.6, by - 3, .5, "#2a1b12"); lingkaran(g, bx, by - 1, .5, "#2a1b12");
      poligon(g, [[bx - 2.4, by + 1.6], [bx + 2.4, by + 1.6], [bx, by + 3.4]], "#e85d8f");
    } });
    A.sprite.push({ y: 184, gambar: function (g) {
      // tumpukan kado
      hadiahKotak(g, 26, 166, 20, 16, "#ff6b9a", "#ffd166"); hadiahKotak(g, 50, 162, 24, 20, "#6cc3f0", "#ffffff"); hadiahKotak(g, 76, 170, 16, 12, "#7ed6a0", "#ff6b9a");
      hadiahKotak(g, 34, 150, 16, 14, "#b48cf2", "#ffffff"); hadiahKotak(g, 56, 146, 14, 14, "#ffd166", "#e85d8f");
    } });
    A.sprite.push({ y: 102, gambar: function (g) {
      // meja kecil berisi mainan
      bayangan(g, 247, 102, 18, 2.6); bulatIsi(g, 232, 86, 30, 14, 3, "#ffffff", true); kotak(g, 234, 98, 2, 4, "#c98aa3"); kotak(g, 258, 98, 2, 4, "#c98aa3");
      kotak(g, 238, 82, 6, 6, "#ff6b9a"); kotak(g, 245, 83, 5, 5, "#6cc3f0"); kotak(g, 240.5, 77, 5, 5, "#ffd166"); lingkaran(g, 255, 85, 3, "#7ed6a0", true);
    } });
    A.sprite.push({ y: 204, gambar: function (g) {
      // pagar lubang tangga
      for (var y = 108; y < 200; y += 8) kotak(g, 279, y - 10, 1.6, 10, "#ffffff");
      bulatIsi(g, 276, 98, 6, 104, 2.5, "#b07490", true); lingkaran(g, 279, 98, 3, "#c98aa3", true);
    } });
    [[235, 184, 5, 2], [118, 184, 4, 6]].forEach(function (b) { A.sprite.push({ y: b[1], gambar: function (g, t) { kumpulanBalon(g, b[0], b[1], t, b[2], b[3], 30); } }); });
    A.tempat.push({ key: "profil", nama: "Tentang " + (D.nama || "Aku"), x: 12, y: 114, w: 92, h: 26, lx: 56, ly: 64 });
    if (ADA_GALERI) A.tempat.push({ key: "galeri", nama: "Galeri Foto", x: 108, y: 78, w: 120, h: 26, lx: 166, ly: 72 });
    if (ADA_KADO) A.tempat.push({ key: "kado", nama: "Kado", x: 16, y: 180, w: 88, h: 18, lx: 58, ly: 136 });
    A.pindah.push({ x: 286, y: 150, w: 54, h: 48, ke: "lantai1", pos: { x: 312, y: 198, arah: "bawah" }, teks: "Turun ke lantai 1" });
    A.lokasi = "Lantai 2 · Kamar " + (D.nama || "");
    return A;
  }

  /* =====================================================================
     PERMAINAN
     ===================================================================== */
  var SENTUH = !!(window.matchMedia && matchMedia("(pointer:coarse)").matches);
  var ADEGAN = {}, adegan = null, cv, g, S = 3, R = 3, cam = { x: 0, y: 0 }, pemain = null, palet = "";
  var input = { x: 0, y: 0 }, kunci = {}, tahan = null, waktu = 0, modalTerbuka = false, sibuk = false, main = false;
  var kunjungan = {}, terakhir = null, kunciPindah = false, kotakLabel = [], sudahMasuk = false, penutupDitampilkan = false;
  var semuaTempat = [];

  function prarender(A) {
    var c = document.createElement("canvas"); c.width = Math.ceil(A.W * R); c.height = Math.ceil(A.H * R);
    var gg = c.getContext("2d"); gg.scale(R, R); A.lantai(gg); A.gambarLantai = c;
  }
  function ukur() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    S = Math.max(2, Math.min(innerWidth / (T * 8.5), innerHeight / (T * 15))) * dpr;
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
    if (!pemain || modalTerbuka || sibuk || !main) { if (pemain) pemain.jalan = false; return; }
    var vx = input.x, vy = input.y;
    if (kunci.ArrowLeft || kunci.a) vx -= 1; if (kunci.ArrowRight || kunci.d) vx += 1; if (kunci.ArrowUp || kunci.w) vy -= 1; if (kunci.ArrowDown || kunci.s) vy += 1;
    if (!vx && !vy && tahan) {
      var w = keDunia(tahan.x, tahan.y), dx = w.x - pemain.x, dy = w.y - (pemain.y - 8), d = Math.hypot(dx, dy);
      if (d > 4) { vx = dx / d; vy = dy / d; if (d < 16) { vx *= d / 16; vy *= d / 16; } }
    }
    var len = Math.hypot(vx, vy);
    if (len > 1) { vx /= len; vy /= len; len = 1; }
    var cepat = 70 * dt;
    if (len > .08) {
      var nx = pemain.x + vx * cepat, ny = pemain.y + vy * cepat;
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
    if (kunciPindah) return;
    pindahAdegan(z.ke, z.pos, false);
  }
  function pindahAdegan(ke, pos, lama, lalu) {
    sibuk = true; tahan = null; input.x = input.y = 0; kunci = {};
    var tirai = document.getElementById("gelap");
    tirai.classList.toggle("cepat", !lama); tirai.querySelector("p").textContent = lama ? "Ssst… pelan-pelan ya…" : "";
    tirai.classList.add("on");
    setTimeout(function () {
      adegan = ADEGAN[ke]; pemain.x = pos.x; pemain.y = pos.y; pemain.arah = pos.arah; pemain.jalan = false;
      cam.x = pemain.x; cam.y = pemain.y - 10; kunciPindah = true; terakhir = null;
      if (adegan.setPintu) adegan.setPintu(0);
      pemain.topi = adegan.id !== "luar";
      perbaruiHud();
      setTimeout(function () { tirai.classList.remove("on"); sibuk = false; if (lalu) lalu(); }, lama ? 2400 : 120);
    }, lama ? 950 : 380);
  }
  function masukRumah() {
    if (sibuk || modalTerbuka) return;
    sibuk = true; tombolPintu.hidden = true;
    pemain.arah = "atas";
    var mulai = performance.now();
    (function animPintu(t) { var p = Math.min(1, (t - mulai) / 700); ADEGAN.luar.setPintu(p); if (p < 1) requestAnimationFrame(animPintu); else {
      var pertama = !sudahMasuk; sudahMasuk = true;
      pindahAdegan("lantai1", ADEGAN.luar.pindahPintu.pos, true, function () {
        if (pertama) { semburKonfeti(176, 110, 90); kabar("Selamat datang di pesta " + (D.nama || "") + "! 🎉"); }
      });
    } })(mulai);
  }

  /* ---------- konfeti & asap ---------- */
  function semburKonfeti(x, y, n) { for (var i = 0; i < n; i++) konfeti.push({ x: x + (Math.random() - .5) * 30, y: y, vx: (Math.random() - .5) * 140, vy: -60 - Math.random() * 120, r: Math.random() * 6, vr: (Math.random() - .5) * 10, w: WARNA_BALON[i % 6], umur: 2.5 + Math.random() * 1.5, adegan: adegan.id }); }
  function efekPartikel(g, dt) {
    konfeti = konfeti.filter(function (k) { return k.umur > 0; });
    konfeti.forEach(function (k) { k.umur -= dt; if (k.adegan !== adegan.id) return; k.vy += 160 * dt; k.vx *= .98; k.x += k.vx * dt; k.y += k.vy * dt; k.r += k.vr * dt; g.save(); g.translate(k.x, k.y); g.rotate(k.r); g.globalAlpha = Math.min(1, k.umur); kotak(g, -1.4, -.7, 2.8, 1.4, k.w); g.restore(); });
    asap = asap.filter(function (a) { return a.umur > 0; });
    asap.forEach(function (a) { a.umur -= dt; a.y -= 10 * dt; a.x += Math.sin(waktu * 3 + a.p) * 4 * dt; lingkaran(g, a.x, a.y, 1.2 + (2 - a.umur) * 1.4, "rgba(220,220,225," + Math.max(0, a.umur / 2 * .5) + ")"); });
  }
  function tiupLilin() {
    lilinPadam = waktu + 7;
    var n = Math.max(1, Math.min(9, +D.usia || 5));
    for (var j = 0; j < n; j++) { var a = (j / n) * 6.2832 + .4; asap.push({ x: 176 + Math.cos(a) * 8, y: 136 - 33 + Math.sin(a) * 1.7 - 10, umur: 2, p: j }); }
    setTimeout(function () { semburKonfeti(176, 96, 120); kabar("Hore! Selamat ulang tahun, " + (D.nama || "") + "! 🎂"); }, 500);
  }
  var timerKabar;
  function kabar(teks) {
    var lama = document.querySelector(".toast"); if (lama) lama.remove();
    var t = el("div", "toast", esc(teks)); document.body.appendChild(t);
    clearTimeout(timerKabar); timerKabar = setTimeout(function () { t.remove(); }, 3600);
  }

  /* ---------- gambar ---------- */
  function bulat(g, x, y, w, h, r) { jalurBulat(g, x, y, w, h, r); }
  function gambar(dt) {
    if (pemain) {
      var ty = pemain.y - 10;
      if (adegan.id === "luar") { var vh0 = cv.height / S, bias = Math.max(0, Math.min(1, (380 - pemain.y) / 110)) * 120; ty = Math.max(ty - bias, pemain.y + (SENTUH ? 85 : 40) - vh0 / 2); }
      cam.x += (pemain.x - cam.x) * .12; cam.y += (ty - cam.y) * .1;
    }
    var k = kamera(), x0 = k.x0, y0 = k.y0;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = adegan.latar; g.fillRect(0, 0, cv.width, cv.height);
    g.setTransform(S, 0, 0, S, -x0 * S, -y0 * S);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
    g.drawImage(adegan.gambarLantai, 0, 0, adegan.W, adegan.H);
    var daftar = adegan.sprite.slice();
    (adegan.npc || []).forEach(function (o) { daftar.push({ y: o.y, gambar: function (gg, t) { gambarOrang(gg, o, o.x, o.y, t); } }); });
    if (pemain) daftar.push({ y: pemain.y + .01, gambar: function (gg, t) { gambarOrang(gg, pemain, pemain.x, pemain.y, t); } });
    daftar.sort(function (a, b) { return a.y - b.y; });
    daftar.forEach(function (s) { s.gambar(g, waktu); });
    if (adegan.efek) adegan.efek(g, waktu);
    efekPartikel(g, dt);
    // label (ukuran layar)
    g.setTransform(1, 0, 0, 1, 0, 0);
    kotakLabel = [];
    if (!main) return;
    var px = Math.round(Math.max(14 * (cv.width / innerWidth), S * 4.6)), dekat = pemain ? tempatDekat() : null;
    g.font = "600 " + px + "px Fredoka, Nunito, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    adegan.tempat.forEach(function (tp) {
      var sudah = kunjungan[tp.key], disini = dekat === tp;
      var sx = (tp.lx - x0) * S, sy = (tp.ly - y0) * S + (sudah && !disini ? 0 : Math.sin(waktu * 3 + tp.lx) * S * .9);
      var teks = tp.nama, tw = g.measureText(teks).width, ik = sudah ? px * 1.05 : 0, w = tw + ik + px * 1.6, h = px * 2;
      var x = sx - w / 2, y = sy - h / 2, warna = "#e85d8f";
      g.shadowColor = "rgba(0,0,0,.28)"; g.shadowBlur = px * .6; g.shadowOffsetY = px * .18;
      g.fillStyle = sudah ? "#fffaf5" : warna; bulat(g, x, y, w, h, h / 2); g.fill();
      g.shadowColor = "transparent"; g.shadowBlur = 0; g.shadowOffsetY = 0;
      g.lineWidth = Math.max(2, px * .16); g.strokeStyle = sudah ? warna : "rgba(255,250,245,.9)"; bulat(g, x + g.lineWidth / 2, y + g.lineWidth / 2, w - g.lineWidth, h - g.lineWidth, h / 2); g.stroke();
      if (!sudah) poligon(g, [[sx - px * .45, y + h - 1], [sx + px * .45, y + h - 1], [sx, y + h + px * .55]], warna);
      if (sudah) { var cx = x + px * .8 + ik / 2; lingkaran(g, cx, sy, ik * .45, warna); g.strokeStyle = "#fffaf5"; g.lineWidth = Math.max(1.5, px * .13); g.beginPath(); g.moveTo(cx - ik * .2, sy); g.lineTo(cx - ik * .04, sy + ik * .17); g.lineTo(cx + ik * .22, sy - ik * .17); g.stroke(); }
      g.fillStyle = sudah ? warna : "#fffaf5"; g.fillText(teks, sx + ik / 2, sy + px * .06);
      if (disini && sudah && !modalTerbuka) { g.font = "500 " + Math.round(px * .78) + "px Fredoka, Nunito, sans-serif"; g.fillStyle = "rgba(255,250,245,.95)"; g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = px * .4; g.fillText("ketuk untuk membuka", sx, y - px * .7); g.shadowColor = "transparent"; g.shadowBlur = 0; g.font = "600 " + px + "px Fredoka, Nunito, sans-serif"; }
      kotakLabel.push({ tp: tp, x: x, y: y, w: w, h: h });
    });
    // petunjuk tangga / pintu keluar
    adegan.pindah.forEach(function (p) {
      if (!p.teks || !pemain || Math.hypot(pemain.x - (p.x + p.w / 2), pemain.y - (p.y + p.h / 2)) > 46) return;
      var sx = (p.x + p.w / 2 - x0) * S, sy = (p.y + (p.y < 120 ? -2 : p.h + 10) - y0) * S;
      g.font = "500 " + Math.round(px * .8) + "px Fredoka, Nunito, sans-serif"; g.fillStyle = "#fffaf5"; g.shadowColor = "rgba(0,0,0,.7)"; g.shadowBlur = px * .5; g.fillText(p.teks, sx, sy); g.shadowColor = "transparent"; g.shadowBlur = 0;
    });
    // tombol Open di depan pintu
    var dp = cv.width / innerWidth;
    if (diPintu() && !sibuk && !modalTerbuka) { tombolPintu.hidden = false; tombolPintu.style.left = ((adegan.pintu.ax - x0) * S / dp) + "px"; tombolPintu.style.top = ((adegan.pintu.ay - y0) * S / dp) + "px"; }
    else tombolPintu.hidden = true;
  }
  var lalu = 0;
  function putar(t) {
    var dt = Math.min(.05, (t - lalu) / 1000 || 0); lalu = t; waktu += dt;
    gerak(dt); gambar(dt);
    requestAnimationFrame(putar);
  }

  /* ---------- jendela (modal) ---------- */
  var modal, panel, isi, tutupBtn, aksiTutup = null, tombolPintu;
  function bukaModal(html, kelas, saatTutup) {
    isi.innerHTML = ""; panel.className = "panel " + (kelas || "");
    if (typeof html === "string") isi.innerHTML = html; else isi.appendChild(html);
    isi.scrollTop = 0; modal.hidden = false; modalTerbuka = true; input.x = input.y = 0; tahan = null; kunci = {}; aksiTutup = saatTutup || null;
    setTimeout(function () { (panel.classList.contains("wajib") ? isi.querySelector("button") : tutupBtn).focus({ preventScroll: true }); }, 60);
  }
  function tutupModal() {
    if (modal.hidden) return;
    modal.hidden = true; modalTerbuka = false; clearInterval(timerHitung);
    var a = aksiTutup; aksiTutup = null; if (a) a();
  }
  function bukaTempat(key) {
    kunjungan[key] = true; perbaruiHud();
    var isiTempat = ISI[key](); bukaModal(isiTempat, "tempat-" + key, function () {
      if (!penutupDitampilkan && semuaTempat.every(function (k) { return kunjungan[k]; })) { penutupDitampilkan = true; setTimeout(penutup, 400); }
    });
  }
  var timerHitung;
  var ISI = {
    surat: function () {
      return '<div class="kicker">Surat undangan</div><h2>Kamu Diundang! 💌</h2>' +
        '<p>Kepada <b>' + esc(namaTamu || "Tamu Istimewa") + '</b>,</p><p>' + esc(D.pesan || "") + '</p>' +
        '<div class="info"><div class="besar">Ulang Tahun ke-' + esc(D.usia) + '</div><div class="jam">' + esc(D.namaLengkap || D.nama) + '</div><div class="tempat">' + esc(tglPanjang()) + '</div></div>' +
        '<p class="catatan">Ayo jalan ke pintu rumah lalu tekan <b>Open</b>. Kuenya sudah menunggu di dalam! 🎂</p>';
    },
    kue: function () {
      var w = el("div");
      w.innerHTML = '<div class="kicker">Pesta ulang tahun ke-' + esc(D.usia) + '</div><h2>' + esc(D.nama) + '</h2>' +
        '<div class="info"><div class="besar">' + esc(tglPanjang()) + '</div><div class="jam">Pukul ' + esc(D.jamMulai) + (D.jamSelesai ? ' – ' + esc(D.jamSelesai) : '') + ' ' + esc(D.zonaWaktu || "") + '</div>' +
        (D.tempat ? '<div class="tempat">' + esc(D.tempat) + '</div>' : '') + (D.alamat ? '<div class="alamat">' + esc(D.alamat) + '</div>' : '') + '</div>' +
        '<div class="hitung" id="hitung"></div>' +
        (D.pakaian ? '<p class="catatan">Dress code: <b>' + esc(D.pakaian) + '</b></p>' : '') +
        '<div class="baris-tombol">' + (D.peta ? '<a class="tombol ungu kecil" target="_blank" rel="noopener" href="' + esc(D.peta) + '">📍 Lihat Lokasi</a>' : '') +
        '<a class="tombol garis kecil" target="_blank" rel="noopener" href="' + esc(linkKalender()) + '">📅 Simpan Tanggal</a></div>' +
        '<h3>Ayo tiup lilinnya!</h3><div class="baris-tombol"><button type="button" class="tombol" id="tiup">🎂 Tiup Lilin</button></div>';
      w.querySelector("#tiup").addEventListener("click", function () { tutupModal(); tiupLilin(); });
      var h = w.querySelector("#hitung");
      function hitung() {
        var s = Math.max(0, Math.floor((tglAcara() - new Date()) / 1000));
        if (!s) { h.innerHTML = '<p class="catatan">Pestanya sudah dimulai! 🎉</p>'; return; }
        h.innerHTML = [[Math.floor(s / 86400), "Hari"], [Math.floor(s % 86400 / 3600), "Jam"], [Math.floor(s % 3600 / 60), "Menit"], [s % 60, "Detik"]].map(function (x) { return '<div><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join("");
      }
      hitung(); clearInterval(timerHitung); timerHitung = setInterval(hitung, 1000);
      return w;
    },
    bukutamu: function () {
      var w = el("div");
      w.innerHTML = '<div class="kicker">Buku tamu</div><h2>Ucapan & Kehadiran</h2><p>Tulis doa dan ucapan untuk ' + esc(D.nama) + ', ya!</p>' +
        '<form class="rsvp"><label>Nama<input name="nama" required maxlength="60"></label>' +
        '<label>Kehadiran<select name="hadir"><option value="Hadir">Hadir 🎉</option><option value="Tidak hadir">Maaf, tidak bisa hadir</option><option value="Belum pasti">Belum pasti</option></select></label>' +
        '<label>Jumlah orang<select name="jumlah"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></label>' +
        '<label>Ucapan & doa<textarea name="ucapan" required maxlength="400"></textarea></label>' +
        '<button class="tombol" type="submit">Kirim Ucapan</button></form><div class="ucapan-list"></div>';
      var f = w.querySelector("form"), list = w.querySelector(".ucapan-list");
      f.nama.value = namaTamu || "";
      function tampil(arr) { list.innerHTML = arr.slice().reverse().map(function (u) { return '<div><b>' + esc(u.nama) + '</b><small>' + esc(u.hadir) + '</small><p>' + esc(u.ucapan) + '</p></div>'; }).join(""); }
      tampil(ambilUcapan());
      if (D.scriptUrl) fetch(D.scriptUrl).then(function (r) { return r.json(); }).then(function (arr) { if (Array.isArray(arr)) tampil(arr); }).catch(function () {});
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var u = { nama: f.nama.value.trim(), hadir: f.hadir.value, jumlah: f.jumlah.value, ucapan: f.ucapan.value.trim(), waktu: new Date().toISOString() };
        var arr = ambilUcapan(); arr.push(u); try { localStorage.setItem(kunciUcapan, JSON.stringify(arr)); } catch (er) {}
        if (D.scriptUrl) { var fd = new FormData(); Object.keys(u).forEach(function (k) { fd.append(k, u[k]); }); fetch(D.scriptUrl, { method: "POST", body: fd, mode: "no-cors" }).catch(function () {}); }
        tampil(arr); f.ucapan.value = ""; kabar("Terima kasih atas ucapannya! 💖");
      });
      return w;
    },
    profil: function () {
      var w = el("div");
      w.innerHTML = '<div class="kicker">Yang berulang tahun</div>' + (D.foto ? '<img class="foto-profil" alt="" src="' + esc(D.foto) + '">' : '<canvas class="foto-profil" width="300" height="300"></canvas>') +
        '<h2>' + esc(D.namaLengkap || D.nama) + '</h2>' + (D.usia ? '<div class="info"><div class="besar">' + esc(D.usia) + ' tahun 🎈</div>' + (D.anakDari ? '<div class="alamat">' + esc(D.anakDari) + '</div>' : '') + '</div>' : '') +
        (D.tentang ? '<p>' + esc(D.tentang) + '</p>' : '');
      var c = w.querySelector("canvas"); if (c) potretOrang(c, D.jenis === "laki-laki" ? "ultahL" : "ultahP", true);
      return w;
    },
    galeri: function () {
      var w = el("div");
      w.innerHTML = '<div class="kicker">Kenangan</div><h2>Galeri Foto</h2><div class="galeri">' + (D.galeri || []).map(function (s) { return '<img loading="lazy" alt="" src="' + esc(s) + '">'; }).join("") + '</div>';
      w.querySelectorAll(".galeri img").forEach(function (im) { im.addEventListener("click", function () { var v = el("div", "lihat-foto", '<img alt="" src="' + esc(im.getAttribute("src")) + '">'); v.addEventListener("click", function () { v.remove(); }); document.body.appendChild(v); }); });
      return w;
    },
    kado: function () {
      var w = el("div");
      w.innerHTML = '<div class="kicker">Tanda kasih</div><h2>Kado 🎁</h2><p>Doa dan kehadiranmu sudah lebih dari cukup. Bila ingin mengirim kado, bisa lewat:</p>' +
        (D.hadiah || []).map(function (h) { return '<div class="info rek"><div><b>' + esc(h.bank) + '</b><span class="no">' + esc(h.nomor) + '</span><div class="alamat">a.n. ' + esc(h.atasNama) + '</div></div><button type="button" class="tombol kecil" data-salin="' + esc(h.nomor) + '">Salin</button></div>'; }).join("") +
        (D.alamatKado ? '<div class="info"><b>Alamat kirim kado</b><div class="alamat">' + esc(D.alamatKado) + '</div></div>' : '');
      w.querySelectorAll("[data-salin]").forEach(function (b) { b.addEventListener("click", function () { var v = b.getAttribute("data-salin"); (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(function () { b.textContent = "Tersalin ✓"; }, function () { b.textContent = v; }); }); });
      return w;
    }
  };
  var kunciUcapan = "ultah_ucapan_" + (location.pathname || "");
  function ambilUcapan() { try { return JSON.parse(localStorage.getItem(kunciUcapan) || "[]"); } catch (e) { return []; } }
  function linkKalender() {
    var d = tglAcara(), j2 = String(D.jamSelesai || "").split(/[.:]/), e = new Date(d); if (j2[0]) e.setHours(+j2[0], +j2[1] || 0); else e.setHours(d.getHours() + 3);
    function f(x) { return x.getFullYear() + ("0" + (x.getMonth() + 1)).slice(-2) + ("0" + x.getDate()).slice(-2) + "T" + ("0" + x.getHours()).slice(-2) + ("0" + x.getMinutes()).slice(-2) + "00"; }
    return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent("Ulang Tahun " + (D.nama || "")) + "&dates=" + f(d) + "/" + f(e) + "&location=" + encodeURIComponent([D.tempat, D.alamat].filter(Boolean).join(", "));
  }

  /* ---------- alur awal ---------- */
  var namaTamu = "";
  try { namaTamu = (new URLSearchParams(location.search).get("to") || "").trim().slice(0, 60); } catch (e) {}

  function pilihTokoh() {
    var w = el("div", null, '<div class="kicker">Sebelum berangkat</div><h2>Pilih tokohmu</h2><div class="pilih-tokoh"></div>');
    [["L", "Laki-laki"], ["P", "Perempuan"]].forEach(function (p) {
      var b = el("button", "kartu-tokoh", '<canvas width="192" height="256"></canvas><span>' + p[1] + '</span>'); b.type = "button";
      potretOrang(b.querySelector("canvas"), p[0]);
      b.addEventListener("click", function () { palet = p[0]; tutupModal(); });
      w.querySelector(".pilih-tokoh").appendChild(b);
    });
    bukaModal(w, "wajib", function () { if (!palet) palet = "L"; mulaiMain(); });
  }
  function mulaiMain() {
    pemain = { x: adegan.awal.x, y: adegan.awal.y, arah: "atas", jalan: false, anim: 0, palet: palet };
    potretOrang(document.getElementById("avatar"), palet, true);
    bukaModal('<div class="kicker">Selamat datang</div><h2>Hai, ' + esc(namaTamu || "teman") + '! 👋</h2>' +
      '<p>' + esc(D.nama) + ' akan merayakan ulang tahun ke-' + esc(D.usia) + '. Yuk jalan melewati halaman sampai ke pintu rumah, lalu tekan <b>Open</b>!</p>' +
      '<p class="catatan">Cara berjalan: tekan & tahan kursor (atau jari) di layar ke arah tujuan, geser joystick, atau pakai tombol panah / WASD. Di dalam rumah ada tangga ke lantai 2.</p>' +
      '<div class="baris-tombol"><button type="button" class="tombol">Ayo jalan!</button></div>', "wajib", function () {
        main = true; document.body.classList.add("main"); perbaruiHud();
        petunjuk.hidden = false; setTimeout(function () { petunjuk.hidden = true; }, 6000);
      });
    isi.querySelector(".tombol").addEventListener("click", tutupModal);
  }
  function penutup() {
    bukaModal('<div class="kicker">Terima kasih</div><h2>Sampai jumpa di pesta! 🎈</h2><p>' + esc(D.penutup || "") + '</p><div class="ttd"><span class="catatan">Salam hangat,</span><br>' + esc(D.pengundang || "") + '</div>' +
      '<div class="baris-tombol"><button type="button" class="tombol">Lanjut jalan-jalan</button></div>');
    isi.querySelector(".tombol").addEventListener("click", tutupModal);
  }
  function perbaruiHud() {
    var sisa = semuaTempat.filter(function (k) { return !kunjungan[k]; }).length;
    var s = document.getElementById("hudSisa"); if (!s) return;
    s.textContent = adegan.lokasi + " · " + (sisa ? sisa + " tempat belum dikunjungi" : "semua sudah dikunjungi ✓");
  }

  var petunjuk;
  function pasangKontrol() {
    var joy = el("div", "joy", '<div class="knob"></div>'), knob = joy.firstChild, aktif = null;
    document.body.appendChild(joy);
    petunjuk = el("div", "petunjuk", "Tahan kursor di layar ke arah tujuan, atau geser lingkaran ini"); petunjuk.hidden = true; document.body.appendChild(petunjuk);
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
    // tahan kursor/jari di peta: tokoh berjalan ke arah kursor selama ditahan
    cv.addEventListener("pointerdown", function (e) {
      if (!pemain || modalTerbuka || !main) return;
      var dp = cv.width / innerWidth, px = e.clientX * dp, py = e.clientY * dp, kena = null;
      kotakLabel.forEach(function (k) { if (px >= k.x - 6 && px <= k.x + k.w + 6 && py >= k.y - 6 && py <= k.y + k.h + 6) kena = k.tp; });
      if (kena && tempatDekat() === kena) { bukaTempat(kena.key); return; }
      petunjuk.hidden = true;
      tahan = { id: e.pointerId, x: e.clientX, y: e.clientY }; try { cv.setPointerCapture(e.pointerId); } catch (er) {}
    });
    cv.addEventListener("pointermove", function (e) { if (tahan && e.pointerId === tahan.id) { tahan.x = e.clientX; tahan.y = e.clientY; } });
    function lepasTahan(e) { if (tahan && e.pointerId === tahan.id) tahan = null; }
    cv.addEventListener("pointerup", lepasTahan); cv.addEventListener("pointercancel", lepasTahan); cv.addEventListener("lostpointercapture", lepasTahan);
    addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hidden && !panel.classList.contains("wajib")) { tutupModal(); return; }
      var tag = (e.target || {}).tagName || "";
      if (modalTerbuka || /^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
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
    document.title = "Ulang Tahun ke-" + (D.usia || "") + " " + (D.nama || "");
    cv = el("canvas", "dunia"); cv.setAttribute("role", "img"); cv.setAttribute("aria-label", "Halaman dan rumah tempat pesta ulang tahun " + (D.nama || ""));
    document.body.appendChild(cv); g = cv.getContext("2d");
    var dpr0 = Math.min(window.devicePixelRatio || 1, 2);
    R = Math.max(3, Math.min(4, Math.ceil(Math.max(2, Math.min(innerWidth / (T * 8.5), innerHeight / (T * 15))) * dpr0)));
    ADEGAN.luar = buatLuar(); ADEGAN.lantai1 = buatLantai1(); ADEGAN.lantai2 = buatLantai2();
    Object.keys(ADEGAN).forEach(function (k) { prarender(ADEGAN[k]); ADEGAN[k].tempat.forEach(function (t) { semuaTempat.push(t.key); }); });
    adegan = ADEGAN.luar; cam.x = 240; cam.y = 520;
    ukur(); addEventListener("resize", ukur);

    // HUD, musik, jendela, tombol pintu, layar gelap
    document.body.appendChild(el("div", "hud", '<canvas id="avatar" width="96" height="96" aria-hidden="true"></canvas><div class="hud-judul"><b>Ulang Tahun ke-' + esc(D.usia) + ' ' + esc(D.nama) + '</b><small id="hudSisa"></small></div>'));
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
    tombolPintu = el("button", "tombol tombol-pintu", '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 21V3h11v2H6v14h9v2zm11.5-4-1.4-1.45L16.65 13H9v-2h7.65l-2.55-2.55L15.5 7l5 5z"/></svg>Open');
    tombolPintu.type = "button"; tombolPintu.hidden = true; tombolPintu.addEventListener("click", masukRumah); document.body.appendChild(tombolPintu);
    document.body.appendChild(el("div", "gelap", "<p></p>")).id = "gelap";
    pasangKontrol();

    // sampul
    var sampul = el("div", "sampul",
      '<div class="kartu-sampul"><div class="kecil">Undangan ulang tahun</div><div class="nama">' + esc(D.nama) + '</div>' +
      (D.usia ? '<div class="usia"><small>ke-</small>' + esc(D.usia) + '</div><br>' : '') + '<div class="tgl">' + esc(tglPendek()) + '</div></div>' +
      '<div class="tamu"><small>Kepada Yth.</small><strong>' + esc(namaTamu || "Tamu Istimewa") + '</strong></div>' +
      '<button type="button" class="tombol" id="bukaUndangan">Buka Undangan</button>');
    for (var i = 0; i < 9; i++) { var b = el("span", "balon-sampul"); b.style.left = (5 + i * 11) + "%"; b.style.background = WARNA_BALON[i % 6]; b.style.animationDuration = (9 + (i % 4) * 2.5) + "s"; b.style.animationDelay = (-i * 1.7) + "s"; sampul.appendChild(b); }
    document.body.appendChild(sampul);
    sampul.querySelector("#bukaUndangan").addEventListener("click", function () {
      sampul.classList.add("buka"); if (window.__musik) window.__musik();
      setTimeout(function () { sampul.remove(); pilihTokoh(); }, 700);
    });
    requestAnimationFrame(putar);
    // untuk pengujian otomatis
    window.__ultah = { pemain: function () { return pemain; }, adegan: function () { return adegan.id; }, ke: function (id, x, y) { pindahAdegan(id, { x: x, y: y, arah: "atas" }, false); } };
  }
  function siap() {
    var jalan = false; function go() { if (!jalan) { jalan = true; mulai(); } }
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load("700 20px Fredoka"), document.fonts.load("600 20px Fredoka")]).then(go, go);
    setTimeout(go, 2500);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", siap); else siap();
})();
