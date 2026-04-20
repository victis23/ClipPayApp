export function calculateEarnings(views: number, cpmRate: number): number {
  return (views / 1000) * cpmRate
}
