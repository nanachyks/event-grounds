import { requireVendor } from "@/lib/auth-helpers"
import GroundForm from "@/components/grounds/ground-form"

export default async function NewVendorGroundPage() {
  const vendor = await requireVendor()
  if (!vendor) return null

  return <GroundForm mode="create" redirectTo="/vendor/grounds" />
}
