# ApnoAI Task 1 — My First Web Page

A four-section portfolio site (Home, About, Services, Contact) built with plain HTML and CSS.
No frameworks, no build step, no dependencies.

**Files:** `index.html` and `style.css`. Keep both in the same folder.

## What's inside

- Fixed header with a dropdown menu (burger), centred wordmark and theme toggle
- **Home** — full-width black hero block with large variable-width type and a centred pill CTA
- **About** — two rounded case-study cards plus an intro and skill chips
- **Services** — six full-colour specimen tiles (full-bleed on phones)
- **Contact** — three full-width colour banners for email, GitHub and phone
- Sitemap-style footer with a giant gray wordmark
- Responsive from **360px** up, with no horizontal overflow
- **Dark mode by default** (like the reference) with a toggle that remembers your choice in `localStorage` under the key `theme`
- Scroll-reveal animation, keyboard focus styles and `prefers-reduced-motion` support

The visual language (spacing scale, 12px radii, colour tokens, type scale and motion) is adapted from
[newglyph.com](https://newglyph.com/). No proprietary fonts, videos, images or copy from that site are used.

## Fonts

The site loads two free Google Fonts: **Roboto Flex** (variable width/weight) and **Roboto Mono**.
They need an internet connection on first load; system fonts are used as fallbacks.

## Before you submit — 2 things to personalise

Open `index.html` and replace:

1. **Phone number** — search for `+91 00000 00000` (and `tel:+910000000000`) and use your real number, or delete the third contact banner.
2. **GitHub link** — search for `https://github.com/` and paste your profile URL.

Both are marked with `TODO` comments. Everything else (name, email, sections, services) is already filled in.

## Preview locally

Double-click `index.html`. That's it — no server needed.

## Publish (GitHub + Vercel)

1. Create a **public** GitHub repo called `apnoai-task-1-yourname` (no README).
2. Upload `index.html` and `style.css` → **Commit changes**.
3. Go to [vercel.com](https://vercel.com) → **Continue with GitHub** → **Add New → Project**.
4. Import the repo, leave the framework preset as **Other**, click **Deploy**.
5. Open the live URL and test it on your phone. Tap the half-circle icon to switch themes.

## Submit

- **Submission link:** your Vercel URL (e.g. `https://apnoai-task-1-yourname.vercel.app`)
- **Notes:** your GitHub repo URL
- **How I used AI:** one honest line about what you used AI for

Broken links = "Revise", so open both URLs in a fresh tab before submitting.
