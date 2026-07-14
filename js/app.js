import { loadPlaylist } from './playlist.js';
import { createPlayerController } from './player.js';
import { applyPlayerTheme } from './player-theme.js';

async function init() {
  // Theme the player right away (in parallel with the playlist fetch)
  // so the default light UI never flashes.
  const themed = applyPlayerTheme(document.getElementById('player'));

  const playlist = await loadPlaylist('data/playlist.json');

  document.getElementById('playlist-name').textContent = playlist.name;
  document.getElementById('track-count').textContent =
    `${playlist.tracks.length} song${playlist.tracks.length === 1 ? '' : 's'}`;

  const controller = createPlayerController({
    playerEl: document.getElementById('player'),
    listEl: document.getElementById('playlist'),
    titleEl: document.getElementById('now-playing-title'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    tracks: playlist.tracks,
  });

  controller.renderList();
  await themed;

  // Preselect the first song so the player is ready, but don't autoplay.
  if (playlist.tracks.length > 0) {
    controller.selectTrack(0, { autoplay: false });
  }
}

init().catch((err) => {
  document.getElementById('now-playing-title').textContent = 'Failed to load playlist';
  console.error(err);
});
