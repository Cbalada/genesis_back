export function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDateOnly(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateOnly(): string {
  return formatDateOnly(new Date());
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const start = parseDateOnly(checkIn);
  const end = parseDateOnly(checkOut);
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function datesOverlap(
  checkInA: string,
  checkOutA: string,
  checkInB: string,
  checkOutB: string,
): boolean {
  return checkInA < checkOutB && checkOutA > checkInB;
}

export function addHoursToDate(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export function parseCheckInDateTime(checkIn: string): Date {
  return parseDateOnly(checkIn);
}
