import { listAllPets } from '@/lib/pets'
import type { Pet } from '@/lib/pet-types'

const KINDS = ['pets', 'dogs', 'cats'] as const
type Kind = (typeof KINDS)[number]

function csvCell(value: string | number | boolean) {
  let text = String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

function toCsv(pets: Pet[], kind: Kind) {
  const header = ['Type', 'Code', 'Name', 'Born year', 'Color', 'Health status', 'Breed']
  if (kind !== 'cats') header.push('Pedigree')
  const rows = pets.map((pet) => {
    const row: (string | number | boolean)[] = [
      pet.type === 'dog' ? 'Dog' : 'Cat',
      pet.code,
      pet.name,
      pet.bornYear,
      pet.color,
      pet.healthStatus,
      pet.breed,
    ]
    if (kind !== 'cats') row.push(pet.type === 'dog' ? (pet.pedigree ? 'Yes' : 'No') : '-')
    return row.map(csvCell).join(',')
  })
  return '\uFEFF' + [header.map(csvCell).join(','), ...rows].join('\r\n')
}

export async function GET(_request: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params
  if (!(KINDS as readonly string[]).includes(kind)) {
    return new Response('Not found', { status: 404 })
  }

  const { dogs, cats } = await listAllPets()
  const pets = kind === 'dogs' ? dogs : kind === 'cats' ? cats : [...dogs, ...cats]
  const date = new Date().toISOString().slice(0, 10)

  return new Response(toCsv(pets, kind as Kind), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${kind}-list-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
