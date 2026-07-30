"use client"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function LogoutButton({ redirectTo }: { redirectTo: string }) {
  return (
    <Button variant="outline" onClick={() => signOut({ callbackUrl: redirectTo })}>
      Logout
    </Button>
  )
}
