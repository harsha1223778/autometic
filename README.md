# EditFlow AI — Automated Video Editing Assistant

[![Next.js 14+](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-000000?style=flat-square&logo=three.js)](https://threejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

**EditFlow AI** is a production-style, responsive, dark-theme 3D web application designed to help users upload videos, edit them manually or automatically, and direct video editing operations through natural-language conversational AI instructions.

---

## Key Features & Editing Modes

### 1. Auto Edit Mode (`/projects/[id]/auto`)
- **Automated Video Intelligence**:
  - Silence detection and dead-air trimming with audio crossfades.
  - Trim intro and outro edge silences.
  - Filler words excision ("um", "uh", hesitation pauses).
  - Automated lower-third and karaoke-style subtitle synchronization.
  - Broadcast audio loudness mastering to **-14 LUFS**.
  - Dynamic background music ducking beneath speech.
  - Scene transition insertion across detected camera cuts.
  - Multiple aspect ratio reframes (`16:9`, `9:16` vertical reels, `1:1` square, `Original`).
  - Style presets: *Professional, Vlog, Podcast, Educational, Cinematic, Social Media*.
- **Live AI Analysis Dashboard**:
  - Detected silent segments, estimated cut count, speaking language, and projected final duration.
- **Editable Operation Timeline & Cloud Render Progress**:
  - Inspect proposed operations before rendering.
  - Real-time simulated render pipeline tracking (0% to 100%) through stages: frame ingest, waveform analysis, scene cut calculation, caption timing, and final MP4 packaging.

### 2. Manual Studio Mode (`/projects/[id]/manual`)
- Professional dark multi-track studio timeline (Video track, Audio track, Subtitle track).
- Draggable playhead scrubber with real-time video playback synchronization.
- Clip split at playhead cursor, trim in/out handles, and segment deletion.
- Audio channel balancing: original dialogue volume slider + mute switch.
- Music library integration: pick from curated tracks with volume slider and fade-in/fade-out curves.
- Subtitle styler: custom font size, text input, color palette, and vertical positioning (bottom, center, top).
- Real-time color grade LUT filters: *Clean Neutral, Warm Sunset, Cool Futuristic, Cinematic Mood, Monochrome Noir*.
- State-managed operations stack with full **Undo** and **Redo** capabilities.
- Live **Edit History** panel presenting every action as persistent JSON.

### 3. AI Video Assistant Mode (`/projects/[id]/assistant`)
- Conversational chat interface for directing edits in plain English.
- Pre-populated prompt chips:
  - *“Make this vlog look professional.”*
  - *“Remove silent parts and add subtitles.”*
  - *“Turn this into a 30-second Instagram Reel.”*
  - *“Add calm background music and clean the audio.”*
  - *“Create short highlights from this podcast.”*
- Streaming AI formulation animation with voice input placeholder.
- Right-side **Generated Editing Plan** deck:
  - Operation icon, title, description, and parameters.
  - Individual enable/disable toggle switches.
  - Edit settings and remove buttons.
  - **Apply This Plan** (triggers rendering job), **Edit Plan Manually** (pre-fills operations into Manual Studio), and **Save as Draft**.

### 4. Rich Creative Ecosystem
- **Projects Management (`/projects`)**: Grid and list views, search by title, status filtering, duplicate, rename, download, and delete confirmation modal.
- **Curated Music Vault (`/music-library`)**: 12 royalty-free tracks categorized by mood (*soft, upbeat, cinematic, energetic, corporate, chill*) with an in-browser HTML5 audio player.
- **Workflow Templates (`/templates`)**: Quick-start recipes for TikTok Reels, YouTube Vlogs, Developer Podcasts, and SaaS Walkthroughs.
- **Studio Settings (`/settings`)**: Profile details, password security, theme selector, cloud storage allocation, and optional OpenAI / Cloudinary API settings.

---

## 3D Design & Visual Aesthetics

- **Hero 3D Canvas (`Hero3DCanvas.tsx`)**: Built with Three.js, React Three Fiber, and Drei. Features floating objects:
  - `FloatingPlayButton` (glassmorphic glowing play wedge)
  - `FloatingFilmReel` (segmented rotating film reel)
  - `FloatingMusicWave` (pulsing audio waveform bars)
  - `FloatingSubtitleCard` (translucent caption strip)
  - `FloatingScissors` (snipping video cutter)
  - `AnimatedOrb` (holographic glowing core with wireframe icosahedron and equatorial ring)
- **Design System**:
  - Palette: Deep canvas navy (`#080B14`), electric violet (`#8B5CF6`), cyan neon (`#06B6D4`), and magenta accents.
  - Translucent glassmorphism panels with thin borders and soft backdrop blurs.
  - Responsive layout across desktop, tablet, and mobile with graceful 2D fallbacks.

---

## Technology Stack

- **Frontend**: Next.js 14+ App Router, React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Recharts, Sonner.
- **3D Graphics**: Three.js, `@react-three/fiber`, `@react-three/drei`.
- **Database & Backend**: Prisma ORM, SQLite (`prisma/dev.db` for instant friction-free local execution; easily switchable to PostgreSQL), Next.js Route Handlers.
- **Authentication**: JWT signed via `jose`, stored in secure HTTP-only cookies, password hashing via `bcryptjs`.
- **Video Processing Engine**: Clean adapter interface (`IVideoProcessor`) with `MockVideoProcessor` for local demos and `FFmpegVideoProcessor` architecture stubs for production clusters.

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+ installed.

### 2. Installation
Clone or navigate to the repository directory and install dependencies:
```bash
npm install --legacy-peer-deps
```

### 3. Database Setup & Seeding
The project comes pre-configured with SQLite for zero-friction local setup.

Initialize the database schema:
```bash
npx prisma db push
```

Seed the database with the demo account, 8 sample video projects, and 12 music tracks:
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Credentials

You can sign in immediately using the pre-seeded demo user:

- **Email**: `demo@editflow.ai`
- **Password**: `Demo@12345`

*(A one-click "Auto-fill Demo Account" button is also provided directly on the `/login` page).*

---

## Environment Variables (`.env`)

```env
# Database Connection (SQLite default, or set to PostgreSQL connection string)
DATABASE_URL="file:./dev.db"

# JWT Secret for authentication cookies
JWT_SECRET="editflow_super_secret_jwt_key_2026_production_style"

# Optional: OpenAI API Key for AI Video Assistant (Intelligent fallback active if empty)
OPENAI_API_KEY=""

# Optional: Cloudinary Storage
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Optional: Redis connection for BullMQ queue
REDIS_URL="redis://localhost:6379"
```

---

## REST API Routes

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Register a new user with bcrypt password hashing |
| `/api/auth/login` | `POST` | Authenticate user and issue HTTP-only JWT cookie |
| `/api/auth/logout` | `POST` | Clear session authentication cookie |
| `/api/auth/me` | `GET` | Get current authenticated user profile |
| `/api/projects` | `GET`, `POST` | List projects (search/sort/filter) or create a new project |
| `/api/projects/:id` | `GET`, `PATCH`, `DELETE` | Retrieve, update, or remove a project |
| `/api/upload/video` | `POST` | Upload video file with MIME validation & thumbnail fallback |
| `/api/projects/:id/analyze` | `POST` | Deep audio and scene analysis diagnostics |
| `/api/projects/:id/edit-plan` | `GET`, `POST` | Fetch or persist JSON edit operations |
| `/api/projects/:id/render` | `POST` | Trigger asynchronous video rendering job |
| `/api/jobs/:id` | `GET`, `PATCH` | Poll rendering job progress (0% - 100%) and stages |
| `/api/ai/edit-plan` | `POST` | Natural-language instructions to structured editing JSON |
| `/api/music` | `GET` | Fetch royalty-free music library filtered by genre |

---

## Production Build & Verification

To verify production build and type-checking:
```bash
npm run build
```
