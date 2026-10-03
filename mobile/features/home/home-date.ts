const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/**
 * Short local date for the Home header, e.g. "Seg, 28 de jan". Built by
 * hand instead of `Intl.DateTimeFormat`, whose pt-BR output (and support)
 * varies between JS engines.
 */
export function formatHomeDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} de ${MONTHS[date.getMonth()]}`;
}
