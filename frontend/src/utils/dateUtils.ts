export function getWeekDays(date: Date): Date[] {
  const start = getMonday(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isSameDay(a: Date | string, b: Date | string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate();
}

export function isToday(date: Date | string): boolean {
  return isSameDay(date, new Date());
}

export function getTimePosition(date: Date | string, startHour = 6): number {
  const d = new Date(date);
  const hours = d.getHours() + d.getMinutes() / 60;
  return Math.max(0, hours - startHour);
}

export function getDurationHours(start: Date | string, end: Date | string): number {
  return (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
}

export function addHoursToDate(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export function getWeekRange(date: Date): { start: string; end: string } {
  const monday = getMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday.toISOString(), end: sunday.toISOString() };
}

export function minutesToDisplay(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}
