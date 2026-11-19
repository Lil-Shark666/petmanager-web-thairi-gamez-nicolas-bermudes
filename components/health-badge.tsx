import { cn } from '@/lib/utils'

export const HEALTH_LABELS: Record<string, string> = {
  Healthy: 'Sano',
  Sick: 'Enfermo',
  'In Surgery': 'En cirugía',
}

export const HEALTH_COLORS: Record<string, string> = {
  Healthy: 'bg-healthy',
  Sick: 'bg-sick',
  'In Surgery': 'bg-surgery',
}

export function HealthBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2 py-0.5 text-xs font-medium">
      <span
        aria-hidden="true"
        className={cn('size-2 rounded-full', HEALTH_COLORS[status] ?? 'bg-muted-foreground')}
      />
      {HEALTH_LABELS[status] ?? status}
    </span>
  )
}
