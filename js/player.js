export function createPlayerController({ playerEl, listEl, titleEl, prevBtn, nextBtn, tracks }) {
  let currentIndex = -1;

  function renderList() {
    listEl.innerHTML = '';
    tracks.forEach((track, index) => {
      const li = document.createElement('li');
      li.className = 'track';
      li.dataset.index = index;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'track-button';
      button.innerHTML = `
        <span class="track-number">${index + 1}</span>
        <span class="track-info">
          <span class="track-title">${escapeHtml(track.title)}</span>
          <span class="track-artist">${escapeHtml(track.artist || '')}</span>
        </span>
        <span class="track-status" aria-hidden="true"></span>
      `;
      button.addEventListener('click', () => selectTrack(index));

      li.appendChild(button);
      listEl.appendChild(li);
    });
  }

  function selectTrack(index, { autoplay = true } = {}) {
    currentIndex = index;
    const track = tracks[index];

    playerEl.stop();
    playerEl.src = track.file;
    titleEl.textContent = track.artist ? `${track.title} — ${track.artist}` : track.title;
    titleEl.classList.remove('muted');

    highlightCurrent();

    if (autoplay) {
      // Play once the MIDI file has loaded.
      playerEl.addEventListener('load', () => playerEl.start(), { once: true });
    }
  }

  function next() {
    if (!tracks.length) return;
    selectTrack((currentIndex + 1) % tracks.length);
  }

  function prev() {
    if (!tracks.length) return;
    // Restart the current song if it's been playing a bit, otherwise go back.
    if (currentIndex >= 0 && playerEl.currentTime > 3) {
      selectTrack(currentIndex);
    } else {
      selectTrack((currentIndex - 1 + tracks.length) % tracks.length);
    }
  }

  function highlightCurrent() {
    listEl.querySelectorAll('.track').forEach((li) => {
      li.classList.toggle('active', Number(li.dataset.index) === currentIndex);
    });
  }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Auto-advance to the next track when the current one finishes.
  playerEl.addEventListener('stop', (event) => {
    if (event.detail?.finished && currentIndex < tracks.length - 1) {
      selectTrack(currentIndex + 1);
    }
  });

  return { renderList, selectTrack, next, prev };
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
