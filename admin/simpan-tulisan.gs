/* Tempel seluruh isi file ini di Google Sheet: Ekstensi > Apps Script.
   Lalu Deploy > Deployment baru > Jenis: Aplikasi web,
   Jalankan sebagai: Saya, Yang memiliki akses: Siapa saja.
   Salin URL yang berakhiran /exec ke admin, kolom "Link penyimpan tulisan". */
function doPost(e) {
  var d = JSON.parse(e.postData.contents || "{}");
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(["Waktu", "Bagian", "Tulisan", "Nama", "Tokoh"]);
  function aman(s) { s = String(s == null ? "" : s).slice(0, 3000); return /^[=+\-@]/.test(s) ? "'" + s : s; }
  sh.appendRow([new Date(), aman(d.bagian), aman(d.teks), aman(d.nama), aman(d.tokoh)]);
  return ContentService.createTextOutput("ok");
}
