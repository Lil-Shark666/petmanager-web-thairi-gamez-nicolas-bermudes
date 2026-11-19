export const HEALTH_STATUSES = ['Sick', 'Healthy', 'In Surgery'] as const
export const DOG_BREEDS = ['Criollo', 'Schnauzer', 'German shepherd', 'Pincher'] as const
export const CAT_BREEDS = ['Birman', 'British', 'Bombay', 'Abyssinian'] as const

export type AnimalType = 'dog' | 'cat'

export type Pet = {
  type: AnimalType
  petId: number
  animalId: number
  code: string
  name: string
  bornYear: number
  color: string
  healthStatus: string
  breed: string
  pedigree: boolean
}

export type HealthReportRow = {
  status: string
  count: number
}

export function buildHealthReport(pets: Pet[]): HealthReportRow[] {
  const counts = new Map<string, number>()
  for (const status of HEALTH_STATUSES) counts.set(status, 0)
  for (const pet of pets) {
    counts.set(pet.healthStatus, (counts.get(pet.healthStatus) ?? 0) + 1)
  }
  return Array.from(counts, ([status, count]) => ({ status, count }))
}
