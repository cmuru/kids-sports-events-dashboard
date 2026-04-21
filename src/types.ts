export interface NormalizedEvent {
  kidName: string;
  title: string;
  /** ISO-8601 datetime (UTC) for timed events, YYYY-MM-DD for all-day events */
  start: string;
  /** ISO-8601 datetime (UTC) for timed events, YYYY-MM-DD for all-day events */
  end: string;
  allDay: boolean;
  location: string | null;
}

export interface KidData {
  name: string;
  seasonEndDate: string;
  events: NormalizedEvent[];
  fetchStatus: 'ok' | 'error';
}

export interface EventsData {
  /** ISO-8601 timestamp of when this file was generated */
  generatedAt: string;
  /** IANA timezone used for filtering */
  timezone: string;
  kids: KidData[];
}
