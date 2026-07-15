document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-btn');
    const startBtn = document.getElementById('start-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const downloadBtn = document.getElementById('download-btn');

    const landingState = document.getElementById('landing-state');
    const boothState = document.getElementById('booth-state');
    const reviewState = document.getElementById('review-state');

    // Theme Toggle
    themeBtn.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        if (currentTheme === 'light') {
            document.body.removeAttribute('data-theme');
            themeBtn.textContent = '☀️ Light Mode';
        } else {
            document.body.setAttribute('data-theme', 'light');
            themeBtn.textContent = '🌙 Dark Mode';
        }
    });

    let currentStream = null;

    async function startCamera() {
        try {
            currentStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            });
            const videoEl = document.getElementById('camera-feed');
            videoEl.srcObject = currentStream;
            return true;
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Could not access the camera. Please allow camera permissions and try again.');
            return false;
        }
    }

    function stopCamera() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
        }
    }

    const countdownOverlay = document.getElementById('countdown-overlay');
    const flashOverlay = document.getElementById('flash-overlay');
    const videoEl = document.getElementById('camera-feed');
    let rawCaptures = [];
    let processedCaptures = [];
    let finalStripCanvas = null;

    // Web Audio Context for sound effects
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function playBeep() {
        if (!audioCtx) audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);

        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    }

    function playShutter() {
        if (!audioCtx) audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const bufferSize = audioCtx.sampleRate * 0.15;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        noise.start();
    }

    const RETRO_PALETTE = [
        [0, 0, 0], [255, 255, 255], [136, 0, 0], [170, 255, 238],
        [204, 68, 204], [0, 204, 85], [0, 0, 170], [238, 238, 119],
        [221, 136, 85], [102, 68, 0], [255, 119, 119], [51, 51, 51],
        [119, 119, 119], [170, 255, 102], [0, 136, 255], [187, 187, 187],
        [32, 28, 36], [68, 36, 52], [48, 52, 109], [78, 74, 78],
        [133, 76, 48], [52, 101, 36], [208, 70, 72], [117, 113, 97],
        [89, 125, 206], [210, 125, 44], [133, 149, 161], [109, 170, 44],
        [210, 170, 153], [109, 194, 202], [218, 212, 94], [222, 238, 214]
    ];

    function colorDistance(r1, g1, b1, r2, g2, b2) {
        return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
    }

    function process8Bit(rawCanvas) {
        const size = Math.min(rawCanvas.width, rawCanvas.height);
        const startX = (rawCanvas.width - size) / 2;
        const startY = (rawCanvas.height - size) / 2;

        const smallCanvas = document.createElement('canvas');
        smallCanvas.width = 120;
        smallCanvas.height = 120;
        const smallCtx = smallCanvas.getContext('2d', { willReadFrequently: true });
        smallCtx.drawImage(rawCanvas, startX, startY, size, size, 0, 0, 120, 120);

        const imageData = smallCtx.getImageData(0, 0, 120, 120);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            let minDistance = Infinity;
            let closestColor = RETRO_PALETTE[0];

            for (const color of RETRO_PALETTE) {
                const dist = colorDistance(r, g, b, color[0], color[1], color[2]);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestColor = color;
                }
            }

            data[i] = closestColor[0];
            data[i + 1] = closestColor[1];
            data[i + 2] = closestColor[2];
        }
        smallCtx.putImageData(imageData, 0, 0);

        const upscaleCanvas = document.createElement('canvas');
        upscaleCanvas.width = 384;
        upscaleCanvas.height = 384;
        const upCtx = upscaleCanvas.getContext('2d');
        upCtx.imageSmoothingEnabled = false;
        upCtx.drawImage(smallCanvas, 0, 0, 120, 120, 0, 0, 384, 384);

        return upscaleCanvas;
    }

    function generatePhotoStrip(processedImages) {
        const stripCanvas = document.createElement('canvas');
        const imgSize = 384;
        const padding = 24;
        const topMargin = 80;
        const bottomMargin = 120;

        stripCanvas.width = imgSize + (padding * 2);
        stripCanvas.height = topMargin + (imgSize * 3) + (padding * 2) + bottomMargin;

        const ctx = stripCanvas.getContext('2d');
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, stripCanvas.width, stripCanvas.height);

        processedImages.forEach((canvas, index) => {
            const y = topMargin + (index * (imgSize + padding));
            ctx.drawImage(canvas, padding, y, imgSize, imgSize);
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 4;
            ctx.strokeRect(padding - 2, y - 2, imgSize + 4, imgSize + 4);
        });

        ctx.fillStyle = '#222';
        ctx.font = '24px "Press Start 2P", monospace';
        ctx.textAlign = 'center';

        const userName = document.getElementById('user-name').value.toUpperCase() || 'PLAYER 1';
        ctx.fillText(userName, stripCanvas.width / 2, 50);

        const userNote = document.getElementById('custom-note').value;
        if (userNote) {
            ctx.font = '16px "Press Start 2P", monospace';
            ctx.fillText(userNote, stripCanvas.width / 2, stripCanvas.height - 70);
        }

        ctx.font = '12px "Press Start 2P", monospace';
        ctx.textAlign = 'right';
        const dateStr = new Date().toLocaleDateString();
        ctx.fillText(dateStr, stripCanvas.width - padding, stripCanvas.height - 20);

        return stripCanvas;
    }

    function updateStripPreview() {
        const previewContainer = document.querySelector('.strip-preview');
        previewContainer.innerHTML = '';

        finalStripCanvas.style.width = '100%';
        finalStripCanvas.style.height = 'auto';
        finalStripCanvas.style.maxWidth = '300px';
        finalStripCanvas.style.border = '4px solid #fff';

        previewContainer.appendChild(finalStripCanvas);
    }

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function triggerFlash() {
        playShutter();
        flashOverlay.classList.remove('hidden');
        flashOverlay.classList.add('flash-active');

        setTimeout(() => {
            flashOverlay.classList.remove('flash-active');
            flashOverlay.classList.add('hidden');
        }, 300);
    }

    function captureFrame() {
        const canvas = document.createElement('canvas');
        canvas.width = videoEl.videoWidth;
        canvas.height = videoEl.videoHeight;
        const ctx = canvas.getContext('2d');

        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

        rawCaptures.push(canvas);
    }

    let isCapturing = false;
    let cancelSequence = false;

    async function startCaptureSequence() {
        rawCaptures = [];
        isCapturing = true;
        cancelSequence = false;

        for (let shot = 0; shot < 3; shot++) {
            if (cancelSequence) {
                isCapturing = false;
                return;
            }

            if (!currentStream || !currentStream.active) {
                alert('Camera was disconnected. Ending session.');
                stopCamera();
                boothState.classList.remove('active');
                boothState.classList.add('hidden');
                landingState.classList.remove('hidden');
                landingState.classList.add('active');
                isCapturing = false;
                return;
            }

            countdownOverlay.classList.remove('hidden');

            for (let i = 3; i > 0; i--) {
                if (cancelSequence) {
                    isCapturing = false;
                    return;
                }
                countdownOverlay.textContent = i;
                playBeep();
                await sleep(1000);
            }

            countdownOverlay.classList.add('hidden');

            triggerFlash();
            captureFrame();

            if (shot < 2) {
                await sleep(1000);
            }
        }

        if (cancelSequence) {
            isCapturing = false;
            return;
        }

        processedCaptures = rawCaptures.map(process8Bit);
        finalStripCanvas = generatePhotoStrip(processedCaptures);
        updateStripPreview();

        boothState.classList.remove('active');
        boothState.classList.add('hidden');

        reviewState.classList.remove('hidden');
        reviewState.classList.add('active');

        isCapturing = false;
    }

    // Start Flow
    const userNameInput = document.getElementById('user-name');
    userNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            startBtn.click();
        }
    });

    startBtn.addEventListener('click', async () => {
        if (isCapturing) return; // Prevent multiple clicks causing overlapped loops

        const hasCamera = await startCamera();
        if (!hasCamera) return;

        landingState.classList.remove('active');
        landingState.classList.add('hidden');

        boothState.classList.remove('hidden');
        boothState.classList.add('active');

        await startCaptureSequence();
    });

    // Retake Flow
    retakeBtn.addEventListener('click', () => {
        cancelSequence = true;
        isCapturing = false;
        stopCamera();

        reviewState.classList.remove('active');
        reviewState.classList.add('hidden');

        landingState.classList.remove('hidden');
        landingState.classList.add('active');
    });

    // Custom Note Update
    document.getElementById('custom-note').addEventListener('input', () => {
        if (processedCaptures.length === 3) {
            finalStripCanvas = generatePhotoStrip(processedCaptures);
            updateStripPreview();
        }
    });

    // Download PNG
    downloadBtn.addEventListener('click', () => {
        if (!finalStripCanvas) return;
        
        let msg = document.getElementById('custom-note').value.trim();
        let filename = msg ? `${msg.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_pixelator.png` : 'pixelator.png';
        
        const link = document.createElement('a');
        link.download = filename;
        link.href = finalStripCanvas.toDataURL('image/png');
        link.click();
    });
});
