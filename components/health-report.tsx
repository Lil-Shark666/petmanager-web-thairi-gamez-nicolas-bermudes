import { buildHealthReport, type Pet } from '@/lib/pet-types'
import { HEALTH_COLORS, HEALTH_LABELS } from '@/components/health-badge'

function ReportCard({ title, pets }: { title: string; pets: Pet[] }) {
  const report = buildHealthReport(pets)
  const max = Math.max(1, ...report.map((row) => row.count))

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-5" aria-label={title}>
      <header className="flex items-baseline justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-sm text-muted-foreground">{pets.length} en total</span>
      </header>
      <ul className="flex flex-col gap-3">
        {report.map((row) => (
          <li key={row.status} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span>{HEALTH_LABELS[row.status] ?? row.status}</span>
              <span className="font-medium tabular-nums">{row.count}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${HEALTH_COLORS[row.status] ?? 'bg-primary'}`}
                style={{ width: `${(row.count / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function HealthReport({ dogs, cats }: { dogs: Pet[]; cats: Pet[] }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Reportes generados a partir de los estados de salud registrados en la base de datos.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <ReportCard title="Todas las mascotas" pets={[...dogs, ...cats]} />
        <ReportCard title="Perros" pets={dogs} />
        <ReportCard title="Gatos" pets={cats} />
      </div>
    </div>
  )
}
