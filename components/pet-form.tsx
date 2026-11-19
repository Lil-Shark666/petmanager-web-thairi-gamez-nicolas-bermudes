'use client'

import { useState, useTransition } from 'react'
import { Save, Search, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createPet, deletePet, updatePet, type PetInput } from '@/app/actions'
import { HEALTH_LABELS } from '@/components/health-badge'
import {
  CAT_BREEDS,
  DOG_BREEDS,
  HEALTH_STATUSES,
  type AnimalType,
  type Pet,
} from '@/lib/pet-types'

type PetFormProps = {
  type: AnimalType
  pets: Pet[]
  selected: Pet | null
  onSelect: (pet: Pet | null) => void
}

type Status = { ok: boolean; message: string } | null

const fieldClass =
  'h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60'

export function PetForm({ type, pets, selected, onSelect }: PetFormProps) {
  const isDog = type === 'dog'
  const breeds = isDog ? DOG_BREEDS : CAT_BREEDS
  const [status, setStatus] = useState<Status>(null)
  const [searchCode, setSearchCode] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSearch() {
    const code = searchCode.trim()
    if (!code) return
    const found = pets.find((pet) => pet.code.toLowerCase() === code.toLowerCase())
    if (found) {
      onSelect(found)
      setStatus({ ok: true, message: `Se encontró a ${found.name}.` })
    } else {
      setStatus({ ok: false, message: `No se encontró ninguna mascota con el código "${code}".` })
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const input: PetInput = {
      type,
      petId: selected?.petId,
      animalId: selected?.animalId,
      code: String(data.get('code') ?? ''),
      name: String(data.get('name') ?? ''),
      bornYear: Number(data.get('bornYear')),
      color: String(data.get('color') ?? ''),
      healthStatus: String(data.get('healthStatus') ?? ''),
      breed: String(data.get('breed') ?? ''),
      pedigree: data.get('pedigree') === 'on',
    }
    const form = event.currentTarget

    startTransition(async () => {
      const result = selected ? await updatePet(input) : await createPet(input)
      setStatus(result)
      if (result.ok) {
        if (!selected) form.reset()
        onSelect(null)
      }
    })
  }

  function handleDelete() {
    if (!selected) return
    if (!window.confirm(`¿Eliminar a ${selected.name}? Esta acción no se puede deshacer.`)) return
    startTransition(async () => {
      const result = await deletePet(type, selected.petId)
      setStatus(result)
      if (result.ok) onSelect(null)
    })
  }

  function handleClear() {
    onSelect(null)
    setSearchCode('')
    setStatus(null)
  }

  const idPrefix = `${type}-form`

  return (
    <section className="flex flex-col gap-5 rounded-xl border bg-card p-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold">
          {selected ? `Editando: ${selected.name}` : `Registrar ${isDog ? 'perro' : 'gato'}`}
        </h2>
        <p className="text-sm text-muted-foreground">
          Busca por código o selecciona un registro del listado para editarlo o eliminarlo.
        </p>
      </div>

      <div className="flex gap-2">
        <label htmlFor={`${idPrefix}-search`} className="sr-only">
          Buscar por código
        </label>
        <input
          id={`${idPrefix}-search`}
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
              e.preventDefault()
              handleSearch()
            }
          }}
          placeholder="Buscar por código"
          className={fieldClass}
        />
        <Button type="button" variant="secondary" className="h-9" onClick={handleSearch}>
          <Search aria-hidden="true" />
          Buscar
        </Button>
      </div>

      <form
        key={selected?.petId ?? 'new'}
        onSubmit={handleSubmit}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="Código" htmlFor={`${idPrefix}-code`}>
          <input
            id={`${idPrefix}-code`}
            name="code"
            required
            maxLength={30}
            defaultValue={selected?.code}
            className={fieldClass}
          />
        </Field>
        <Field label="Nombre" htmlFor={`${idPrefix}-name`}>
          <input
            id={`${idPrefix}-name`}
            name="name"
            required
            maxLength={60}
            defaultValue={selected?.name}
            className={fieldClass}
          />
        </Field>
        <Field label="Año de nacimiento" htmlFor={`${idPrefix}-year`}>
          <input
            id={`${idPrefix}-year`}
            name="bornYear"
            type="number"
            required
            min={1980}
            max={new Date().getFullYear()}
            defaultValue={selected?.bornYear ?? new Date().getFullYear()}
            className={fieldClass}
          />
        </Field>
        <Field label="Color" htmlFor={`${idPrefix}-color`}>
          <input
            id={`${idPrefix}-color`}
            name="color"
            maxLength={30}
            defaultValue={selected?.color}
            className={fieldClass}
          />
        </Field>
        <Field label="Estado de salud" htmlFor={`${idPrefix}-health`}>
          <select
            id={`${idPrefix}-health`}
            name="healthStatus"
            defaultValue={selected?.healthStatus ?? HEALTH_STATUSES[0]}
            className={fieldClass}
          >
            {HEALTH_STATUSES.map((value) => (
              <option key={value} value={value}>
                {HEALTH_LABELS[value]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Raza" htmlFor={`${idPrefix}-breed`}>
          <select
            id={`${idPrefix}-breed`}
            name="breed"
            defaultValue={selected?.breed ?? breeds[0]}
            className={fieldClass}
          >
            {breeds.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </Field>
        {isDog && (
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              name="pedigree"
              defaultChecked={selected?.pedigree}
              className="size-4 accent-primary"
            />
            Tiene pedigrí
          </label>
        )}

        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" className="h-9" disabled={isPending}>
            <Save aria-hidden="true" />
            {selected ? 'Guardar cambios' : 'Guardar'}
          </Button>
          {selected && (
            <Button
              type="button"
              variant="destructive"
              className="h-9"
              disabled={isPending}
              onClick={handleDelete}
            >
              <Trash2 aria-hidden="true" />
              Eliminar
            </Button>
          )}
          <Button type="button" variant="outline" className="h-9" onClick={handleClear}>
            <X aria-hidden="true" />
            Limpiar
          </Button>
        </div>
      </form>

      <p
        role="status"
        aria-live="polite"
        className={status ? (status.ok ? 'text-sm text-primary' : 'text-sm text-destructive') : 'sr-only'}
      >
        {status?.message}
      </p>
    </section>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  )
}
