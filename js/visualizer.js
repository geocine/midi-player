// Visualizer merged with the seek bar. It sits faintly behind the
// transport controls: bars pulse from note events (position = pitch,
// height = velocity), the played portion renders brighter than the
// rest, and tapping or dragging anywhere on it seeks.

const BAR_COUNT = 64;
const DECAY = 0.965;
// Most music lives well inside the full 21-108 MIDI range; a narrower
// window spreads the notes across more bars.
const MIN_PITCH = 30;
const MAX_PITCH = 96;
// How far a note's energy bleeds into neighboring bars.
const SPREAD = [1, 0.75, 0.45, 0.2];

export function createVisualizer({ canvas, playerEl }) {
  const ctx = canvas.getContext('2d');
  const bars = new Float32Array(BAR_COUNT);
  let rafId = null;
  let scrubbing = false;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    const { width, height } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);

    const progress = playerEl.duration ? playerEl.currentTime / playerEl.duration : 0;
    const progressX = progress * width;

    const gap = 2;
    const barWidth = (width - gap * (BAR_COUNT - 1)) / BAR_COUNT;
    const centerY = height / 2;
    let active = false;

    for (let i = 0; i < BAR_COUNT; i++) {
      const value = bars[i];
      if (value > 0.004) active = true;

      // Nonlinear curve lifts quiet notes; sliver keeps an idle center line.
      const barHeight = Math.max(2, Math.pow(value, 0.6) * (height - 6));
      const x = i * (barWidth + gap);
      const played = x + barWidth / 2 <= progressX;

      if (played) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + value * 0.4})`;
      } else {
        ctx.fillStyle = `rgba(161, 161, 170, ${0.25 + value * 0.3})`;
      }
      ctx.fillRect(x, centerY - barHeight / 2, barWidth, barHeight);

      bars[i] *= DECAY;
    }

    // Playhead line — kept short and centered on the wave axis so it
    // doesn't run into the play button above or the title below.
    if (playerEl.duration) {
      const lineHeight = height * 0.45;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(progressX - 1, centerY - lineHeight / 2, 2, lineHeight);
    }

    if (active || playerEl.playing || scrubbing) {
      rafId = requestAnimationFrame(draw);
    } else {
      rafId = null;
    }
  }

  function ensureRunning() {
    if (rafId === null) {
      rafId = requestAnimationFrame(draw);
    }
  }

  playerEl.addEventListener('note', (event) => {
    const note = event.detail?.note;
    if (!note) return;

    const pitch = Math.min(Math.max(note.pitch ?? 60, MIN_PITCH), MAX_PITCH);
    const index = Math.round(
      ((pitch - MIN_PITCH) / (MAX_PITCH - MIN_PITCH)) * (BAR_COUNT - 1)
    );
    const velocity = Math.min(1, ((note.velocity ?? 90) / 127) * 1.3);

    // Light the bar and let its energy bleed into neighbors for a fuller wave.
    for (let offset = -(SPREAD.length - 1); offset < SPREAD.length; offset++) {
      const i = index + offset;
      if (i < 0 || i >= BAR_COUNT) continue;
      const level = velocity * SPREAD[Math.abs(offset)];
      bars[i] = Math.max(bars[i], level);
    }

    ensureRunning();
  });

  playerEl.addEventListener('start', ensureRunning);
  playerEl.addEventListener('stop', ensureRunning);
  playerEl.addEventListener('load', ensureRunning);

  // Tap or drag anywhere on the visualizer to seek.
  function seekFromEvent(event) {
    if (!playerEl.duration) return;
    const rect = canvas.getBoundingClientRect();
    const fraction = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    playerEl.currentTime = fraction * playerEl.duration;
    ensureRunning();
  }

  canvas.addEventListener('pointerdown', (event) => {
    if (!playerEl.duration) return;
    scrubbing = true;
    canvas.setPointerCapture(event.pointerId);
    seekFromEvent(event);
  });

  canvas.addEventListener('pointermove', (event) => {
    if (scrubbing) seekFromEvent(event);
  });

  canvas.addEventListener('pointerup', () => {
    scrubbing = false;
  });

  canvas.addEventListener('pointercancel', () => {
    scrubbing = false;
  });

  window.addEventListener('resize', () => {
    resize();
    ensureRunning();
  });

  resize();
  draw();
}
