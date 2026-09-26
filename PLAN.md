# Pelan Video: "Dari GPU ke Token" — AI Tokenization

> Status: **DRAF PELAN** — menunggu pengesahan sebelum produksi.

## 1. Matlamat

Terangkan perjalanan nilai AI dari **sumber perkakasan fizikal** → **GPU-as-a-Service (GPUaaS)** → **Tokenization** (token sebagai unit asas pengiraan, harga dan hasil AI), supaya penonton faham *kenapa* industri beralih daripada menjual "jam GPU" kepada menjual "token".

- **Penonton sasaran (cadangan):** pembuat keputusan bisnes & teknikal (CIO/CTO, pasukan jualan, rakan niaga) — tahu asas IT, bukan pakar ML.
- **Durasi (cadangan):** ~3–4 minit.
- **Bahasa:** Bahasa Melayu (istilah teknikal kekal dalam Bahasa Inggeris), sari kata BM/EN.
- **Format:** 16:9, 1080p, motion-graphics explainer dengan suara latar.

## 2. Naratif (satu ayat)

> "Setiap jawapan AI bermula dengan elektrik dan silikon — dan berakhir sebagai token. Siapa yang menguasai kos setiap token, menguasai ekonomi AI."

## 3. Struktur & Storyboard

| # | Babak | Masa | Mesej utama | Visual |
|---|-------|------|-------------|--------|
| 0 | **Hook** | 0:00–0:15 | "Bila anda tanya AI satu soalan, apa sebenarnya yang anda bayar?" | Prompt ditaip → jawapan dipecah jadi kepingan token berwarna |
| 1 | **Asas Perkakasan** | 0:15–0:50 | AI dibina atas GPU, HBM memory, networking (InfiniBand/NVLink), storan, kuasa & penyejukan dalam data centre | Zoom-out: cip GPU → server (8×GPU) → rak → dewan data centre; kaunter MW kuasa |
| 2 | **Masalah: Mahal & Susah** | 0:50–1:15 | CAPEX tinggi, bekalan GPU terhad, usang cepat (kitaran 12–18 bulan), perlu kepakaran & utilisasi rendah | Timbangan kos: CAPEX vs utilisasi; graf GPU melahu |
| 3 | **GPUaaS** | 1:15–1:55 | Sewa kapasiti GPU ikut keperluan: bare-metal, VM, cluster; bayar per GPU-jam; sovereign/lokal data | Awan menyambung pelanggan ke kluster; meter "RM / GPU-jam" |
| 4 | **Tokenization: Apa itu token?** | 1:55–2:30 | Model LLM membaca & menulis dalam token (~¾ perkataan EN; BM selalunya lebih banyak token). Input token vs output token | Ayat BM dipecah jadi token secara animasi; kaunter token naik |
| 5 | **Dari GPU-jam ke Token** | 2:30–3:10 | Satu GPU-jam → berjuta token. Throughput (tokens/sec), batching, kuantisasi & inference stack menentukan kos per juta token. Model bisnes: Tokens/Model-as-a-Service, API ikut penggunaan | "AI Factory": input elektrik+GPU → output token; formula ringkas: `Kos/token = Kos GPU-jam ÷ Token sejam` |
| 6 | **Kenapa Penting** | 3:10–3:40 | Pelanggan bayar ikut nilai sebenar (token), bukan infra melahu; penyedia optimumkan margin; token = "kWj baharu" ekonomi digital | Tangga nilai: Hardware → GPUaaS → Token/API → Aplikasi |
| 7 | **Penutup / CTA** | 3:40–3:55 | Ringkasan 3 lapisan + CTA (ikut penganjur) | Logo + tagline |

## 4. Draf Skrip Ringkas (Suara Latar)

- **Hook:** "Setiap kali anda bertanya kepada AI, beribu-ribu cip bekerja serentak. Tapi apa sebenarnya yang anda bayar?"
- **Perkakasan:** "Semuanya bermula di sini — GPU. Lapan GPU dalam satu server, puluhan server dalam satu rak, ribuan dalam satu data centre, disambung rangkaian berkelajuan tinggi dan memerlukan megawatt kuasa."
- **Masalah:** "Tapi membeli dan menguruskannya mahal, susah didapati, dan cepat ketinggalan zaman."
- **GPUaaS:** "Maka lahirlah GPU-as-a-Service — anda sewa kuasa pengiraan bila perlu, bayar ikut jam, tanpa bina data centre sendiri."
- **Token:** "Tapi model AI tidak berfikir dalam jam. Ia berfikir dalam *token* — kepingan kecil teks. Setiap soalan ialah token masuk; setiap jawapan ialah token keluar."
- **GPU→Token:** "Satu GPU-jam boleh menghasilkan berjuta-juta token. Semakin cekap sistem, semakin murah setiap token. Inilah 'kilang AI' — elektrik dan silikon masuk, kecerdasan keluar."
- **Kenapa penting:** "Hari ini, token ialah unit baharu ekonomi AI — sama seperti kilowatt-jam untuk elektrik."
- **Penutup:** "Dari perkakasan, ke GPUaaS, ke token. Inilah rantaian nilai AI."

## 5. Pendekatan Produksi (cadangan)

**Pilihan A — Code-driven (Remotion / React), disyorkan**
- Semua babak sebagai komponen animasi dalam repo ini → mudah edit teks, nombor, branding.
- Render ke MP4 terus dalam environment ini.
- Suara latar: TTS (cth. melalui Higgsfield `generate_audio`) atau rakaman sendiri.

**Pilihan B — AI-generated footage (Higgsfield)**
- Klip sinematik (data centre, cip) dijana AI, digabung dengan overlay teks.
- Lebih "wow" tetapi kurang kawalan & ada kos kredit.

**Pilihan C — Hibrid:** B-roll AI untuk Babak 1 (data centre), motion-graphics Remotion untuk babak teknikal (token, formula).

### Struktur repo (Pilihan A)
```
/src
  /scenes     Hook, Hardware, Problem, GPUaaS, Tokens, GpuToToken, WhyItMatters, Outro
  /components TokenChip, Counter, DataCenterZoom, CostFormula
  Root.tsx
/public       audio (voiceover, muzik), logo
/script       skrip.md, sari kata .srt
```

## 6. Fasa Kerja

1. **Pengesahan pelan** (dokumen ini) ← *sekarang*
2. Skrip akhir + sari kata
3. Setup projek Remotion + gaya visual (warna, fon, branding)
4. Bina babak 1–7 + animasi token
5. Suara latar + muzik + penyelarasan masa
6. Render draf → semakan → render akhir MP4

## 7. Perlu Disahkan

1. **Branding:** Neutral atau ikut brand tertentu (cth. TM Global / TM GPUaaS)?
2. **Pendekatan produksi:** A (Remotion), B (AI footage) atau C (hibrid)?
3. **Durasi & bahasa:** 3–4 minit, BM? Atau versi pendek 60s untuk media sosial juga?
4. **Suara latar:** TTS AI, atau rakam sendiri?
5. **Angka contoh:** Guna angka ilustrasi generik, atau ada harga/spesifikasi sebenar (RM/GPU-jam, jenis GPU) yang mahu dipaparkan?
6. **CTA penutup:** Apa tindakan yang mahu penonton ambil?
