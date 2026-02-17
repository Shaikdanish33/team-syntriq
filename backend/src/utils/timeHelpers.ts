const LOCK_WINDOW_MS = 24 * 60 * 60 * 1000

// Returns true when an item is still editable inside the 24-hour window.
export function isWithin24Hours(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() <= LOCK_WINDOW_MS
}
