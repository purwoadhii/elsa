# Kejutan Ulang Tahun — Jalan-jalan ke Rumah (gaya anime)

Halaman kejutan berupa permainan kecil bergaya anime. **Yang berjalan adalah yang berulang tahun**
(pilih tokoh cowok atau cewek). Di dalam rumah sudah menunggu pasangannya (lawan jenis) untuk memberi kejutan.

Alurnya:
1. Mulai dari trotoar jalan besar ("Selamat bermain!"). Rumah biasa dengan taman kecil, pagar, dan **kotak surat** di samping gerbang.
   Tidak ada tombol atau label: pemain mencari dan mengklik sendiri bendanya (harus cukup dekat).
   Pohon besar di halaman bisa diklik: sepucuk surat jatuh, dan surat itu bisa diklik (isi `suratPohon` dari admin).
2. Klik **pintu**: pintu terbuka, layar gelap beberapa detik, lalu lampu menyala dan si dia teriak **SURPRISE!**
   dengan konfeti, lalu menyampaikan pesannya.
   Bangku di bawah pohon bisa diklik: tokoh duduk dan bisa menulis keluh kesah (dibalas teks `balasKeluh`).
   Malam hari: lampu jalan, lampu taman, jendela rumah menyala, kunang-kunang.
3. Ruang tengah temaram. Masuk pertama kali: si dia hanya teriak **SURPRISE!**. Klik **si dia**: ucapan (`pesanKejutan`) + pertanyaan (`tanyaKabar`),
   kamu mengetik jawaban, lalu dia membalas (`balasKabar`). Klik **pot tanaman**: surat berhias daun (`suratPot`).
   Dekati **lilin** di kue cokelat: tulis wish, hitung mundur **3… 2… 1…**, lalu tiup lilin.
4. **Lantai 2 (kamar)**: plafon langit malam; klik kasur (selimut tersingkap, bunga bertuliskan "night"), jendela (melihat halaman yang sama),
   lemari (ganti gaun/jas + `catatanGaun`), foto dinding (`fotoDinding`), foto di meja (bisa dibalik, `fotoMeja` + `tulisanFoto`), remote TV di meja yang sama (video layar penuh, `video`, diunggah lewat admin maks. 25 MB).
   Jendela memperlihatkan halaman, pagar, jalan, dan rumah di seberang.
   Pintu kiri menuju **kamar mandi** kecil: cermin di dinding kiri (titik air, hati + tulisan `tulisanCermin`, bayangan diri samar),
   bak lonjong berisi teka-teki (buka sumbat, air surut, ambil `suratBak`, lalu boleh berendam dengan busa & bebek karet),
   dan tempat sampah: tamu menulis hal yang ingin dibuang & dilupakan, kertas diremas, lalu muncul balasan (`suratSampah`).

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

## Menyimpan tulisan tamu (Google Sheet)
Semua yang diketik di game (wish di lilin, jawaban "bagaimana keadaanmu", keluh kesah di bangku, tulisan di tempat sampah)
dikirim ke Google Sheet lewat Apps Script bila `simpanUrl` diisi di admin. Skripnya ada di `admin/simpan-tulisan.gs`,
langkah pemasangannya ada di admin (bagian "Simpan semua tulisan tamu").
