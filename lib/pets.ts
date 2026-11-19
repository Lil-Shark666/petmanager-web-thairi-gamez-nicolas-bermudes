import 'server-only'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { AnimalType, Pet } from '@/lib/pet-types'

type PetRow = {
  id: number
  code: string
  name: string
  born_year: number
  color: string
  health_status: string
}

type AnimalRow = {
  id: number
  breed: string
  pedigree?: boolean
  id_pet: number
  tb_pet: PetRow | PetRow[] | null
}

export const tableFor = (type: AnimalType) => (type === 'dog' ? 'tb_dog' : 'tb_cat')

function toPet(type: AnimalType, row: AnimalRow): Pet | null {
  const pet = Array.isArray(row.tb_pet) ? row.tb_pet[0] : row.tb_pet
  if (!pet) return null
  return {
    type,
    petId: pet.id,
    animalId: row.id,
    code: pet.code,
    name: pet.name,
    bornYear: pet.born_year,
    color: pet.color,
    healthStatus: pet.health_status,
    breed: row.breed,
    pedigree: Boolean(row.pedigree),
  }
}

export async function listPets(type: AnimalType): Promise<Pet[]> {
  const columns =
    type === 'dog'
      ? 'id, breed, pedigree, id_pet, tb_pet(id, code, name, born_year, color, health_status)'
      : 'id, breed, id_pet, tb_pet(id, code, name, born_year, color, health_status)'

  const { data, error } = await getSupabaseAdmin()
    .from(tableFor(type))
    .select(columns)
    .order('id', { ascending: true })

  if (error) throw new Error(error.message)
  return ((data ?? []) as unknown as AnimalRow[])
    .map((row) => toPet(type, row))
    .filter((pet): pet is Pet => pet !== null)
}

export async function listAllPets() {
  const [dogs, cats] = await Promise.all([listPets('dog'), listPets('cat')])
  return { dogs, cats }
}
