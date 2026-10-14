import type { IsoDateTime } from '@/types/IsoDateTime.ts';

// сроки задаются по времени университета, а не по часовому поясу браузера
const TIME_ZONE = 'Europe/Moscow';

const dayMonthFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  timeZone: TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: TIME_ZONE,
});

// «15 октября»
export function formatDayMonth(isoDate: IsoDateTime): string {
  return dayMonthFormatter.format(new Date(isoDate));
}

// «15 октября, 23:59»
export function formatDateTime(isoDate: IsoDateTime): string {
  const date = new Date(isoDate);
  return `${dayMonthFormatter.format(date)}, ${timeFormatter.format(date)}`;
}
