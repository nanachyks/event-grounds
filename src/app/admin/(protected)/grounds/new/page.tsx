import { prisma } from "@/lib/prisma"
import GroundForm from "@/components/grounds/ground-form"

export default async function NewGroundPage() {
  const vendors = await prisma.vendor.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } })

  return <GroundForm mode="create" vendors={vendors} redirectTo="/admin/grounds" />
}
