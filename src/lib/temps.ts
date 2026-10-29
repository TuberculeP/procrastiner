// Les heures sont manipulées en minutes depuis minuit.

export const DUREE_MAX = 12 * 60

/** Heure actuelle arrondie aux 5 minutes supérieures. */
export function maintenantArrondi(): number {
  const d = new Date()
  const minutes = d.getHours() * 60 + d.getMinutes()
  return Math.ceil(minutes / 5) * 5
}

/** "17:30" → 1050 */
export function lireHeure(texte: string): number | undefined {
  const m = /^(\d{1,2}):(\d{2})$/.exec(texte)
  if (!m) return undefined
  return Number(m[1]) * 60 + Number(m[2])
}

/** 1050 → "17:30" (gère le passage de minuit). */
export function formatHeure(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/** 130 → "2h10", 45 → "45 min", 120 → "2h" */
export function formatDuree(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}
