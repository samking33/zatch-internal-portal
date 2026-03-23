const DEFAULT_LOCALE = 'en-IN';
const IST_TIME_ZONE = 'Asia/Kolkata';

export const formatDateInIst = (value: Date | string): string =>
  new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    timeZone: IST_TIME_ZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

export const formatTimeInIst = (value: Date | string): string =>
  new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    timeZone: IST_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value));

export const formatDateTimeInIst = (value: Date | string): string =>
  `${formatDateInIst(value)} ${formatTimeInIst(value)}`;

export const toIstIsoString = (value: Date | string): string => {
  const date = new Date(value);
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: IST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date).replace(' ', 'T');
};
