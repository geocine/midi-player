const REPEAT_MODES = ['off', 'all', 'one'];

export function createPlayerController({
  playerEl,
  listEl,
  titleEl,
  prevBtn,
  nextBtn,
  shuffleBtn,
  repeatBtn,
  tracks,
}) {
  let currentIndex = -1;
  let shuffle = false;
  let repeat = 'off';

  function randomOtherIndex() {
    if (tracks.length < 2) return currentIndex;
    let index;
    do {
      index = Math.floor(Math.random() * tracks.length);
    } while (index === currentIndex);
    return index;
  }

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
    selectTrack(shuffle ? randomOtherIndex() : (currentIndex + 1) % tracks.length);
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

  function toggleShuffle() {
    shuffle = !shuffle;
    shuffleBtn.classList.toggle('active', shuffle);
    shuffleBtn.setAttribute('aria-pressed', String(shuffle));
  }

  function cycleRepeat() {
    repeat = REPEAT_MODES[(REPEAT_MODES.indexOf(repeat) + 1) % REPEAT_MODES.length];
    repeatBtn.classList.toggle('active', repeat !== 'off');
    repeatBtn.dataset.mode = repeat;
    repeatBtn.setAttribute(
      'aria-label',
      repeat === 'one' ? 'Repeat one' : repeat === 'all' ? 'Repeat all' : 'Repeat'
    );
  }

  function highlightCurrent() {
    listEl.querySelectorAll('.track').forEach((li) => {
      li.classList.toggle('active', Number(li.dataset.index) === currentIndex);
    });
  }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  shuffleBtn.addEventListener('click', toggleShuffle);
  repeatBtn.addEventListener('click', cycleRepeat);

  // When a track finishes: repeat-one replays it, otherwise advance
  // (shuffled if enabled); at the end of the list, repeat-all wraps
  // around and off stops.
  playerEl.addEventListener('stop', (event) => {
    if (!event.detail?.finished) return;

    if (repeat === 'one') {
      selectTrack(currentIndex);
    } else if (shuffle) {
      selectTrack(randomOtherIndex());
    } else if (currentIndex < tracks.length - 1) {
      selectTrack(currentIndex + 1);
    } else if (repeat === 'all') {
      selectTrack(0);
    }
  });

  return { renderList, selectTrack, next, prev };
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
