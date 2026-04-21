import type { EventsData, KidData, NormalizedEvent } from './types.js';

async function main() {
  const container = document.getElementById('kids-container')!;
  const updatedEl = document.getElementById('updated-at')!;

  let data: EventsData;
  try {
    const res = await fetch('data/events.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = (await res.json()) as EventsData;
  } catch {
    container.innerHTML = `
      <div class="error-message">
        <p>The schedule couldn't be loaded right now.</p>
        <p>Please try again in a few minutes.</p>
      </div>`;
    return;
  }

  if (data.generatedAt) {
    updatedEl.textContent = `Updated ${formatUpdatedAt(new Date(data.generatedAt))}`;
  }

  if (!data.kids || data.kids.length === 0) {
    container.innerHTML = `<p class="loading">No kids configured yet.</p>`;
    return;
  }

  container.innerHTML = data.kids.map(renderKid).join('');
}

function renderKid(kid: KidData): string {
  const staleNotice =
    kid.fetchStatus === 'error'
      ? `<p class="stale-notice">Latest schedule couldn't be loaded — showing what we had last time.</p>`
      : '';

  const eventsHtml =
    kid.events.length === 0
      ? `<p class="no-events">No more events this season.</p>`
      : kid.events.map(renderEvent).join('');

  return `
    <section class="kid-section" aria-label="${escapeHtml(kid.name)}'s schedule">
      <h2>${escapeHtml(kid.name)}</h2>
      ${staleNotice}
      <div class="events-list">${eventsHtml}</div>
    </section>`;
}

function renderEvent(event: NormalizedEvent): string {
  const dateStr = event.allDay ? formatAllDayDate(event.start) : formatDate(new Date(event.start));
  const timeStr = event.allDay ? 'All day' : formatTime(new Date(event.start));
  const locationHtml =
    event.location ? `<div class="event-location">${escapeHtml(event.location)}</div>` : '';

  return `
    <div class="event-card">
      <div class="event-date">${dateStr}</div>
      <div class="event-time">${timeStr}</div>
      <div class="event-title">${escapeHtml(event.title)}</div>
      ${locationHtml}
    </div>`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatAllDayDate(dateStr: string): string {
  // Parse YYYY-MM-DD as local to avoid UTC-offset shift
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatUpdatedAt(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 2) return 'just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  return date.toLocaleDateString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit', hour12: true });
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

main();
