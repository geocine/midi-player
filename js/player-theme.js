// html-midi-player renders its UI inside a shadow DOM with its own styles
// (light pill background, 100px border-radius, fixed 300px width). CSS
// ::part() can't reach everything (e.g. the range input's track/thumb),
// so we inject a theme stylesheet straight into the shadow root.

const THEME_CSS = `
  :host {
    width: 100%;
    margin: 0;
    font-size: 12px;
  }

  .controls {
    border-radius: 2px;
    background: transparent;
    padding: 0;
  }

  .controls > * {
    margin: 0.4em 0.4em;
  }

  .controls button {
    width: 38px;
    height: 38px;
    border-radius: 2px;
    background: #ffffff;
    color: #000000;
    flex-shrink: 0;
    margin-left: 0;
    transition: background-color 150ms ease;
  }

  .controls button:not(:disabled):hover {
    background: #e4e4e7;
  }

  .controls button:not(:disabled):active {
    background: #d4d4d8;
  }

  .controls button:disabled {
    background: #18181b;
    color: #52525b;
  }

  .controls .time {
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 11px;
    color: #71717a;
    white-space: nowrap;
  }

  .controls .seek-bar {
    -webkit-appearance: none;
    appearance: none;
    flex: 1;
    min-width: 0;
    height: 14px;
    margin-right: 0.6em;
    background: transparent;
  }

  .controls .seek-bar::-webkit-slider-runnable-track {
    height: 3px;
    background: #3f3f46;
    border-radius: 0;
  }

  .controls .seek-bar::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 10px;
    height: 10px;
    margin-top: -3.5px;
    background: #ffffff;
    border: none;
    border-radius: 2px;
  }

  .controls .seek-bar::-moz-range-track {
    height: 3px;
    background: #3f3f46;
    border-radius: 0;
  }

  .controls .seek-bar::-moz-range-thumb {
    width: 10px;
    height: 10px;
    background: #ffffff;
    border: none;
    border-radius: 2px;
  }
`;

export async function applyPlayerTheme(playerEl) {
  await customElements.whenDefined('midi-player');
  const style = document.createElement('style');
  style.textContent = THEME_CSS;
  playerEl.shadowRoot.appendChild(style);
  // Reveal the player only now that it's themed (see styles.css).
  playerEl.classList.add('themed');
}
