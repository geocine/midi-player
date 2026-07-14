# MIDI Player

A minimal static site that plays your MIDI collection as a playlist. Mobile-friendly, no build step.

## Run it

The playlist is loaded with `fetch`, so serve the folder over HTTP (opening `index.html` directly won't work):

```bash
npx http-server . -p 8080 -c-1
```

Then open http://localhost:8080

## Deploy (Netlify)

The repo includes a `netlify.toml` — connect the repository to Netlify (or drag-and-drop the folder in the Netlify UI) and it deploys as-is: no build step, publish directory is the root. The config also sets the right MIME type for `.mid` files, caches them for a week, and keeps `data/playlist.json` always fresh so newly added songs show up immediately.

## Add songs

1. Drop your `.mid` files into the `midi/` folder.
2. Add an entry to `data/playlist.json`:

```json
{
  "name": "Geocine's Playlist",
  "tracks": [
    {
      "title": "Life Goes On",
      "artist": "방탄소년단 (BTS)",
      "file": "midi/life-goes-on.mid"
    },
    {
      "title": "First Love (Cover)",
      "artist": "김채원 (Chaewon Kim)",
      "file": "midi/first-love.mid"
    }
  ]
}
```

`artist` is optional. Tracks auto-advance when a song finishes.

## Structure

- `index.html` – page shell
- `css/styles.css` – styling
- `js/app.js` – entry point
- `js/playlist.js` – loads the playlist JSON
- `js/player.js` – playlist rendering and playback control
- `js/controls.js` – custom transport UI (play/pause, seek, time)
- `js/visualizer.js` – note-driven waveform visualizer
- `data/playlist.json` – your playlist
- `midi/` – your MIDI files
- `netlify.toml` – Netlify deploy config (headers, caching)

Playback uses [html-midi-player](https://github.com/cifkao/html-midi-player) (Magenta + Tone.js) with a soundfont, loaded from a CDN.
