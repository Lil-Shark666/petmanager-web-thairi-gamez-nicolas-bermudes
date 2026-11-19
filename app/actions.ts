'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { tableFor } from '@/lib/pets'
import {
  CAT_BREEDS,
  DOG_BREEDS,
  HEALTH_STATUSES,
  type AnimalType,
} from '@/lib/pet-types'

export type ActionResult = { ok: true; message: string } | { ok: false; message: string }

export type PetInput = {
  type: AnimalType
  petId?: number
  animalId?: number
  code: string
  name: string
  bornYear: number
  color: string
  healthStatus: string
  breed: string
  pedigree: boolean
}

function validate(input: PetInput): string | null {
  if (input.type !== 'dog' && input.type !== 'cat') return 'Tipo de animal inválido.'
  const code = input.code?.trim() ?? ''
  const name = input.name?.trim() ?? ''
  if (!code || code.length > 30) return 'El código es obligatorio (máx. 30 caracteres).'
  if (!name || name.length > 60) return 'El nombre es obligatorio (máx. 60 caracteres).'
  if ((input.color?.trim().length ?? 0) > 30) return 'El color debe tener máximo 30 caracteres.'
  const currentYear = new Date().getFullYear()
  if (!Number.isInteger(input.bornYear) || input.bornYear < 1980 || input.bornYear > currentYear) {
    return `El año de nacimiento debe estar entre 1980 y ${currentYear}.`
  }
  if (!(HEALTH_STATUSES as readonly string[]).includes(input.healthStatus)) {
    return 'Estado de salud inválido.'
  }
  const breeds: readonly string[] = input.type === 'dog' ? DOG_BREEDS : CAT_BREEDS
  if (!breeds.includes(input.breed)) return 'Raza inválida.'
  return null
}

function petColumns(input: PetInput) {
  return {
    code: input.code.trim(),
    name: input.name.trim(),
    born_year: input.bornYear,
    color: input.color.trim(),
    health_status: input.healthStatus,
  }
}

function animalColumns(input: PetInput) {
  return input.type === 'dog'
    ? { breed: input.breed, pedigree: Boolean(input.pedigree) }
    : { breed: input.breed }
}

async function codeTaken(code: string, excludePetId?: number) {
  let query = getSupabaseAdmin().from('tb_pet').select('id').eq('code', code.trim()).limit(1)
  if (excludePetId) query = query.neq('id', excludePetId)
  const { data } = await query
  return (data?.length ?? 0) > 0
}

export async function createPet(input: PetInput): Promise<ActionResult> {
  const invalid = validate(input)
  if (invalid) return { ok: false, message: invalid }
  if (await codeTaken(input.code)) {
    return { ok: false, message: `Ya existe una mascota con el código "${input.code.trim()}".` }
  }

  const supabase = getSupabaseAdmin()
  const { data: pet, error } = await supabase
    .from('tb_pet')
    .insert(petColumns(input))
    .select('id')
    .single()
  if (error || !pet) return { ok: false, message: 'No se pudo guardar la mascota.' }

  const { error: animalError } = await supabase
    .from(tableFor(input.type))
    .insert({ ...animalColumns(input), id_pet: pet.id })

  if (animalError) {
    await supabase.from('tb_pet').delete().eq('id', pet.id)
    return { ok: false, message: 'No se pudo guardar la mascota.' }
  }

  revalidatePath('/')
  return { ok: true, message: `${input.name.trim()} se guardó correctamente.` }
}

export async function updatePet(input: PetInput): Promise<ActionResult> {
  const invalid = validate(input)
  if (invalid) return { ok: false, message: invalid }
  if (!input.petId || !input.animalId) {
    return { ok: false, message: 'Busca o selecciona una mascota antes de editar.' }
  }
  if (await codeTaken(input.code, input.petId)) {
    return { ok: false, message: `Otra mascota ya usa el código "${input.code.trim()}".` }
  }

  const supabase = getSupabaseAdmin()
  const { data: updatedPet, error } = await supabase
    .from('tb_pet')
    .update(petColumns(input))
    .eq('id', input.petId)
    .select('id')
  if (error || !updatedPet?.length) return { ok: false, message: 'No se pudo editar la mascota.' }

  const { data: updatedAnimal, error: animalError } = await supabase
    .from(tableFor(input.type))
    .update(animalColumns(input))
    .eq('id', input.animalId)
    .eq('id_pet', input.petId)
    .select('id')
  if (animalError || !updatedAnimal?.length) {
    return { ok: false, message: 'No se pudo editar la mascota.' }
  }

  revalidatePath('/')
  return { ok: true, message: `${input.name.trim()} se actualizó correctamente.` }
}

export async function deletePet(type: AnimalType, petId: number): Promise<ActionResult> {
  if ((type !== 'dog' && type !== 'cat') || !Number.isInteger(petId)) {
    return { ok: false, message: 'Mascota inválida.' }
  }

  const supabase = getSupabaseAdmin()
  const { data: animal } = await supabase
    .from(tableFor(type))
    .select('id')
    .eq('id_pet', petId)
    .limit(1)
  if (!animal?.length) return { ok: false, message: 'Mascota no encontrada.' }

  const { error } = await supabase.from('tb_pet').delete().eq('id', petId)
  if (error) return { ok: false, message: 'No se pudo eliminar la mascota.' }

  revalidatePath('/')
  return { ok: true, message: 'La mascota se eliminó correctamente.' }
}
