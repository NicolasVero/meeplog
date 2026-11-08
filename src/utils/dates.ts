export function ISODate() {
  return new Date().toISOString().split('T')[0];
}
