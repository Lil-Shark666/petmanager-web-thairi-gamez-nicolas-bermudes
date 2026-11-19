'use client'

import { useState } from 'react'
import { Cat, Dog, Download, HeartPulse, PawPrint } from 'lucide-react'
import { PetForm } from '@/components/pet-form'
import { PetTable } from '@/components/pet-table'
import { HealthReport } from '@/components/health-report'
import type { Pet } from '@/lib/pet-types'
import { cn } from '@/lib/utils'

type Tab = 'dog' | 'cat' | 'reports'

const TABS: { id: Tab; label: string; icon: typeof Dog }[] = [
  { id: 'dog', label: 'Perros', icon: Dog },
  { id: 'cat', label: 'Gatos', icon: Cat },
  { id: 'reports', label: 'Reportes de salud', icon: HeartPulse },
]

const EXPORTS = [
  { kind: 'pets', label: 'Todas' },
  { kind: 'dogs', label: 'Perros' },
  { kind: 'cats', label: 'Gatos' },
]

export function PetManager({ dogs, cats }: { dogs: Pet[]; cats: Pet[] }) {
  const [tab, setTab] = useState<Tab>('dog')
  const [selectedDog, setSelectedDog] = useState<Pet | null>(null)
  const [selectedCat, setSelectedCat] = useState<Pet | null>(null)

  const stats = [
    { label: 'Mascotas', value: dogs.length + cats.length, icon: PawPrint },
    { label: 'Perros', value: dogs.length, icon: Dog },
    { label: 'Gatos', value: cats.length, icon: Cat },
  ]

  return (
    <div className="min-h-svh">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <PawPrint aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h1 className="text-lg font-semibold leading-tight">Pet Manager</h1>
              <p className="text-sm text-muted-foreground">Administración de mascotas</p>
            </div>
          </div>
          <nav aria-label="Exportar listados" className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Exportar CSV:</span>
            {EXPORTS.map((item) => (
              <a
                key={item.kind}
                href={`/api/export/${item.kind}`}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-sm font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <Download aria-hidden="true" className="size-3.5" />
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        <dl className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <stat.icon aria-hidden="true" className="hidden size-5 text-primary sm:block" />
              <div>
                <dt className="text-xs text-muted-foreground sm:text-sm">{stat.label}</dt>
                <dd className="text-2xl font-semibold tabular-nums">{stat.value}</dd>
              </div>
            </div>
          ))}
        </dl>

        <div
          role="tablist"
          aria-label="Secciones"
          className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1"
        >
          {TABS.map((item) => (
            <button
              key={item.id}
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls={`panel-${item.id}`}
              onClick={() => setTab(item.id)}
              className={cn(
                'inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                tab === item.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <item.icon aria-hidden="true" className="size-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === 'reports' ? (
            <HealthReport dogs={dogs} cats={cats} />
          ) : (
            <AnimalSection
              key={tab}
              type={tab}
              pets={tab === 'dog' ? dogs : cats}
              selected={tab === 'dog' ? selectedDog : selectedCat}
              onSelect={tab === 'dog' ? setSelectedDog : setSelectedCat}
            />
          )}
        </div>
      </main>
    </div>
  )
}

function AnimalSection({
  type,
  pets,
  selected,
  onSelect,
}: {
  type: 'dog' | 'cat'
  pets: Pet[]
  selected: Pet | null
  onSelect: (pet: Pet | null) => void
}) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[380px_1fr]">
      <PetForm type={type} pets={pets} selected={selected} onSelect={onSelect} />
      <PetTable
        pets={pets}
        isDog={type === 'dog'}
        selectedPetId={selected?.petId}
        onSelect={onSelect}
      />
    </div>
  )
}
