interface StatCardProps {
  label: string
  value: string
  sub?: string
  accent?: string
  className?: string
}

export function StatCard({ label, value, sub, accent, className = '' }: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-cn-border shadow-sm p-5 flex flex-col gap-1 ${className}`}
    >
      {accent && (
        <div className="w-8 h-1 rounded-full mb-1" style={{ backgroundColor: accent }} />
      )}
      <p className="text-sm text-cn-muted font-medium">{label}</p>
      <p className="text-2xl font-bold text-cn-text tracking-tight">{value}</p>
      {sub && <p className="text-xs text-cn-muted">{sub}</p>}
    </div>
  )
}
