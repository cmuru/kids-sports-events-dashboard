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

  const days = groupByDay(data.kids);

  if (days.size === 0) {
    container.innerHTML = `<p class="no-events">No more events this season.</p>`;
    return;
  }

  const entries = Array.from(days.entries());
  const html: string[] = [];
  let lastWeekendKey = '';
  for (const [dateKey, events] of entries) {
    const weekendKey = getWeekendKey(dateKey);
    if (weekendKey && weekendKey !== lastWeekendKey && lastWeekendKey !== '') {
      html.push('<hr class="weekend-divider">');
    }
    if (weekendKey) lastWeekendKey = weekendKey;
    html.push(renderDay(dateKey, events, data.kids));
  }
  container.innerHTML = html.join('');
}

function getWeekendKey(dateKey: string): string | null {
  const [year, month, day] = dateKey.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dow = d.getDay(); // 0=Sun, 6=Sat
  if (dow === 6) return dateKey;
  if (dow === 0) {
    const sat = new Date(year, month - 1, day - 1);
    return sat.toLocaleDateString('en-CA'); // YYYY-MM-DD
  }
  return null;
}

function groupByDay(kids: KidData[]): Map<string, NormalizedEvent[]> {
  const map = new Map<string, NormalizedEvent[]>();

  for (const kid of kids) {
    for (const event of kid.events) {
      const dateKey = event.allDay ? event.start : event.start.slice(0, 10);
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(event);
    }
  }

  // Sort within each day by start ascending, then sort the map keys
  for (const events of map.values()) {
    events.sort((a, b) => a.start.localeCompare(b.start));
  }

  return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

function renderDay(dateKey: string, events: NormalizedEvent[], kids: KidData[]): string {
  const heading = formatDayHeading(dateKey);
  const eventsHtml = events.map(e => renderEvent(e, kids)).join('');
  return `
    <section class="day-section" aria-label="${escapeHtml(heading)}">
      <h2 class="day-heading">${escapeHtml(heading)}</h2>
      <div class="events-list">${eventsHtml}</div>
    </section>`;
}

function renderEvent(event: NormalizedEvent, kids: KidData[]): string {
  const timeStr = event.allDay ? 'All day' : formatTime(new Date(event.start));
  const locationHtml = event.location
    ? `<div class="event-location">${escapeHtml(event.location)}</div>`
    : '';

  const kidData = kids.find(k => k.name === event.kidName);
  const staleHtml = kidData?.fetchStatus === 'error'
    ? `<div class="event-stale">may be outdated</div>`
    : '';

  return `
    <div class="event-card">
      <div class="event-time">${timeStr}</div>
      <div class="event-child">${escapeHtml(event.kidName)}</div>
      <div class="event-title">${escapeHtml(event.title)}</div>
      ${locationHtml}
      ${staleHtml}
    </div>`;
}

function formatDayHeading(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
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
