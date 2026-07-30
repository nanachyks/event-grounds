import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default async function BookingConfirmPage({ searchParams }: { searchParams: Promise<{ bookingId: string; groundName: string }> }) {
  const { bookingId, groundName } = await searchParams

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <Card>
        <CardHeader>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-2xl font-bold">Inquiry Submitted!</h1>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Your booking inquiry for <strong>{groundName || "the ground"}</strong> has been received.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Reference: <span className="font-mono">{bookingId}</span>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Our team will review your request and get back to you within 24 hours with availability and payment details.
          </p>
          <p className="text-sm mb-6">
            <Link href={`/booking/${bookingId}`} className="text-green-600 hover:underline">Track your booking</Link>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/grounds"><Button variant="outline">Browse More Grounds</Button></Link>
            <Link href="/"><Button>Go Home</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
