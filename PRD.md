# PRD: Retro Photobooth Web App

## 1. Overview
A browser-based photobooth that captures a live webcam photo (or a short burst of shots), converts it into an 8-bit-style pixel-art image, and lets the user download a printable PNG. The goal is a fun, nostalgic, low-friction experience — no sign-up, no server round trip if possible, just camera → countdown → flash → retro photo strip → download/print.

## 2. Goals
- Make people smile in under 30 seconds of use.
- Output looks unmistakably "8-bit" (visible pixel blocks, limited/retro color palette), not just a blurry downscale.
- Works reliably on a laptop browser with a webcam; mobile is a stretch goal, not a blocker for v1.
- Fully client-side if feasible (privacy-friendly: photo never leaves the browser).

## 3. Core User Flow (P0)
1. User lands on the page → sees a retro arcade theme + live webcam preview + name input field.
2. Browser asks for camera permission.
3. User enters their name and clicks "Start" → **countdown** (5 seconds) with visual + optional sound cue.
4. **Flash** effect on capture (screen flashes white briefly, like a real photobooth).
5. This repeats for 3 shots to fill a **photo strip**.
6. Captured frames are pixelated into the fixed 8-bit style (96x96 grid, 32 flat quantized colors, square shots) and composited into a single vertical strip.
7. User is prompted to add a small note to their photo strip.
8. User sees the final strip with a "Download PNG" button (and optionally "Retake").
9. PNG is shaped like a classic vertical photobooth strip, featuring their name, note, and the date at the bottom right.

## 4. Feature Breakdown

### P0 — Must have
- Webcam access + live preview (`getUserMedia`-style browser API)
- Name input before starting the capture
- 5-second countdown timer before each shot
- Flash visual effect on capture
- Multi-shot capture (3 shots) composited into one vertical strip
- 8-bit pixelation effect applied to each shot (96x96 grid, 32 flat quantized colors, square crop)
- Note input after capture to add onto the strip
- Strip includes user's name, custom note, and date at the bottom right (no external branding)
- Download as a single PNG file (photobooth strip shaped)
- Basic responsive layout (Desktop website only for now)
- Retro arcade theme around the booth UI

### P1 — Nice to have / fast follow
- Countdown sound + shutter sound effect
- Retake button (redo the whole strip or a single shot)

### Explicitly out of scope for v1
- Mobile support (focusing on desktop website)
- User-selectable style (8-bit vs 16-bit vs filters)
- Accounts, saved photo history, or server-side storage
- Sharing to social media directly from the app

## 5. Style Spec
- **Pixel size / resolution**: Downscale to a small grid of 96x96 and scale back up.
- **Color palette**: 32 colors to give it a retro vibe.
- **Dithering**: Flat quantized colors (no dithering).
- **Aspect ratio**: Square shots only.

## 6. Technical Notes (high-level, not final)
- Likely all client-side: `<canvas>` for capturing webcam frames and doing the pixelation/color-quantization math, browser download via a generated blob link.
- Any specific libraries or exact API method names should be verified against current documentation at build time rather than assumed.
- No backend strictly required for v1 given the "download PNG" flow.

## 7. Resolved Questions
1. **Exact pixel-art parameters**: Small grid of 96x96, 32 colours, flat quantized colours, square shots.
2. **Number of shots per strip**: 3 shots.
3. **Countdown length**: 5 seconds.
4. **Print target**: Photobooth strip shaped.
5. **Visual theme**: Retro arcade theme.
6. **Mobile support**: Only website for now.
7. **Branding/text**: User's name collected first, an optional small note added before downloading, and the date at the bottom right. No other branding.

## 8. Success Criteria
- A user can go from landing on the page to downloading a printable strip PNG in under 30 seconds.
- The pixel-art effect is visually convincing as "retro 8-bit," not just a blurry photo.
- Works consistently in a current version of Chrome/Firefox/Safari on desktop.