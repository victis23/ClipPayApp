interface CreatorAvatarProps {
  name: string
  avatarUrl?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function CreatorAvatar({ name, avatarUrl, size = 'md', className = '' }: CreatorAvatarProps) {
  const sizeClass = SIZE_CLASSES[size]

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        aria-label={name}
        className={`rounded-full object-cover ${sizeClass} ${className}`}
      />
    )
  }

  return (
    <div
      aria-label={name}
      className={`rounded-full bg-cn-navy flex items-center justify-center font-semibold text-white select-none ${sizeClass} ${className}`}
    >
      {initials(name)}
    </div>
  )
}
