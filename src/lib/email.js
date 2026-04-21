import emailjs from '@emailjs/browser'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const APP_URL = import.meta.env.VITE_APP_URL

/**
 * Sends a QR code link email to the newly registered participant.
 * Requires an EmailJS template with variables: to_name, to_email, qr_link, participant_code
 */
export async function sendQREmail({ name, email, participantId, entryCode }) {
  const qrLink = `${APP_URL}/qr/${participantId}`

  return emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_name: name,
      to_email: email,
      qr_link: qrLink,
      participant_code: entryCode ?? '',
      entry_code: entryCode ?? '',
      manual_code: entryCode ?? '',
    },
    PUBLIC_KEY,
  )
}
