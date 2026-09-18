# Nivora Music System — Setup & Seeding Guide

This guide describes how to populate and maintain the local Nivora music library with legally approved Creative Commons and Public Domain audio tracks.

---

## Directory Structure

Downloaded tracks and metadata are organized cleanly within the project root:

```
NIVORA-NEW/
├── nivora-music/                  # Primary local audio storage
│   ├── library.json               # Master catalog of seeded tracks & metadata
│   ├── focus/                     # Deep focus, coding, and concentration
│   ├── lofi/                      # Lo-fi beats, jazz, and downtempo
│   ├── ambient/                   # Drone, synth pads, and space ambiance
│   ├── classical/                 # Orchestral, piano sonatas, and concertos
│   ├── nature/                    # Rain, ocean waves, and birdsong
│   ├── binaural/                  # 40Hz Gamma, 10Hz Alpha, 6Hz Theta carriers
│   └── campus/                    # University carillons, organ sonatas, chimes
└── public/
    └── music/                     # Static mirror for zero-latency local playback
```

---

## Available Commands

### 1. Fresh Music Seed (`npm run music:seed`)

Populates the library from scratch or fills any missing categories up to their target counts:

```bash
npm run music:seed
```

**What it does:**
1. Verifies that all 7 category directories exist (`focus`, `lofi`, `ambient`, `classical`, `nature`, `binaural`, `campus`).
2. Queries approved APIs (Wikimedia Commons, ccMixter, and internal neuro-acoustic generator) for legally permissible audio files.
3. Performs duplicate checks (filename, source ID, and SHA-256 binary hash).
4. Validates audio file headers (MP3, OGG, WAV) and confirms file integrity.
5. Saves downloaded audio to `nivora-music/<category>/<safe-filename>.mp3` and mirrors to `public/music/<category>/`.
6. Generates `nivora-music/library.json` with full metadata and license deeds.
7. Outputs an automated summary report.

### 2. Incremental Update (`npm run music:update`)

Checks for new tracks, skips already satisfied categories, and preserves existing files:

```bash
npm run music:update
```

**What it does:**
- Inspects existing files in `nivora-music/` and records in `library.json`.
- Skips any categories that already meet or exceed target track counts.
- Fetches only newly required permitted tracks for under-filled categories.
- Ensures zero overwriting or deletion of previously downloaded music.

---

## Example Console Output

```
====================================================
🎶 Starting Nivora Music Seeder [SEED MODE]
====================================================

📁 Category: [FOCUS] — Have: 0, Target: 10, Needed: 10
   Found 16 legal candidates from approved APIs
   ⬇ Downloading: "Exotic Battle" by Kevin MacLeod
     License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0)
     ✓ Success: Saved to nivora-music/focus/exotic-battle.mp3 (6.55 MB)

...

====================================================
Music Seed Complete
====================================================
Downloaded: 55
Skipped: 0
Failed: 0

Focus: 10
Lo-Fi: 10
Ambient: 10
Classical: 10
Nature: 10
Binaural: 10
Campus: 5
----------------------------------------------------
Total Library Tracks: 55
Completed in 18.2s
Library file generated at: nivora-music\library.json
====================================================
```

---

## Audio Player & Nivora UI Integration

All seeded tracks are instantly integrated into the Nivora Student Operating System:
- **Music Home (`/music`)**: Seeded tracks appear under their respective categories, featured playlists, and study mixes.
- **Search**: Users can search by title, composer, artist, or genre in the top search bar.
- **Music Library Manager**: Displays imported and seeded tracks with source tags, license badges, duration, and file size.
- **Bottom Player Dock**: Tracks stream seamlessly from `/music/<category>/<filename>` with HTTP 206 Partial Content support (allowing instantaneous seeking, progress bar scrubbing, and volume control).
- **Playlists & Favorites**: Any seeded track can be added to custom user playlists or liked.

---

## Environment Variables (Optional)

The seeder operates with zero mandatory API keys using public open-access endpoints. However, if you wish to configure optional custom services:

```env
# Optional Supabase integration for cloud audio backup
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Base URL (default is http://localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
