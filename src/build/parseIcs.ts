import ICAL from 'ical.js';
import type { NormalizedEvent } from '../types.js';

export function parseIcs(icsString: string, kidName: string): NormalizedEvent[] {
  let jcal: unknown;
  try {
    jcal = ICAL.parse(icsString);
  } catch (err) {
    throw new Error(`Failed to parse ICS for "${kidName}": ${err}`);
  }

  const comp = new ICAL.Component(jcal);

  // Register any embedded VTIMEZONE components so ical.js can convert times
  for (const vtz of comp.getAllSubcomponents('vtimezone')) {
    ICAL.TimezoneService.register(vtz);
  }

  const events: NormalizedEvent[] = [];

  for (const vevent of comp.getAllSubcomponents('vevent')) {
    const event = new ICAL.Event(vevent);
    const dtstart = event.startDate;
    const dtend = event.endDate ?? event.startDate;

    const allDay = dtstart.isDate;

    let start: string;
    let end: string;

    if (allDay) {
      start = toDateString(dtstart.year, dtstart.month, dtstart.day);
      end = toDateString(dtend.year, dtend.month, dtend.day);
    } else {
      start = dtstart.toJSDate().toISOString();
      end = dtend.toJSDate().toISOString();
    }

    const rawLocation = vevent.getFirstPropertyValue<string>('location');
    const location = rawLocation && rawLocation.trim() ? rawLocation.trim() : null;

    events.push({
      kidName,
      title: event.summary?.trim() || '(No title)',
      start,
      end,
      allDay,
      location,
    });
  }

  return events;
}

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
