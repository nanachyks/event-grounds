import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

const FROM_EMAIL = 'bookings@eventgrounds.com'
const APP_NAME = process.env.APP_NAME || 'EventGrounds'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function sendBookingConfirmation(params: {
  customerEmail: string
  customerName: string
  groundName: string
  startDate: string
  endDate: string
  bookingId: string
  amount: number
}) {
  const { customerEmail, customerName, groundName, startDate, endDate, bookingId, amount } = params
  return resend.emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `Booking Confirmed - ${groundName}`,
    html: `
      <h1>Booking Confirmed!</h1>
      <p>Hi ${customerName},</p>
      <p>Your booking for <strong>${groundName}</strong> has been confirmed.</p>
      <p><strong>Dates:</strong> ${startDate} - ${endDate}</p>
      <p><strong>Amount Paid:</strong> GH₵${amount}</p>
      <p><strong>Reference:</strong> ${bookingId}</p>
      <p>Thank you for choosing ${APP_NAME}!</p>
    `,
  })
}

export async function sendAdminNewBooking(params: {
  adminEmail: string
  customerName: string
  groundName: string
  startDate: string
  endDate: string
  bookingId: string
}) {
  const { adminEmail, customerName, groundName, startDate, endDate, bookingId } = params
  return resend.emails.send({
    from: FROM_EMAIL,
    to: adminEmail,
    subject: `New Booking Request - ${groundName}`,
    html: `
      <h1>New Booking Request</h1>
      <p>A new booking has been submitted:</p>
      <ul>
        <li><strong>Customer:</strong> ${customerName}</li>
        <li><strong>Ground:</strong> ${groundName}</li>
        <li><strong>Dates:</strong> ${startDate} - ${endDate}</li>
        <li><strong>Booking ID:</strong> ${bookingId}</li>
      </ul>
      <p><a href="${APP_URL}/admin/bookings/${bookingId}">View Booking</a></p>
    `,
  })
}

export async function sendPasswordReset(params: {
  vendorEmail: string
  vendorName: string
  resetToken: string
}) {
  const { vendorEmail, vendorName, resetToken } = params
  const resetUrl = `${APP_URL}/vendor/reset-password?token=${resetToken}`
  return resend.emails.send({
    from: FROM_EMAIL,
    to: vendorEmail,
    subject: `Reset your ${APP_NAME} password`,
    html: `
      <h1>Password Reset</h1>
      <p>Hi ${vendorName},</p>
      <p>We received a request to reset your ${APP_NAME} vendor password. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  })
}

export async function sendVendorNotification(params: {
  vendorEmail: string
  vendorName: string
  groundName: string
  customerName: string
  startDate: string
  endDate: string
}) {
  const { vendorEmail, vendorName, groundName, customerName, startDate, endDate } = params
  return resend.emails.send({
    from: FROM_EMAIL,
    to: vendorEmail,
    subject: `New Booking - ${groundName}`,
    html: `
      <h1>Hi ${vendorName},</h1>
      <p>You have a new booking for <strong>${groundName}</strong>.</p>
      <ul>
        <li><strong>Customer:</strong> ${customerName}</li>
        <li><strong>Dates:</strong> ${startDate} - ${endDate}</li>
      </ul>
      <p>Please check your dashboard for details.</p>
    `,
  })
}
