# Wall Calendar Component

A wall-calendar-style interactive React component built for the TakeUforward Frontend Engineering Challenge.

## Overview

I wanted this to actually feel like a real calendar — not just a date picker dressed up. The reference image had a physical, tactile quality: the spiral binding, the chunky hero image bleeding into the month label, the compact grid below. I tried to translate those physical details into the web version rather than just mimicking the layout abstractly.

## Design Decisions

**Why Georgia serif for the month heading?** Physical wall calendars typically use a mix of bold display type for the month and a cleaner sans-serif for dates. Georgia gives that editorial weight without loading a custom font, which keeps the initial load fast.

**Why `aspect-ratio: 1` on day cells?** Guarantees the grid stays square and consistent across screen sizes without JavaScript measurement tricks.

**The spiral holes** are decorative but intentional — they anchor the "wall calendar" metaphor immediately. Pure CSS, zero cost.

**Notes are scoped** — you can write a monthly note (stored under `month-YYYY-M`) or a date-specific note (stored under `YYYY-M-D`). Both persist in `localStorage`-like state within the session. The toggle is minimal but makes the distinction clear.

**Range selection UX:** First click sets the start date and enters "picking end" mode. Hovering shows a live preview of the range before committing. Second click finalizes. Clicking start again resets. This felt more intuitive than dragging, which breaks on touch.

## Features

- Wall calendar aesthetic with spiral binding
- Monthly hero images (via Unsplash, swapped per month)
- Day range selector with live hover preview
- Per-date and per-month notes
- Indian public holiday markers (dot under date)
- Page flip animation on month navigation
- Fully responsive (stacks vertically on mobile)
- Today highlighted with ring indicator

## Tech Stack

- React 18 (hooks only, no external state library)
- Plain CSS-in-JS via `<style>` tag (no Tailwind/styled-components dependency)
- No backend

## Setup

```bash
# with Vite
npm create vite@latest cal-app -- --template react
cd cal-app
cp WallCalendar.jsx src/
# update src/App.jsx to import and render WallCalendar
npm install && npm run dev
```

## What I'd add with more time

- Drag-select on desktop (mousedown → mouseup range)
- Touch swipe for month navigation
- Export selected range as `.ics` calendar file
- Theme color extracted from the hero image using Canvas API
- Persisted notes via `localStorage`
