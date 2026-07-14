import { loadPlaylist } from './playlist.js';
import { createPlayerController } from './player.js';
import { createTransport } from './controls.js';
import { createVisualizer } from './visualizer.js';

// Mobile Safari requires Web Audio to be unlocked directly from a user
// interaction. Calling Tone.start() before any asynchronous track loading keeps
// later playback from being rejected as autoplay.
async function unlockAudio() {
  if (!window.Tone?.start) {
    throw new Error('Tone.js failed to load');
  }
  await window.Tone.start();
}

async function init() {
  const playerEl = document.getElementById('player');

  const playlist = await loadPlaylist('data/playlist.json');

  document.getElementById('playlist-name').textContent = playlist.name;
  document.getElementById('track-count').textContent =
    `${playlist.tracks.length} song${playlist.tracks.length === 1 ? '' : 's'}`;

  const controller = createPlayerController({
    playerEl,
    listEl: document.getElementById('playlist'),
    titleEl: document.getElementById('now-playing-title'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    shuffleBtn: document.getElementById('shuffle-btn'),
    repeatBtn: document.getElementById('repeat-btn'),
    tracks: playlist.tracks,
    unlockAudio,
  });

  controller.renderList();

  createTransport({
    playerEl,
    playBtn: document.getElementById('play-btn'),
    timeCurrentEl: document.getElementById('time-current'),
    timeTotalEl: document.getElementById('time-total'),
    unlockAudio,
  });

  createVisualizer({
    canvas: document.getElementById('visualizer'),
    playerEl,
  });

  // Preselect the first song so the player is ready, but don't autoplay.
  if (playlist.tracks.length > 0) {
    controller.selectTrack(0, { autoplay: false });
  }

  setupTitleFade();
}

// The title fades out after a few seconds and reappears on transport
// interactions (play/pause, prev/next, shuffle/repeat) or when picking
// a song from the list — but not when scrubbing the wave.
function setupTitleFade() {
  const titleEl = document.getElementById('now-playing-title');
  let hideTimer = null;

  function showTitle() {
    titleEl.classList.add('visible');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => titleEl.classList.remove('visible'), 3000);
  }

  document.querySelector('.transport').addEventListener('click', showTitle);
  document.getElementById('playlist').addEventListener('click', showTitle);

  // Hovering the wave with a mouse also reveals the title, but not
  // while press-hold scrubbing (buttons pressed = drag in progress).
  const waveLine = document.querySelector('.wave-line');
  waveLine.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'mouse' && event.buttons === 0) {
      showTitle();
    }
  });
  // While press-hold scrubbing, also dim the transport so the wave
  // and playhead are clearly visible.
  const transport = document.querySelector('.transport');

  waveLine.addEventListener('pointerdown', () => {
    clearTimeout(hideTimer);
    titleEl.classList.remove('visible');
    transport.classList.add('dimmed');
  });

  const endScrub = () => transport.classList.remove('dimmed');
  waveLine.addEventListener('pointerup', endScrub);
  waveLine.addEventListener('pointercancel', endScrub);

  showTitle();
}

init().catch((err) => {
  document.getElementById('now-playing-title').textContent = 'Failed to load playlist';
  console.error(err);
});

// PWA: offline support via service worker (no-op during local file dev).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}
