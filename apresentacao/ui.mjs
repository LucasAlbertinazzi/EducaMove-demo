import { statuses } from './data.mjs?v=20261014-2';

export const e = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

const paths = {
  home: '<path d="m3 10 9-7 9 7v10H3zM9 20v-7h6v7"/>',
  document: '<path d="M6 3h8l4 4v14H6zM14 3v5h5M9 12h6M9 16h6"/>',
  people: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v5M17 3v5M3 11h18M7 15h3M14 15h3"/>',
  bell: '<path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zM10 21h4"/>',
  chart: '<path d="M4 21V12M10 21V3M16 21V8M22 21V15"/>',
  bus: '<rect x="5" y="3" width="14" height="16" rx="3"/><path d="M5 10h14M8 19v3M16 19v3M8 14h1M15 14h1M8 6h8"/>',
  building: '<path d="m3 8 9-5 9 5M3 10h18M5 10v9M10 10v9M14 10v9M19 10v9M2 21h20"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6zM8 12l3 3 5-6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  refresh: '<path d="M20 10a8 8 0 1 0 0 5M20 3v7h-7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
};
export function icon(name, cls = '') { return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.document}</svg>`; }
export function badge(status) { return `<span class="badge ${e(status)}">${e(statuses[status] ?? status)}</span>`; }
export function button(label, action, extra = '', kind = 'secondary') { return `<button class="button ${kind}" type="button" data-action="${action}" ${extra}>${label}</button>`; }
export function empty(message) { return `<div class="empty">${icon('document')}<p>${e(message)}</p></div>`; }
export function title(heading, description, extra = '') { return `<div class="view-heading"><div><h3>${heading}</h3><p>${description}</p></div>${extra}</div>`; }
export function tabs(items, selected, attr, label) { return `<div class="segmented" role="group" aria-label="${label}">${items.map(([id, text]) => `<button type="button" ${attr}="${id}" aria-pressed="${id === selected}">${text}</button>`).join('')}</div>`; }
export const profileTabs = [['prefeitura', 'Prefeitura'], ['gestao', 'Gestão'], ['estudante', 'Estudante']];
export function errorSlot(id) { return `<p class="form-error" id="${id}" role="alert" hidden></p>`; }
