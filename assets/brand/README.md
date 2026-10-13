# Grablab brand kit

Mark = bold G whose inner bar is the claw, capsule in the counter. Official finish = blue chrome with red/cyan chromatic fringe (`mark-chrome*.png`, built from `chrome-render.html` + `mark.png` alpha); flat ivory/navy only for one-color uses. Generated with Higgsfield (gpt_image_2_5), source in `hf/c2.png`, cut to transparent with a luminance mask. Ivory `#f4f3ee` on navy `#070912`; violet `#9a7bff` only as accent.
Wordmark = Clash Display 700, uppercase, letter-spacing .12em. Preview everything at `/brand.html`.

- `mark-chrome.png` / `mark-chrome-256.png` / `mark-chrome-1024.png` blue chrome (DEFAULT: nav, footer, avatar, favicons)
- `mark.png` ivory flat · `mark-navy.png` for light backgrounds · `mark-violet.png` accent · `mark-256.png`
- `favicon-32/64/180/512.png` navy tile + ivory mark (64 wired as icon, 180 as apple-touch-icon)
- `logo-lockup-dark.png` / `@2x` / `logo-lockup-light.png` mark + GRABLAB
- `x-avatar-400.png` X / Twitter profile picture
- `x-banner-1500x500.png` (machine on clouds) and `x-banner-claw-1500x500.png` (chrome claw macro): X headers, Higgsfield backgrounds in `hf/`, film grain + vignette baked in with PIL after the Playwright export (grain via CSS overlay is invisible on near-black, so it is added in post)
- `mark-1024.png` transparent · `mark-tile-1024.png` on navy (app icons, Discord, Telegram)

Re-export PNGs: run the Playwright script against `http://localhost:8099/brand.html` (see scratchpad render-brand.js, element screenshots of #avatar, #banner, #lockup-dark, #lockup-light, #mark-1024, #tile-1024).
