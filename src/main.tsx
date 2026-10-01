import '../assets/hub/catalogue.js';
import '../assets/hub/app.js';
import './reader.css';
import './characters.css';

// Load React only when a visitor opens a story.
let readerModule: typeof import('./reader') | undefined;
let routeGeneration = 0;
async function enhanceReader() {
  const generation = ++routeGeneration;
  readerModule?.unmountReaderComfort();
  if (!document.querySelector('.story-reader')) return;
  const module = await import('./reader');
  if (generation !== routeGeneration) return;
  readerModule = module;
  module.mountReaderComfort();
}
void enhanceReader();
window.addEventListener('mono:route', () => { void enhanceReader(); });

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
