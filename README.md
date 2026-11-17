# Hukum Hooke — Laboratorium Virtual Fisika

**Projek Sains Komputasi Tim G Magister RPL 2026**  
Satria Seto Bhakti, Yeyet Yetia, Yusrina Jaziroh

Simulasi interaktif pegas vertikal berbahasa Indonesia menggunakan HTML, CSS, dan p5.js. Seluruh pustaka tersedia lokal sehingga aplikasi dapat digunakan tanpa internet.

## Menjalankan simulasi

1. Unduh repositori melalui **Code → Download ZIP**, lalu ekstrak.
2. Buka `index.html` di Chrome, Edge, atau Firefox.

Alternatif: unduh `simulasi-pegas.html` sebagai berkas mentah (Raw). Berkas ini sudah memuat pustaka, kode, dan flowchart sehingga dapat dibuka sendiri tanpa berkas tambahan. Paket siap pakai tersedia sebagai `simulasi-pegas-lengkap.zip`.

## Fitur

- Susunan pegas tunggal, seri, dan paralel.
- Osilasi bebas dan tarik statis; parameter kekakuan, massa, simpangan awal, dan redaman.
- Beban dapat diseret naik-turun.
- Tombol Mulai/Jeda, Ulangi, serta Reset ke setimbang.
- Indikator simpangan, gaya pemulih, kecepatan, periode ideal, dan perubahan panjang.
- Grafik simpangan-waktu, gaya pemulih, energi potensial pegas, dan potensial efektif.
- Panduan penggunaan dan gambar flowchart yang dapat dibuka di tab baru.

## Model fisika

Simpangan `x` diukur dari posisi setimbang gravitasi; arah bawah positif. Persamaan gerak adalah `m x'' + b x' + kₑ x = 0`. Animasi menggunakan solusi analitik per langkah untuk redaman kurang, kritis, dan lebih. Penjelasan Euler dalam aplikasi merupakan materi pembanding, bukan metode integrasi animasi.

Perubahan panjang dari panjang alami: `Δℓ = x + mg/kₑ`, dengan `g = 9,81 m/s²`. Energi elastis pegas adalah `½kₑ(Δℓ)²`, sedangkan potensial efektif relatif terhadap setimbang adalah `½kₑx²`. Gambar pegas bersifat skematis.

## Berkas sumber

| Berkas | Fungsi |
| --- | --- |
| `index.html` | Struktur antarmuka |
| `style.css` | Tata letak dan tema |
| `sketch.js` | Animasi p5.js, model fisika, dan interaksi |
| `p5.min.js` | Pustaka p5.js 1.11.11, LGPL-2.1 |
| `flowchart-hukum-hooke.png` | Diagram alur program |
| `package-local.cjs` | Membuat HTML mandiri |
| `verify.cjs` | Pemeriksaan model fisika dan fungsi reset |

Dengan Node.js terpasang, jalankan dari direktori repositori:

```sh
node verify.cjs
node package-local.cjs
```

## GitHub Pages (opsional)

Untuk menayangkan aplikasi sebagai situs, atur **Settings → Pages → Deploy from a branch**, pilih cabang `main` dan direktori `/ (root)`. Halaman masuk adalah `index.html`.

Dokumentasi pustaka: [p5.js](https://p5js.org/reference/).
