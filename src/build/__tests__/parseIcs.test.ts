import { describe, it, expect } from 'vitest';
import { parseIcs } from '../parseIcs.js';

const timedEventIcs = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20260503T140000Z
DTEND:20260503T160000Z
SUMMARY:Soccer Game
LOCATION:Main Field
UID:timed-1@test
END:VEVENT
END:VCALENDAR`;

const allDayEventIcs = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260615
DTEND;VALUE=DATE:20260616
SUMMARY:Tournament Day
UID:allday-1@test
END:VEVENT
END:VCALENDAR`;

const noLocationIcs = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20260601T090000Z
DTEND:20260601T110000Z
SUMMARY:Practice
UID:noloc-1@test
END:VEVENT
END:VCALENDAR`;

const exoticTzIcs = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VTIMEZONE
TZID:America/New_York
BEGIN:STANDARD
DTSTART:19671029T020000
RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10
TZNAME:EST
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
END:STANDARD
BEGIN:DAYLIGHT
DTSTART:19870405T020000
RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=4
TZNAME:EDT
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
END:DAYLIGHT
END:VTIMEZONE
BEGIN:VEVENT
DTSTART;TZID=America/New_York:20260510T100000
DTEND;TZID=America/New_York:20260510T120000
SUMMARY:Away Game
UID:tz-1@test
END:VEVENT
END:VCALENDAR`;

const malformedIcs = `this is not valid ical data at all !!!`;

const multipleEventsIcs = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20260503T140000Z
DTEND:20260503T160000Z
SUMMARY:Game 1
LOCATION:Field A
UID:multi-1@test
END:VEVENT
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260601
DTEND;VALUE=DATE:20260602
SUMMARY:All Day Event
UID:multi-2@test
END:VEVENT
END:VCALENDAR`;

describe('parseIcs', () => {
  it('parses a standard timed event', () => {
    const events = parseIcs(timedEventIcs, 'Alex');
    expect(events).toHaveLength(1);
    const e = events[0];
    expect(e.kidName).toBe('Alex');
    expect(e.title).toBe('Soccer Game');
    expect(e.allDay).toBe(false);
    expect(e.start).toBe('2026-05-03T14:00:00.000Z');
    expect(e.location).toBe('Main Field');
  });

  it('parses an all-day event', () => {
    const events = parseIcs(allDayEventIcs, 'Sam');
    expect(events).toHaveLength(1);
    const e = events[0];
    expect(e.allDay).toBe(true);
    expect(e.start).toBe('2026-06-15');
    expect(e.end).toBe('2026-06-16');
    expect(e.title).toBe('Tournament Day');
  });

  it('sets location to null when LOCATION is absent', () => {
    const events = parseIcs(noLocationIcs, 'Alex');
    expect(events[0].location).toBeNull();
  });

  it('handles an event with an exotic TZID', () => {
    const events = parseIcs(exoticTzIcs, 'Sam');
    expect(events).toHaveLength(1);
    const e = events[0];
    expect(e.allDay).toBe(false);
    expect(e.title).toBe('Away Game');
    // 10am EDT = 14:00 UTC
    expect(e.start).toBe('2026-05-10T14:00:00.000Z');
  });

  it('throws a clear error for a malformed feed', () => {
    expect(() => parseIcs(malformedIcs, 'Alex')).toThrow(/Failed to parse ICS for "Alex"/);
  });

  it('parses multiple events from one feed', () => {
    const events = parseIcs(multipleEventsIcs, 'Alex');
    expect(events).toHaveLength(2);
    expect(events.find(e => e.allDay)).toBeTruthy();
    expect(events.find(e => !e.allDay)).toBeTruthy();
  });
});
