# Kejutan Ulang Tahun — Jalan-jalan ke Rumah (gaya anime)

Halaman kejutan berupa permainan kecil bergaya anime. **Yang berjalan adalah yang berulang tahun**
(pilih tokoh cowok atau cewek). Di dalam rumah sudah menunggu pasangannya (lawan jenis) untuk memberi kejutan.

Alurnya:
1. Halaman depan berisi rumput dan bunga. Di depan rumah ada **kotak surat** berisi surat yang diketik lewat admin.
2. Di pintu muncul tombol **Open**: pintu terbuka, layar gelap beberapa detik, lalu lampu menyala dan si dia teriak **SURPRISE!**
   dengan konfeti, lalu menyampaikan pesannya.
3. Di depan **kue** (lilin angka sesuai usia): yang berulang tahun menulis wish, memejamkan mata, hitung mundur **3… 2… 1…**, lalu meniup lilin sampai padam.
4. **Lantai 2** (naik tangga di kanan): dinding foto dan kado besar berisi pesan terakhir + foto.

Tidak ada jalan otomatis. Tokoh hanya bergerak bila kursor/jari ditahan ke arah tujuan, joystick digeser, atau tombol panah / WASD ditekan.

## Mengubah isi: halaman admin
Buka `https://purwoadhii.github.io/ultah/admin/`, masuk dengan **fine-grained token** GitHub
(Repository access: repo ini saja, Permissions → Contents: Read and write). Isi surat, pesan, wish, foto, dan musik, lalu Simpan.
GitHub Pages butuh sekitar 1 menit untuk memperbarui; tekan Ctrl+F5 setelahnya.

## Struktur
- `index.html` — halaman kejutan
- `data.js` — isi kejutan (ditulis oleh admin)
- `admin/index.html` — halaman admin
- `mesin/rumah.js` — permainan (semua gambar digambar sendiri dengan canvas)
- `mesin/rumah.css` — tampilan sampul, dialog, adegan tiup lilin
- `assets/` — foto & musik yang diunggah lewat admin
