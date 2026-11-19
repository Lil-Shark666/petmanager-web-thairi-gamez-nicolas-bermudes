'use client'

import { useState } from 'react'
import { Pencil, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HealthBadge } from '@/components/health-badge'
import type { Pet } from '@/lib/pet-types'
import { cn } from '@/lib/utils'

type PetTableProps = {
  pets: Pet[]
  selectedPetId?: number
  onSelect: (pet: Pet) => void
  isDog: boolean
}

export function PetTable({ pets, selectedPetId, onSelect, isDog }: PetTableProps) {
  const [filter, setFilter] = useState('')
  const term = filter.trim().toLowerCase()
  const visible = term
    ? pets.filter((pet) =>
        [pet.code, pet.name, pet.breed, pet.color].some((value) =>
          value?.toLowerCase().includes(term),
        ),
      )
    : pets

  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-5" aria-label="Listado">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold">
          Listado de {isDog ? 'perros' : 'gatos'}{' '}
          <span className="font-normal text-muted-foreground">({pets.length})</span>
        </h2>
        <label className="relative sm:w-64">
          <span className="sr-only">Filtrar listado</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrar por código, nombre..."
            className="h-9 w-full rounded-md border border-input bg-background pr-3 pl-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th scope="col" className="py-2 pr-3 font-medium">Código</th>
              <th scope="col" className="py-2 pr-3 font-medium">Nombre</th>
              <th scope="col" className="py-2 pr-3 font-medium">Raza</th>
              <th scope="col" className="py-2 pr-3 font-medium">Año</th>
              <th scope="col" className="py-2 pr-3 font-medium">Color</th>
              <th scope="col" className="py-2 pr-3 font-medium">Salud</th>
              {isDog && <th scope="col" className="py-2 pr-3 font-medium">Pedigrí</th>}
              <th scope="col" className="py-2 font-medium">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((pet) => (
              <tr
                key={pet.petId}
                className={cn(
                  'border-b last:border-0',
                  pet.petId === selectedPetId && 'bg-accent',
                )}
              >
                <td className="py-2.5 pr-3 font-mono text-xs">{pet.code}</td>
                <td className="py-2.5 pr-3 font-medium">{pet.name}</td>
                <td className="py-2.5 pr-3">{pet.breed}</td>
                <td className="py-2.5 pr-3 tabular-nums">{pet.bornYear}</td>
                <td className="py-2.5 pr-3">{pet.color || '-'}</td>
                <td className="py-2.5 pr-3">
                  <HealthBadge status={pet.healthStatus} />
                </td>
                {isDog && <td className="py-2.5 pr-3">{pet.pedigree ? 'Sí' : 'No'}</td>}
                <td className="py-2.5 text-right">
                  <Button variant="ghost" size="sm" onClick={() => onSelect(pet)}>
                    <Pencil aria-hidden="true" />
                    Editar
                    <span className="sr-only">{pet.name}</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {pets.length === 0 ? 'Aún no hay registros.' : 'No hay resultados para el filtro.'}
          </p>
        )}
      </div>
    </section>
  )
}
