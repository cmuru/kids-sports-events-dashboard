import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import { filterEvents } from '../filterEvents.js';
import type { NormalizedEvent } from '../../types.js';

const TZ = 'America/Toronto';

function makeTimedEvent(startISO: string): NormalizedEvent {
  return {
    kidName: 'Alex',
    title: 'Game',
    start: startISO,
    end: startISO,
    allDay: false,
    location: null,
  };
}

function makeAllDayEvent(dateStr: string): NormalizedEvent {
  return {
    kidName: 'Alex',
    title: 'Tournament',
    start: dateStr,
    end: dateStr,
    allDay: true,
    location: null,
  };
}

// "now" is 2026-06-10T12:00:00 America/Toronto (= 16:00 UTC)
const NOW = DateTime.fromISO('2026-06-10T16:00:00.000Z', { zone: 'UTC' });
const SEASON_END = '2026-06-15';

describe('filterEvents — timed events', () => {
  it('includes an event starting exactly at now', () => {
    const events = [makeTimedEvent('2026-06-10T16:00:00.000Z')];
    expect(filterEvents(events, NOW, SEASON_END, TZ)).toHaveLength(1);
  });

  it('excludes a past event one second before now', () => {
    const events = [makeTimedEvent('2026-06-10T15:59:59.000Z')];
    expect(filterEvents(events, NOW, SEASON_END, TZ)).toHaveLength(0);
  });

  it('includes an event within the window', () => {
    const events = [makeTimedEvent('2026-06-12T14:00:00.000Z')];
    expect(filterEvents(events, NOW, SEASON_END, TZ)).toHaveLength(1);
  });

  it('includes an event exactly on the season-end date (end of day in TZ)', () => {
    // 2026-06-15 23:59:00 America/Toronto = 2026-06-16T03:59:00Z (EDT = UTC-4)
    const events = [makeTimedEvent('2026-06-16T03:59:00.000Z')];
    expect(filterEvents(events, NOW, SEASON_END, TZ)).toHaveLength(1);
  });

  it('excludes an event one minute past midnight after season-end date', () => {
    // 2026-06-16 00:01 America/Toronto = 2026-06-16T04:01:00Z
    const events = [makeTimedEvent('2026-06-16T04:01:00.000Z')];
    expect(filterEvents(events, NOW, SEASON_END, TZ)).toHaveLength(0);
  });
});

describe('filterEvents — all-day events', () => {
  it("includes today's all-day event", () => {
    // NOW is 2026-06-10T16:00 UTC = 2026-06-10 in Toronto
    const events = [makeAllDayEvent('2026-06-10')];
    expect(filterEvents(events, NOW, SEASON_END, TZ)).toHaveLength(1);
  });

  it('excludes a past all-day event', () => {
    const events = [makeAllDayEvent('2026-06-09')];
    expect(filterEvents(events, NOW, SEASON_END, TZ)).toHaveLength(0);
  });

  it('includes an all-day event exactly on season-end date', () => {
    const events = [makeAllDayEvent('2026-06-15')];
    expect(filterEvents(events, NOW, SEASON_END, TZ)).toHaveLength(1);
  });

  it('excludes an all-day event after season-end date', () => {
    const events = [makeAllDayEvent('2026-06-16')];
    expect(filterEvents(events, NOW, SEASON_END, TZ)).toHaveLength(0);
  });
});
