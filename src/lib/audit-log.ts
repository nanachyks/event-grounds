import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { logError } from "@/lib/logger"
import type { SessionUser } from "@/lib/auth-helpers"

export async function logAudit({
  actor,
  action,
  targetType,
  targetId,
  metadata,
}: {
  actor: SessionUser
  action: string
  targetType: "ground" | "booking"
  targetId: string
  metadata?: Record<string, string | number | boolean | null | undefined>
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorType: actor.role,
        actorId: actor.role === "admin" ? "admin" : actor.vendorId!,
        actorName: actor.name ?? actor.email ?? actor.role,
        action,
        targetType,
        targetId,
        metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    })
  } catch (error) {
    logError("audit-log.write", error, { action, targetType, targetId })
  }
}
