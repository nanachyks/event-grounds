export interface GroundData {
  id: string
  name: string
  description: string
  location: string
  capacity: number
  price: number
  images: string[]
  amenities: string[]
  status: string
  vendorName: string
  createdAt: Date
}

export interface BookingData {
  id: string
  groundId: string
  groundName: string
  customerName: string
  customerEmail: string
  customerPhone: string
  startDate: Date
  endDate: Date
  message: string | null
  status: string
  amount: number | null
  createdAt: Date
}

export interface PaymentData {
  id: string
  bookingId: string
  paystackRef: string
  amount: number
  commission: number
  vendorNet: number
  status: string
}
