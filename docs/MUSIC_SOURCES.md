# Nivora Music System — Approved Legal Audio Sources

This document provides complete legal, licensing, and API documentation for all audio sources used by the automated **Nivora Music Seeder**.

---

## Legal & Compliance Statement

Nivora operates under strict open-access, royalty-free, and Creative Commons legal compliance:
- **No scraping of prohibited website pages** (e.g. Pixabay, SoundCloud).
- **No bypass of CAPTCHAs, rate-limits, anti-bot mechanisms, paywalls, or authentication**.
- **No YouTube downloading or Spotify stream ripping**.
- **No commercial copyrighted music**.
- **Every track** downloaded or imported possesses verified license documentation, attribution links, and official source URLs stored in `nivora-music/library.json`.

---

## Approved Audio Sources

### 1. Wikimedia Commons MediaWiki API

- **Source Name**: Wikimedia Commons (Wikimedia Foundation)
- **API & Documentation**: [MediaWiki Action API](https://commons.wikimedia.org/w/api.php) • [Commons API Guidelines](https://commons.wikimedia.org/wiki/Commons:API)
- **Primary Use in Nivora**:
  - **Classical**: Masterpiece orchestral and solo recordings (Mozart, Bach, Beethoven, Chopin, Tchaikovsky, Vivaldi) performed by Musopen Symphony, European Chamber Orchestras, and the United States Military Bands.
  - **Nature**: High-resolution acoustic field recordings (rainfall, woodland birdsong, thunderstorms, river streams).
  - **Campus**: Historic university carillons, German glockenspiel chimes, cathedral organ sonatas.
  - **Lo-Fi / Focus / Ambient**: Creative Commons instrumental acoustic studies and downtempo beats.
- **License Types**:
  - Public Domain Mark 1.0 (PD, PD-US, PD-1923, PD-old-70)
  - Creative Commons CC0 1.0 Universal (Public Domain Dedication)
  - Creative Commons Attribution (CC BY 3.0 / CC BY 4.0)
  - Creative Commons Attribution-ShareAlike (CC BY-SA 3.0 / CC BY-SA 4.0)
- **Allowed Usage**: Educational, archival, academic, personal, and commercial reuse permitted under the terms of the respective Creative Commons and Public Domain deeds.
- **Attribution Requirements**:
  - For CC-BY and CC-BY-SA: Artist, composer, license name, and source URL must be credited. Nivora embeds these in `library.json` and renders them in the track information drawer and music library manager.
  - For CC0 and Public Domain: Attribution is not legally required but is preserved as academic courtesy.
- **Automated Downloading Permitted**: **YES**. MediaWiki Action API explicitly welcomes automated, programmatic machine access when using an identified `User-Agent` header (`NivoraStudentOS-MusicSeeder/1.0`).

---

### 2. ccMixter Open Query API

- **Source Name**: ccMixter (ArtisTech Media)
- **API & Documentation**: [ccMixter Query API](https://ccmixter.org/api/query) • [ccMixter Developers](http://ccmixter.org/developers)
- **Primary Use in Nivora**:
  - **Lo-Fi & Chillhop**: Instrumental beats, vinyl-textured chillhop cadences.
  - **Ambient**: Generative electronic pads, atmospheric textures.
  - **Focus**: Acoustic and electronic concentration tracks.
- **License Types**:
  - Creative Commons Attribution (CC BY 3.0 / CC BY 4.0)
  - Creative Commons Attribution-NonCommercial (CC BY-NC 3.0 / 4.0)
- **Allowed Usage**: Sharing, playback, remixing, and listening permitted under Creative Commons licenses.
- **Attribution Requirements**: Track title, producer/creator username, and ccMixter URL must be attributed.
- **Automated Downloading Permitted**: **YES**. ccMixter provides public REST endpoints specifically intended for discovery and retrieval of Creative Commons music without CAPTCHAs.

---

### 3. Nivora Neuro-Acoustic Synthesizer (Open Audio)

- **Source Name**: Nivora Acoustic Labs (In-House Procedural & Carrier Wave Engine)
- **Documentation**: [Nivora Neuro-Acoustic Framework](https://nivora.app/docs/audio/neuro-acoustics)
- **Primary Use in Nivora**:
  - **Binaural**: Mathematically calibrated pure stereo wave files for brainwave entrainment:
    - 40Hz Gamma (Cognitive problem-solving & algorithmic coding)
    - 10Hz Alpha (Relaxed alertness, long-form reading, memory retention)
    - 6Hz Theta (Cognitive reset and deep relaxation)
    - 14Hz SMR Beta (Mathematical precision & cryptography)
    - 8Hz Low-Alpha (Deep thesis writing and conceptual synthesis)
    - 30Hz High-Beta (High-velocity sprint and exam revision)
    - 4Hz Delta (Restorative recovery)
    - 12Hz Alpha (Memory consolidation)
    - 18Hz Beta (Alertness architecture)
    - 432Hz Harmonic Grounding (Acoustic resonance)
- **License**: Creative Commons CC0 1.0 Universal (Public Domain Dedication).
- **Allowed Usage**: 100% unrestricted public domain reuse, modification, and offline playback.
- **Attribution Requirements**: None required; credited to Nivora Acoustic Labs for user clarity.
- **Automated Generation Permitted**: **YES**. Generated mathematically via `scripts/music-seeder/binauralGenerator.ts` using 16-bit PCM 44.1kHz stereo audio encoding.

---

## License Metadata Schema

Every track downloaded and imported into the Nivora library is indexed in `nivora-music/library.json` with the following schema:

```json
{
  "id": "wm-67289891",
  "title": "Audionautix-com-ccby-redwoodtrail",
  "artist": "Jason Shaw",
  "category": "Focus",
  "audio": "/music/focus/audionautix-com-ccby-redwoodtrail.mp3",
  "source": "Wikimedia Commons",
  "sourceUrl": "https://commons.wikimedia.org/wiki/File:Audionautix-com-ccby-redwoodtrail.mp3",
  "audioUrl": "https://upload.wikimedia.org/wikipedia/commons/1/1e/Audionautix-com-ccby-redwoodtrail.mp3",
  "license": "CC BY 3.0",
  "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
  "downloadedAt": "2026-09-18T09:36:03.579Z",
  "localPath": "nivora-music/focus/audionautix-com-ccby-redwoodtrail.mp3",
  "duration": 118,
  "fileSizeBytes": 4741802,
  "fileHash": "d3e4723cb99d10b25af64a5ec65589d2d21eebe759448f2b766684c33b2e9199",
  "artwork": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"
}
```
