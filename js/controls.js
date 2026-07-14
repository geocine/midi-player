// Custom transport UI (play/pause, seek, time) on top of the headless
// midi-player engine. stop() keeps the position and start() resumes
// from currentTime, so stop/start acts as pause/resume.

export function createTransport({ playerEl, playBtn, timeCurrentEl, timeTotalEl }) {
  let tickId = null;

  function formatTime(seconds) {
    const s = Math.max(0, Math.floor(seconds || 0));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  function updateUI() {
    timeCurrentEl.textContent = formatTime(playerEl.currentTime);
    timeTotalEl.textContent = formatTime(playerEl.duration);
    playBtn.classList.toggle('playing', playerEl.playing);
    playBtn.setAttribute('aria-label', playerEl.playing ? 'Pause' : 'Play');
  }

  function startTicking() {
    stopTicking();
    tickId = setInterval(updateUI, 250);
  }

  function stopTicking() {
    if (tickId !== null) {
      clearInterval(tickId);
      tickId = null;
    }
  }

  playBtn.addEventListener('click', () => {
    if (playerEl.playing) {
      playerEl.stop();
    } else {
      playerEl.start();
    }
  });

  playerEl.addEventListener('load', () => {
    playBtn.disabled = false;
    updateUI();
  });

  playerEl.addEventListener('start', () => {
    startTicking();
    updateUI();
  });

  playerEl.addEventListener('stop', () => {
    stopTicking();
    updateUI();
  });

  updateUI();
}
