# SyncPad — Realtime Notepad

A realtime collaborative notepad with password-protected profiles. Text typed or erased syncs live across all browser sessions logged into the same account.

## Features

- 🔐 **Secure profiles** — Email/password authentication via Supabase
- ⚡ **Realtime sync** — Changes appear instantly across all sessions
- 🌙 **Dark theme** — Premium glassmorphism design
- 📱 **Responsive** — Works on desktop and mobile
- 🚀 **Static hosting** — No backend server needed (GitHub Pages)

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL from `sql/setup.sql` in the SQL Editor
3. Enable Realtime for the `notes` table in Database → Replication
4. Update `js/config.js` with your Supabase URL and anon key

### 2. Local Development

```bash
# Serve locally (any static server works)
npx serve .
```

### 3. Deploy to GitHub Pages

Push to GitHub — the included GitHub Action (`.github/workflows/deploy.yml`) will auto-deploy to GitHub Pages.

Or manually: Settings → Pages → Source: "GitHub Actions".

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML/CSS/JS |
| Auth | Supabase Auth |
| Database | Supabase (Postgres + Realtime) |
| Hosting | GitHub Pages |
