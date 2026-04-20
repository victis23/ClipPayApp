interface FTCNoticeProps {
  ftcLabel: string
  className?: string
}

export function FTCNotice({ ftcLabel, className = '' }: FTCNoticeProps) {
  return (
    <div
      role="note"
      aria-label="FTC disclosure requirement"
      className={`flex items-start gap-2 rounded-lg bg-cn-amber/10 border border-cn-amber/30 p-3 text-sm ${className}`}
    >
      <span aria-hidden="true" className="text-cn-amber mt-0.5">⚠️</span>
      <p className="text-cn-text">
        All clips must include the <span className="font-semibold text-cn-amber">{ftcLabel}</span> disclosure
        clearly visible in the video to comply with FTC guidelines.
      </p>
    </div>
  )
}
