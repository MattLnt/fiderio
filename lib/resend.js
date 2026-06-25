import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM || 'Fiderio <noreply@fiderio.be>'

export async function sendEmail({ to, subject, html, replyTo }) {
  try {
    const payload = { from: FROM, to, subject, html }
    if (replyTo) payload.replyTo = replyTo

    const result = await resend.emails.send(payload)

    // Resend ne lève pas d'exception : il renvoie { data, error }.
    if (result.error) {
      console.error('[EMAIL] Resend a refusé l\'envoi:', result.error)
      return { ok: false, error: result.error }
    }

    console.log(`[EMAIL] Envoyé à ${to} — ${subject} (id: ${result.data?.id})`)
    return { ok: true, id: result.data?.id }
  } catch (error) {
    console.error('[EMAIL] Exception:', error.message)
    return { ok: false, error: error.message }
  }
}