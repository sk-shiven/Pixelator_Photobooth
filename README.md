# The Pixelated Booth

A browser-based retro photobooth web application that captures live webcam photos, converts them into an 8-bit-style pixel-art image, and lets you download a printable PNG photo strip. 

The goal is to provide a fun, nostalgic, low-friction experience — no sign-up, fully client-side, just camera → countdown → flash → retro photo strip → download/print.

## 📸 Features

- **Retro 8-Bit Aesthetic**: Authentic pixel art effect with a small 96x96 grid, 32 flat quantized colors, and square shots.
- **Classic Photobooth Experience**: Takes 3 consecutive shots with a 5-second countdown and flash effect between each.
- **Customizable Output**: Enter your name before the session and add a personal note before downloading.
- **Print-Ready Strip**: Outputs a single vertical PNG formatted exactly like a classic photobooth strip, complete with your custom text and the date at the bottom right.
- **Privacy First**: Fully client-side execution. Your photos never leave your browser.
- **Arcade Vibes**: Immersive retro arcade UI theme.

## 🚀 Getting Started

*(Instructions on how to run the project locally will be added here as development progresses.)*

## 🛠 Tech Stack

- HTML, CSS, JavaScript
- Client-side `<canvas>` API for image processing and compositing
- `getUserMedia` for webcam access

## 📝 Roadmap

### MVP (v1)
- [ ] Live webcam preview & camera permission handling
- [ ] Name input and custom note integration
- [ ] 5-second countdown with visual cues
- [ ] 3-shot automated sequence with flash effect
- [ ] Client-side 8-bit pixelation and color quantization (96x96, 32 colors)
- [ ] Vertical strip compositing and PNG download generation

### Future Enhancements
- Countdown and shutter sound effects
- Retake button (single shot or full strip)
- Mobile responsiveness
