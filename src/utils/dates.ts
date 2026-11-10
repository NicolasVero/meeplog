import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

/** "vendredi 14 novembre 2026" */
export function formatLongDate(iso: string) {
  return dayjs(iso).format('dddd D MMMM YYYY');
}

/** "14/11/2026" */
export function formatShortDate(iso: string) {
  return dayjs(iso).format('DD/MM/YYYY');
}
