import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

const ACTION_LABEL: Record<string, string> = {
  "ground.approve": "Approved ground",
  "ground.reject": "Rejected ground",
  "ground.delete": "Deleted ground",
  "booking.approve": "Approved booking",
  "booking.cancel": "Cancelled booking",
}

const ACTION_VARIANT: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  "ground.approve": "success",
  "ground.reject": "danger",
  "ground.delete": "danger",
  "booking.approve": "info",
  "booking.cancel": "warning",
}

function targetHref(entry: { targetType: string; targetId: string }) {
  return entry.targetType === "ground" ? `/admin/grounds/${entry.targetId}/edit` : `/admin/bookings/${entry.targetId}`
}

export default async function AdminAuditLogPage() {
  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Audit Log</h2>
      <p className="text-gray-500 text-sm mb-6">The last 100 approvals, rejections, cancellations, and deletions across the platform.</p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Action</th>
              <th className="text-left px-4 py-3 font-medium">Actor</th>
              <th className="text-left px-4 py-3 font-medium">Details</th>
              <th className="text-left px-4 py-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Badge variant={ACTION_VARIANT[entry.action] ?? "default"}>
                    {ACTION_LABEL[entry.action] ?? entry.action}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{entry.actorName}</p>
                  <p className="text-gray-500 text-xs capitalize">{entry.actorType}</p>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  <Link href={targetHref(entry)} className="hover:underline">
                    {entry.metadata && typeof entry.metadata === "object" && "groundName" in entry.metadata
                      ? String((entry.metadata as Record<string, unknown>).groundName)
                      : entry.metadata && typeof entry.metadata === "object" && "customerName" in entry.metadata
                      ? String((entry.metadata as Record<string, unknown>).customerName)
                      : entry.targetId}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {entry.createdAt.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && <p className="text-gray-500 text-center py-10">No admin actions logged yet.</p>}
      </div>
    </div>
  )
}
