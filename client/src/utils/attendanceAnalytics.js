export function computeTopThreeBarData(employeeStats = []) {
  return [...employeeStats]
    .sort((a, b) => b.presentPct - a.presentPct)
    .slice(0, 3)
    .map((s) => ({
      name: s.name.length > 12 ? s.name.slice(0, 10) + "..." : s.name,
      pct: Math.round(s.presentPct * 100),
    }));
}
