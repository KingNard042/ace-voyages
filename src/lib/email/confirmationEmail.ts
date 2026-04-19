import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'hello@acevoyages.net'

// ─── Booking confirmation ─────────────────────────────────────────────────────

interface BookingConfirmationProps {
  to: string
  customerName: string
  destination: string
  bookingRef: string
  travelDate: string
  totalAmount: number
}

export async function sendBookingConfirmation(props: BookingConfirmationProps) {
  const { to, customerName, destination, bookingRef, travelDate, totalAmount } = props

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Booking Confirmed — ${destination} | ACE Voyages`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;color:#1A1A2E">
        <div style="background:#1B3A6B;padding:32px;text-align:center">
          <h1 style="color:white;margin:0;font-size:24px">ACE <span style="color:#D4A017">Voyages</span></h1>
          <p style="color:rgba(255,255,255,0.7);margin:8px 0 0">Nigeria's Most Trusted Travel Partner</p>
        </div>
        <div style="padding:32px;background:#F8F9FA">
          <h2 style="color:#1B3A6B;margin-top:0">Your booking is confirmed! 🎉</h2>
          <p>Hi ${customerName},</p>
          <p>We're delighted to confirm your trip to <strong>${destination}</strong>.</p>
          <table style="width:100%;border-collapse:collapse;margin:24px 0">
            <tr><td style="padding:8px 0;color:#6B7280">Booking Reference</td><td style="font-weight:600">${bookingRef}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280">Destination</td><td style="font-weight:600">${destination}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280">Travel Date</td><td style="font-weight:600">${travelDate}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280">Amount Paid</td><td style="font-weight:600">₦${totalAmount.toLocaleString('en-NG')}</td></tr>
          </table>
          <p>Need help? WhatsApp us: <a href="https://wa.me/2348061640504" style="color:#1B3A6B">+234 806 164 0504</a></p>
          <p style="color:#6B7280;font-size:13px;margin-top:32px">ACE Voyages Ltd · E1-024 HFP Eastline Shopping Complex, Lekki, Lagos</p>
        </div>
      </div>`,
  })
}

// ─── Lead acknowledgement ─────────────────────────────────────────────────────

interface LeadAckProps {
  to: string
  customerName: string
  destination: string
}

export async function sendLeadAcknowledgement({ to, customerName, destination }: LeadAckProps) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `We received your enquiry — ${destination} | ACE Voyages`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;color:#1A1A2E">
        <div style="background:#1B3A6B;padding:32px;text-align:center">
          <h1 style="color:white;margin:0;font-size:24px">ACE <span style="color:#D4A017">Voyages</span></h1>
        </div>
        <div style="padding:32px;background:#F8F9FA">
          <p>Hi ${customerName},</p>
          <p>Thanks for reaching out! We've received your enquiry about <strong>${destination}</strong> and our team will be in touch within 60 minutes via WhatsApp.</p>
          <p>In the meantime, you can reach us directly:</p>
          <p><a href="https://wa.me/2348061640504" style="color:#1B3A6B;font-weight:600">WhatsApp: +234 806 164 0504</a></p>
          <p style="color:#6B7280;font-size:13px;margin-top:32px">ACE Voyages Ltd · hello@acevoyages.net</p>
        </div>
      </div>`,
  })
}
