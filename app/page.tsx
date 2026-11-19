import { listAllPets } from '@/lib/pets'
import { PetManager } from '@/components/pet-manager'

export const dynamic = 'force-dynamic'

export default async function Page() {
  try {
    const { dogs, cats } = await listAllPets()
    return <PetManager dogs={dogs} cats={cats} />
  } catch {
    return (
      <main className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center gap-2 p-6 text-center">
        <h1 className="text-xl font-semibold">Pet Manager</h1>
        <p className="text-muted-foreground">
          Could not connect to the database. Please verify the Supabase integration.
        </p>
      </main>
    )
  }
}
