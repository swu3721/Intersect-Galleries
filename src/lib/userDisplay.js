export function stringToColor(seed) {
  const str = String(seed ?? '');
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = str.charCodeAt(i) + ((h << 5) - h);
  }
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 42% 40%)`;
}

export function coverColorFromSeed(seed) {
  const str = String(seed ?? '');
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = str.charCodeAt(i) + ((h << 5) - h);
  }
  const hue = Math.abs(h + 40) % 360;
  return `hsl(${hue} 50% 22%)`;
}

export function initialsFromName(name) {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
