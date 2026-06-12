# StreamYT — Design Brief (Glassmorphism Redesign)

Instructions for redesigning the StreamYT frontend with a **glassy / glassmorphism** aesthetic.

## What this app is

A YouTube-style video platform: video feed, watch page with comments/likes, channels with subscribe, playlists, community posts (tweets), a creator studio (upload + stats dashboard), auth pages, and a settings page. React 18 + Vite. All visuals are deliberately plain right now — the structure is final, the look is yours.

## Hard constraints (read first)

1. **CSS-only redesign.** ALL styling lives in one file: `client/src/styles.css`. Components use semantic class names and contain zero styling logic. Do not rename, remove, or restructure class names — components depend on them. You may freely add new rules, custom properties, pseudo-elements, gradients, and keyframes.
2. **Do not edit `.jsx` files** to achieve looks. If something truly can't be done without a wrapper div, flag it instead of changing markup. Two allowed exceptions in `client/index.html`: adding font `<link>`s and `<meta name="theme-color">`.
3. **Keep these functional behaviors intact:**
   - `.sidebar { display: none }` under `768px` (mobile). You may redesign mobile differently (e.g. turn the sidebar into a bottom bar) but something must keep nav reachable.
   - `.spinner` is an animated loading indicator (currently a CSS rotation). Restyle freely but it must visibly animate.
   - `.modal-overlay` must cover the viewport and sit above everything (`z-index`), `.modal` must remain scrollable (`max-height` + `overflow-y`).
   - `.watch-player` and `.video-card-thumb` keep `aspect-ratio: 16 / 9`.
   - `.upload-progress-bar` width is set inline by JS (`style="width: N%"`); style its appearance, not its width.
   - Buttons get `disabled` frequently (pending mutations) — a visible disabled state is required.

## Class inventory (the complete styling surface)

### Shell & layout
| Class | What it is |
|---|---|
| `.app` | Full-height flex column wrapper |
| `.header` | Top bar: logo, search, nav. Prime glassmorphism candidate (sticky + translucent + blur) |
| `.header-logo` / `.header-search` / `.header-nav` / `.header-user` | Logo link, search form (input + button), right-side nav links, avatar+name link |
| `.app-body` | Flex row: sidebar + main |
| `.sidebar` / `.sidebar-nav` | Left nav. Links are `<a>`; the current page gets class `.active` (React Router NavLink) |
| `.main` | Scrollable content column, max-width 1200px |

### Shared UI
| Class | Notes |
|---|---|
| `.avatar` + `.avatar-sm` (32px) / `.avatar-md` (48px) / `.avatar-lg` (80px) | Round user images |
| `.spinner` / `.spinner-fullpage` | Loading states |
| `.message-error` / `.message-success` | Banner alerts |
| `.field-error` | Per-field form error text |
| `.empty-state` | Centered muted text for empty lists |
| `.not-found` | 404 / error page block |
| `.link-button` | Button styled as inline text link (edit/delete/show-more actions) |
| `.image-preview` | Small thumbnail preview in forms |
| `.char-counter` | "123/280" counters under textareas |
| `.pagination` | Prev/Next + "Page X of Y" |
| `.tabs` / `.tab` / `.tab-active` | Channel page tab bar |

### Forms (`.auth-page`, `.form`, `.form-field`, `.form-row`, `.file-info`)
Login/Register/Settings/Upload all use `.form` > `.form-field` (label + input/textarea + error). `.auth-page` is the narrow centered auth card — a great glass panel.

### Video cards & grids
`.video-grid` (responsive auto-fill grid) > `.video-card` > `.video-card-thumb` (img + `.video-card-duration` badge) + `.video-card-info` (avatar + `.video-card-title` / `.video-card-channel` / `.video-card-meta`). Also `.results-header` (title + sort `<select>` on the search page).

### Watch page
`.watch-page` > `.watch-player` (native `<video controls>`), `.watch-title`, `.watch-meta` (views/date + `.watch-actions`: like + save buttons), `.watch-owner` (channel row + subscribe button), `.watch-description` (collapsible).

### Social elements
| Class | Notes |
|---|---|
| `.like-button` / `.like-button-active` | Pill button; active = liked. Also has `aria-pressed` you can target |
| `.subscribe-button` / `.subscribe-button-active` | Solid CTA; active = already subscribed (visually calmer) |
| `.comments-section`, `.comment-form`, `.comment-form-footer`, `.comments-list`, `.comment`, `.comment-body`, `.comment-meta`, `.comment-author`, `.comment-content`, `.comment-actions`, `.comment-edit` | Comment thread; tweets reuse the same comment classes |

### Channel page
`.channel-cover` (wide banner img), `.channel-header` (avatar + name + `.channel-meta`), then `.tabs`.

### Playlists
`.playlist-grid` > `.playlist-card` (+ `.playlist-card-name`) on channel tabs; `.playlist-header`, `.playlist-videos`, `.playlist-video-row`, `.playlist-video-main`, `.playlist-video-thumb` on the playlist detail page.

### Subscriptions page
`.subscription-list` > `.subscription-row` (+ `.subscription-channel`, `.subscription-name`, `.subscription-meta` — the meta class is also reused as generic muted small text in several places).

### Save-to-playlist modal
`.modal-overlay` > `.modal` > `.modal-header`, `.modal-list` > `.modal-list-row` (label with checkbox), `.modal-create` (inline input + button).

### Studio
`.studio-page`, `.studio-header`, `.stats-grid` > `.stat-card` (+ `.stat-value`, `.stat-label`), `.studio-table` (real `<table>`), `.studio-video-cell`, `.studio-actions`, `.upload-progress` (+ `.upload-progress-bar`).

### Settings
`.settings-page` > `.settings-section` (three stacked cards: Profile / Images / Change password).

## Glassmorphism direction

- **Backdrop:** glass only reads against something. Give `body` a rich fixed backdrop — layered mesh gradients or aurora blobs (CSS only, e.g. multiple `radial-gradient`s, optionally slow `@keyframes` drift). Dark-leaning backdrops make glass pop hardest and suit a video app (consider a dark theme as the default).
- **Glass recipe** for surfaces (header, sidebar, cards, modals, `.settings-section`, `.stat-card`, `.auth-page`):
  `background: rgba(255,255,255,0.06–0.12)` (or dark equivalent) + `backdrop-filter: blur(12–20px) saturate(1.4)` + `border: 1px solid rgba(255,255,255,0.12–0.2)` + soft large shadow + radius 12–20px. A subtle top-edge highlight (inset 1px white gradient or `::before` strip) sells the effect.
- **Performance budget:** `backdrop-filter` is GPU-expensive and `.video-grid` can render dozens of cards while infinite-scrolling. Use real blur on the few fixed surfaces (header, sidebar, modal, hero panels); for repeated cards prefer translucency + border + shadow *without* blur, or blur only on `:hover`.
- **Hierarchy via opacity tiers:** define CSS custom properties at `:root` (e.g. `--glass-1/2/3`, `--text-1/2/3`, `--accent`, `--radius`) and use them everywhere — this is also the user's future tweaking surface.
- **Accessibility:** text over glass must keep ≥ 4.5:1 contrast — add a darker tint behind text-heavy glass (`.comment-content`, forms). Add visible `:focus-visible` rings (glass-friendly: bright 2px outline + glow). Respect `@media (prefers-reduced-motion: reduce)` for any animated backdrop, and wrap blur in `@supports (backdrop-filter: blur(1px))` with an opaque fallback.
- **States that must stay obviously distinct:** `.like-button-active` vs not, `.subscribe-button-active` vs not, `.tab-active`, `.sidebar-nav a.active`, checkbox checked state in the modal, `button:disabled`.
- **Native controls:** the `<video controls>` UI and `<input type="file">` are mostly unstylable — frame them (glass border/radius on the player container) rather than fighting them. `<select>` (sort dropdown) needs `color-scheme` set if you go dark, so the dropdown list isn't white-on-white.
- **Imagery:** thumbnails/avatars are arbitrary user uploads from Cloudinary — never rely on their colors; keep duration badges and text overlays on their own contrast layer.

## How to verify

Run the app (backend: `npm run dev` in repo root; frontend: `npm run dev` in `client/`, open http://localhost:5173) and check every page: `/` (grid + skeleton/empty states), `/results?query=x` (sort select), `/watch/:id` (player, likes, comments, save modal), `/channel/:username` (cover, tabs ×3), `/playlist/:id`, `/login`, `/register` (file inputs + previews), `/liked`, `/history`, `/subscriptions`, `/settings` (3 sections), `/studio` (stats + table), `/studio/upload` (progress bar — visible during a real upload), `/studio/edit/:id`, and any bad URL (404 page). Test logged-out vs logged-in (incognito), and mobile width (<768px).
