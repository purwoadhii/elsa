/* Tempel seluruh isi file ini di Google Sheet: Ekstensi > Apps Script.
   Lalu Deploy > Deployment baru > Jenis: Aplikasi web,
   Jalankan sebagai: Saya, Yang memiliki akses: Siapa saja.
   Salin URL yang berakhiran /exec ke admin, kolom "Link penyimpan tulisan".
   Cek cepat: buka URL /exec itu di browser. Kalau muncul "Berhasil", ada baris tes baru di sheet. */
function tulis(d) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(["Waktu", "Bagian", "Tulisan", "Nama", "Tokoh"]);
  function aman(s) { s = String(s == null ? "" : s).slice(0, 3000); return /^[=+\-@]/.test(s) ? "'" + s : s; }
  sh.appendRow([new Date(), aman(d.bagian), aman(d.teks), aman(d.nama), aman(d.tokoh)]);
}
function doPost(e) {
  tulis(e && e.postData ? JSON.parse(e.postData.contents || "{}") : { bagian: "Tes dari editor", teks: "Tombol Run berhasil menulis ke sheet." });
  return ContentService.createTextOutput("ok");
}
function doGet() {
  tulis({ bagian: "Tes dari browser", teks: "Link /exec sudah benar dan bisa menulis ke sheet." });
  return ContentService.createTextOutput("Berhasil! Cek Google Sheet-mu, ada baris tes baru.");
}
