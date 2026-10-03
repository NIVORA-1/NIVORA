/**
 * Calendar export helpers for Nivora Events
 */

interface CalendarEventData {
  title: string;
  description: string;
  venue: string;
  eventDate: string | Date;
  startTime: string;
  endTime: string;
}

function parseTimeToHoursMinutes(timeStr: string): { hours: number; minutes: number } {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return { hours: 9, minutes: 0 };
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3]?.toUpperCase();

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return { hours, minutes };
}

function formatToICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function generateGoogleCalendarUrl(event: CalendarEventData): string {
  const baseDate = new Date(event.eventDate);
  const start = parseTimeToHoursMinutes(event.startTime);
  const end = parseTimeToHoursMinutes(event.endTime);

  const startDate = new Date(baseDate);
  startDate.setHours(start.hours, start.minutes, 0, 0);

  const endDate = new Date(baseDate);
  endDate.setHours(end.hours, end.minutes, 0, 0);

  const startIso = formatToICSDate(startDate);
  const endIso = formatToICSDate(endDate);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startIso}/${endIso}`,
    details: `${event.description}\n\nVenue: ${event.venue}\nOrganized via Nivora`,
    location: event.venue,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadICSFile(event: CalendarEventData) {
  const baseDate = new Date(event.eventDate);
  const start = parseTimeToHoursMinutes(event.startTime);
  const end = parseTimeToHoursMinutes(event.endTime);

  const startDate = new Date(baseDate);
  startDate.setHours(start.hours, start.minutes, 0, 0);

  const endDate = new Date(baseDate);
  endDate.setHours(end.hours, end.minutes, 0, 0);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Nivora Student OS//Campus Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}-${Math.random().toString(36).substring(2, 9)}@nivora.edu`,
    `DTSTAMP:${formatToICSDate(new Date())}`,
    `DTSTART:${formatToICSDate(startDate)}`,
    `DTEND:${formatToICSDate(endDate)}`,
    `SUMMARY:${event.title.replace(/[,;]/g, '')}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.venue.replace(/[,;]/g, '')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
