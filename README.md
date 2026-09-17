# Craig Personal OS

Phase 1 prototype. A single-screen habit tracker for the daily routine, reading
and exercise programme — implemented from the Claude Design mock
(`Craig Personal OS.dc.html`).

Static, dependency-free, no build step. Open `index.html` and it runs.

| File | |
| --- | --- |
| `index.html` | Shell, full-viewport layout, safe-area insets, service worker registration |
| `app.js` | All state and the seven screens (Today, Programme, Log, Data, Report, Settings, Coach) |
| `dom.js` | Small keyed DOM reconciler, standing in for the design-canvas runtime |
| `sw.js` | Offline app shell |
| `_ds/industry-…/styles.css` | Design system, unmodified from source |

State lives in `localStorage` under `craig-os-v2`. Nothing is sent anywhere.
"Reset today & clock" in Settings clears the day but keeps schedule edits and
targets.

## Running locally

Any static server. Note that **service workers need HTTPS or `localhost`** — on a
plain LAN address the app still works, just without offline support.

## Deploying

Built for [Cloudflare Pages](https://pages.cloudflare.com) (free tier): create a
project, upload this folder, done. `_headers` keeps `sw.js` and the manifest off
a long cache so a deploy actually reaches an installed phone. Netlify reads the
same file.

To install on a phone, open the deployed URL and use **Add to Home Screen**
(Chrome: ⋮ menu; Safari: Share).

### After changing a shell file

`sw.js` serves the app shell from a named cache. Bump `SHELL_CACHE` in `sw.js`
when `index.html`, `app.js`, `dom.js` or `styles.css` changes, or phones that
already have the app will keep the old copy.

## Privacy

`app.js` contains seeded personal detail — first name, children's initials, a
weight, the routine and its times. It is served to the browser by any host, so
avoid publishing the source to a public repository. To restrict who can open the
deployed app, Cloudflare Access (free tier) can gate it behind an email one-time
code.
