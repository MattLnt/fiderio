import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  try {
    const { nom, email, sujet, message } = await req.json()

    if (!nom || !email || !message) {
      return NextResponse.json({ message: 'Champs obligatoires manquants' }, { status: 400 })
    }

    const result = await resend.emails.send({
      from: 'Fiderio Contact <noreply@fiderio.be>',
      to: 'contact@fiderio.be',
      replyTo: email,
      subject: sujet ? `[Contact Fiderio] ${sujet} — ${nom}` : `[Contact Fiderio] Nouveau message de ${nom}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #F4F6F8; border-radius: 12px;">
          <div style="background: #141414; padding: 24px 32px; border-radius: 10px 10px 0 0;">
            <h1 style="color: #fff; font-size: 20px; margin: 0;">Nouveau message via Fiderio</h1>
          </div>
          <div style="background: #fff; padding: 32px; border-radius: 0 0 10px 10px; border: 1px solid #F0F0F0;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; font-size: 13px; color: #9CA3AF; width: 120px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Nom</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; font-size: 14px; color: #141414;">${nom}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; font-size: 13px; color: #9CA3AF; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; font-size: 14px; color: #FF5A1F;">
                  <a href="mailto:${email}" style="color: #C2410C; text-decoration: none;">${email}</a>
                </td>
              </tr>
              ${sujet ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; font-size: 13px; color: #9CA3AF; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Sujet</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; font-size: 14px; color: #141414;">${sujet}</td>
              </tr>
              ` : ''}
            </table>
            <div>
              <p style="font-size: 13px; color: #9CA3AF; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px;">Message</p>
              <div style="background: #F4F6F8; border-radius: 8px; padding: 20px; font-size: 14px; color: #374151; line-height: 1.7; white-space: pre-wrap;">${message}</div>
            </div>
            <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #F3F4F6; text-align: center;">
              <a href="mailto:${email}" style="display: inline-block; background: #141414; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
                Répondre à ${nom} →
              </a>
            </div>
          </div>
          <p style="font-size: 11px; color: #9CA3AF; text-align: center; margin-top: 16px;">
            Message envoyé via le formulaire de contact de fiderio.be
          </p>
        </div>
      `,
    })

    if (result.error) {
      console.error('Resend a refusé l\'envoi:', result.error)
      return NextResponse.json({ message: 'Erreur lors de l\'envoi', detail: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resend error (exception):', error)
    return NextResponse.json({ message: 'Erreur lors de l\'envoi' }, { status: 500 })
  }
}