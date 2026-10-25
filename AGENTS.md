## Aturan Umum

1. Setiap user meminta commit message, selalu gunakan skill `caveman`
2. Setiap kalo selesai satu task tanya user apakah mau update versi atau tidak, jika update versi maka update `package.json` dan `lock` files, buat branch baru, commit perubahan, publish branch dan merge branch tersebut ke branch development
3. Setiap ada perubahan logic selalu update `PRD.md`
4. Setiap selesai pengerjaan satu task, buatkan juga unit test nya jika belum ada, gunakan `Jest` dan write test function nya juga di `tests` folder, dan update juga `PRD.md`
5. Selalu pastikan seluruh unit test yang ada selalu `pass` sebelum membuat commit
6. Selalu pastikan seluruh `PRD.md` sudah terupdate sesuai dengan perubahan logic
7. Selalu lakukan analisis terlebih dahulu terhadap task yang diterima dan buat Implementation Plan nya sebelum eksekusi
8. Jika user setuju dengan implementation plan yang diberikan, jangan langsung eksekusi kode, tapi baca aturan skill superpowers dibagian `Alur kerja Superpowers` lalu cek skill apa yang masih relevan untuk dijalankan
9. Setiap pengerjaan / perubahan dari sisi UI selalu prioritaskan tampilan mobile sebelum desktop
10. Setiap selesai 1 pengerjaan task/feature selalu buat summary perubahannya di folder `changelogs`, jadi misal saya memberikan task tgl 16-8-2026, maka buat `CHANGELOG_<DD_MM_YYYY>.md` dengan format tanggal `16-08-2026` dan tulis summary perubahannya di bawah tanggal tersebut
11. Selalu prioritaskan untuk membuat unit test terlebih dahulu sebelum membuat commit
12. Selalu update `PRD.md` setelah selesai mengerjakan task
13. Selalu gunakan skill `antislop` ketika akan mengerjakan code, spesifik `antislop-ui` untuk UI/UX, `antislop-layoutmobile` untuk task terkait mobile atau tampilan mobile, `antislop-code` untuk task terkait code comment
14. Pastikan tidak ada security holes, sql injection, xss, dll

## Alur kerja Superpowers

Skill Superpowers biasanya terpanggil otomatis. Jika tidak, **panggil manual lewat Skill tool** sesuai tabel. Jangan lewati skill hanya karena tugas terasa sederhana.

| Situasi                                       | Skill                                        |
| --------------------------------------------- | -------------------------------------------- |
| Fitur baru / ubah perilaku                    | `superpowers:brainstorming`                  |
| Desain disetujui, butuh rencana bertahap      | `superpowers:writing-plans`                  |
| Eksekusi rencana inline                       | `superpowers:executing-plans`                |
| Eksekusi rencana, banyak task independen      | `superpowers:subagent-driven-development`    |
| Tulis fitur / bugfix                          | `superpowers:test-driven-development`        |
| Bug, test gagal, error tak terduga            | `superpowers:systematic-debugging`           |
| Fitur besar, perlu isolasi dari `development` | `superpowers:using-git-worktrees`            |
| Sebelum klaim selesai / commit / PR           | `superpowers:verification-before-completion` |
| Review sebelum merge                          | `superpowers:requesting-code-review`         |
| Branch selesai                                | `superpowers:finishing-a-development-branch` |
| Sesi melenceng / skill tidak terpanggil       | `superpowers:diagnosing-superpowers`         |

Urutan untuk tugas besar: brainstorming → writing-plans → subagent-driven-development → verification-before-completion.

Lewati brainstorming untuk perubahan kecil (typo, satu baris).
