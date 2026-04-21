import { DateTime } from 'luxon';
import type { NormalizedEvent } from '../types.js';

/**
 * Keeps events whose start is >= now and <= end of seasonEndDate (inclusive)
 * in the configured timezone. Accepts a `now` parameter to allow deterministic
 * testing.
 */
export function filterEvents(
  events: NormalizedEvent[],
  now: DateTime,
  seasonEndDate: string,
  timezone: string,
): NormalizedEvent[] {
  const todayStr = now.setZone(timezone).toISODate()!;
  const endOfSeason = DateTime.fromISO(seasonEndDate, { zone: timezone }).endOf('day');

  return events.filter(event => {
    if (event.allDay) {
      // Compare YYYY-MM-DD strings — lexicographic order is correct for ISO dates
      return event.start >= todayStr && event.start <= seasonEndDate;
    } else {
      const eventStart = DateTime.fromISO(event.start, { zone: 'UTC' });
      return eventStart >= now && eventStart <= endOfSeason;
    }
  });
}
