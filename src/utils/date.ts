export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addMinutes(date: Date, minutes: number) {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + minutes);
  return next;
}

export function toDateInputValue(iso?: string) {
  if (!iso) {
    return "";
  }

  const value = new Date(iso);
  const offset = value.getTimezoneOffset();
  const adjusted = new Date(value.getTime() - offset * 60000);
  return adjusted.toISOString().slice(0, 10);
}

export function fromDateInputValueStart(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return date.toISOString();
}

export function fromDateInputValueEnd(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return date.toISOString();
}
