# Undangan Ulang Tahun — Jalan-jalan ke Rumah

Undangan online berupa permainan kecil: tamu berjalan dari trotoar, melewati halaman berumput dan berbunga,
sampai ke pintu rumah. Di depan pintu muncul tombol **Open**: pintu terbuka, layar gelap beberapa detik,
lalu tamu sudah berada di dalam rumah dengan kue ulang tahun, lilin menyala, dan balon. Rumahnya bertingkat:
tangga di kanan ruang pesta naik ke lantai 2 (kamar, dinding foto, tumpukan kado).

Tidak ada jalan otomatis. Tokoh hanya bergerak bila tamu:
- menekan & menahan kursor (atau jari) di layar ke arah tujuan,
- menggeser joystick di kiri bawah, atau
- memakai tombol panah / WASD. Enter atau spasi = buka tempat / pintu di dekat tokoh.

## Tempat yang bisa dikunjungi
| Tempat | Letak | Isi |
|---|---|---|
| Surat Undangan | kotak surat dekat pagar | sapaan & pesan undangan |
| Kue Ulang Tahun | lantai 1 | tanggal, jam, lokasi, hitung mundur, tombol **Tiup Lilin** |
| Buku Tamu | lantai 1 | ucapan & konfirmasi kehadiran |
| Tentang (nama) | lantai 2, tempat tidur | profil yang berulang tahun |
| Galeri Foto | lantai 2, dinding foto | muncul bila `galeri` diisi |
| Kado | lantai 2, tumpukan kado | muncul bila `hadiah` / `alamatKado` diisi |

Tempat terbuka sendiri pada kunjungan pertama; setelah itu ketuk labelnya saat berdiri di dekatnya.

## Mengubah isi
Ubah `data.js` saja (nama, usia, tanggal, jam, tempat, alamat, foto, galeri, rekening, musik).
Foto & musik taruh di folder `assets/`. Nama tamu diambil dari link: `index.html?to=Nama%20Tamu`.

## Struktur
- `index.html` — halaman undangan
- `data.js` — isi undangan
- `mesin/rumah.js` — permainan (semua gambar digambar sendiri dengan canvas, tanpa gambar dari luar)
- `mesin/rumah.css` — tampilan sampul, jendela, tombol
