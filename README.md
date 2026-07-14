# MIDI Player

A minimal static site that plays your MIDI collection as a playlist. Mobile-friendly, no build step.

## Run it

The playlist is loaded with `fetch`, so serve the folder over HTTP (opening `index.html` directly won't work):

```bash
npx http-server . -p 8080 -c-1
```

Then open http://localhost:8080

To deploy, just upload the folder to any static host (e.g. Netlify) — no build step needed.

## Add songs

1. Drop your `.mid` files into the `midi/` folder.
2. Add an entry to `data/playlist.json`:

```json
{
  "name": "Geocine's Playlist",
  "tracks": [
    {
      "title": "Life Goes On",
      "artist": "BTS",
      "file": "midi/life-goes-on.mid"
    },
    {
      "title": "Another Song",
      "artist": "Someone",
      "file": "midi/another-song.mid"
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
- `data/playlist.json` – your playlist
- `midi/` – your MIDI files

Playback uses [html-midi-player](https://github.com/cifkao/html-midi-player) (Magenta + Tone.js) with a soundfont, loaded from a CDN.
