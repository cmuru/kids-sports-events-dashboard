declare module 'ical.js' {
  class Component {
    constructor(jcal: unknown);
    getAllSubcomponents(name: string): Component[];
    getFirstPropertyValue<T>(name: string): T | null;
  }

  class Event {
    constructor(component: Component);
    summary: string;
    location: string;
    startDate: Time;
    endDate: Time;
  }

  class Time {
    isDate: boolean;
    year: number;
    month: number;
    day: number;
    toJSDate(): Date;
  }

  namespace TimezoneService {
    function register(component: Component): void;
  }

  namespace design {
    type designSet = unknown;
  }

  function parse(icsString: string): unknown;

  export { Component, Event, Time, TimezoneService, design, parse };
  const ICAL: { Component: typeof Component; Event: typeof Event; Time: typeof Time; TimezoneService: typeof TimezoneService; parse: typeof parse };
  export default ICAL;
}
