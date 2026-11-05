# Kejutan Ulang Tahun — Jalan-jalan ke Rumah (gaya anime)

Halaman kejutan berupa permainan kecil bergaya anime. **Yang berjalan adalah yang berulang tahun**
(pilih tokoh cowok atau cewek). Di dalam rumah sudah menunggu pasangannya (lawan jenis) untuk memberi kejutan.

Alurnya:
1. Mulai dari trotoar jalan besar ("Selamat bermain!"). Rumah biasa dengan taman kecil, pagar, dan **kotak surat** di samping gerbang.
   Tidak ada tombol atau label: pemain mencari dan mengklik sendiri bendanya (harus cukup dekat).
   Pohon besar di halaman bisa diklik: sepucuk surat jatuh, dan surat itu bisa diklik (isi `suratPohon` dari admin).
2. Klik **pintu**: pintu terbuka, layar gelap beberapa detik, lalu lampu menyala dan si dia teriak **SURPRISE!**
   dengan konfeti, lalu menyampaikan pesannya.
   Bangku di bawah pohon bisa diklik: tokoh duduk dan bisa menulis keluh kesah (dibalas teks `balasKeluh`; tulisan tidak dikirim ke mana-mana).
3. Ruang tengah temaram dengan lampu-lampu kecil. Klik **si dia**: dia bertanya (`tanyaKabar`), kamu mengetik jawaban, lalu dia membalas (`balasKabar`).
   Dekati **lilin** di kue cokelat: tulis wish, pejamkan mata, hitung mundur **3… 2… 1…**, lalu tiup lilin sampai padam.
4. **Lantai 2** masih kosong (akan diisi nanti).

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
