import { useState, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import '../assets/hub/catalogue.js';
import '../assets/hub/app.js';
import './reader.css';

type Preferences = { width: 'compact' | 'wide'; spacing: 'normal' | 'airy' };
const defaults: Preferences = { width: 'compact', spacing: 'normal' };
function readPreferences(): Preferences {
  try {
    const saved = JSON.parse(localStorage.getItem('mono-reader-comfort') || '{}');
    return { width: saved.width === 'wide' ? 'wide' : 'compact', spacing: saved.spacing === 'airy' ? 'airy' : 'normal' };
  } catch { return defaults; }
}
function ReaderComfort() {
  const [preferences, setPreferences] = useState(readPreferences);
  const [persistent, setPersistent] = useState(true);
  useEffect(() => {
    document.body.dataset.readerWidth = preferences.width;
    document.body.dataset.readerSpacing = preferences.spacing;
    try { localStorage.setItem('mono-reader-comfort', JSON.stringify(preferences)); setPersistent(true); }
    catch { setPersistent(false); }
  }, [preferences]);
  return <div className="comfort-panel">
    <fieldset><legend>Largeur du texte</legend>{(['compact', 'wide'] as const).map(width =>
      <button key={width} type="button" aria-pressed={preferences.width === width} onClick={() => setPreferences(p => ({ ...p, width }))}>{width === 'compact' ? 'Livre' : 'Ample'}</button>)}</fieldset>
    <fieldset><legend>Espacement des lignes</legend>{(['normal', 'airy'] as const).map(spacing =>
      <button key={spacing} type="button" aria-pressed={preferences.spacing === spacing} onClick={() => setPreferences(p => ({ ...p, spacing }))}>{spacing === 'normal' ? 'Classique' : 'Aéré'}</button>)}</fieldset>
    <p role="status">{persistent ? 'Vos réglages sont conservés sur cet appareil.' : 'Réglages appliqués pour cette visite.'}</p>
  </div>;
}
let root: Root | undefined;
function mountReaderComfort() {
  root?.unmount(); root = undefined;
  const settings = document.querySelector('.reader-settings');
  if (!settings) return;
  const host = document.createElement('div');
  const panel = document.createElement('div');
  panel.className = 'reader-popover';
  panel.setAttribute('aria-label', 'Personnaliser la lecture');
  panel.append(host);
  const existing = settings.querySelector('.reading-controls');
  if (existing) panel.append(existing);
  settings.append(panel);
  root = createRoot(host); root.render(<ReaderComfort />);
}
mountReaderComfort();
window.addEventListener('mono:route', mountReaderComfort);

// Close the comfort panel without disturbing the current passage.
document.addEventListener('click', event => {
  const settings = document.querySelector<HTMLDetailsElement>('.reader-settings[open]');
  if (settings && event.target instanceof Node && !settings.contains(event.target)) settings.open = false;
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const settings = document.querySelector<HTMLDetailsElement>('.reader-settings[open]');
  if (settings) { settings.open = false; settings.querySelector<HTMLElement>('summary')?.focus(); }
});
