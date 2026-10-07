# azrayaal v4

Portfolio Azra Yazid dengan UI yang meniru home screen PS4. Dibuat dengan Vue 3, TypeScript, dan Vite, lalu di-build menjadi situs statis biasa.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # typecheck + output statis ke dist/
npm run preview
```

`dist/` bisa di-deploy ke static host mana pun (Vercel, Netlify, GitHub Pages, S3). Router memakai hash history (`/#/library`), jadi tidak perlu rewrite rule.

## Kontrol

| Aksi | Keyboard | Controller (DualShock / gamepad) |
| --- | --- | --- |
| Gerak | Panah / WASD | D-pad / stik kiri |
| Pilih | Enter / Space | ✕ |
| Kembali | Esc / Backspace | ○ |
| Informasi | M | OPTIONS |
| Ke home | P / Home | Tombol PS |

Mouse dan sentuhan juga bisa dipakai: klik tile sekali untuk memilih, klik lagi untuk membuka; geser baris tile ke kiri/kanan di layar sentuh; tombol petunjuk di kanan bawah juga bisa diklik.

## Peta layar

| Bagian PS4 | Isi portfolio | Route |
| --- | --- | --- |
| What's New | Pengalaman kerja dan pendidikan | `/whats-new` |
| Tile game | Project unggulan → halaman project ala game hub | `/project/:slug` |
| Library | Semua project, difilter per kategori | `/library` |
| Trophies | Skill sebagai trophy (platinum/gold/silver/bronze sesuai level) | `/trophies` |
| Profile | Bio, career (timeline kerja), statistik, pendidikan | `/profile` |
| Friends | GitHub, LinkedIn, email, WhatsApp | `/friends` |
| Messages | Kirim pesan lewat mailto / WhatsApp | `/messages` |
| Notifications | Ketersediaan, project terbaru, resume | `/notifications` |
| Settings | Efek suara, background bergerak, tema warna | `/settings` |
| Power | Rest mode, log out, restart | dialog |

## Konten

Semua konten ada di `src/data/` (disalin dari v3): `projects.ts`, `skills.ts`, `experience.ts`, `portfolio.ts`, `socials.ts`. Isi baris home, kartu info, dan function bar diatur di `src/data/console.ts`. Ikon dirujuk berdasarkan nama Lucide dan harus didaftarkan di `src/components/Icon.vue`.

Untuk menampilkan project di baris home, set `featured: true` dan `featuredOrder` di `projects.ts`.
# azrayaalv4
