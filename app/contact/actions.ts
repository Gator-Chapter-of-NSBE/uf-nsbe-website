'use server'

import { Resend } from 'resend'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Name of the hidden honeypot field rendered by the contact form.
export const CONTACT_HONEYPOT_FIELD = 'company_website'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function submitContactForm(values: Record<string, string>): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY
  const contactEmail = process.env.CONTACT_EMAIL
  const fromEmail = process.env.FROM_EMAIL

  if (!resendApiKey || !contactEmail || !fromEmail) {
    console.error('[v0] Contact form is missing required environment variables.')
    throw new Error('The contact form is not configured yet. Please try again later.')
  }

  // Honeypot: bots tend to fill in every field, including hidden ones. Real visitors leave it blank.
  if (values[CONTACT_HONEYPOT_FIELD]?.trim()) {
    return
  }

  const name = values.name?.trim()
  const email = values.email?.trim()
  const organization = values.organization?.trim()
  const topic = values.topic?.trim()
  const message = values.message?.trim()

  if (!name) throw new Error('Please enter your name.')
  if (!email || !EMAIL_REGEX.test(email)) throw new Error('Please enter a valid email address.')
  if (!topic) throw new Error('Please select a topic.')
  if (!message) throw new Error('Please enter a message.')

  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeOrganization = organization ? escapeHtml(organization) : null
  const safeTopic = escapeHtml(topic)
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />')

  const resend = new Resend(resendApiKey)

  try {
    // Notification email to the chapter inbox — officers can reply directly to the sender.
    await resend.emails.send({
      from: fromEmail,
      to: contactEmail,
      replyTo: email,
      subject: `UF NSBE website contact form: ${topic}`,
      html: `
        <p>New message submitted from the UF NSBE website contact form.</p>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        ${safeOrganization ? `<p><strong>Organization:</strong> ${safeOrganization}</p>` : ''}
        <p><strong>Topic:</strong> ${safeTopic}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      `,
    })

    // Confirmation email back to the person who submitted the form.
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'We received your message — UF NSBE',
      html: `
        <p>Hi ${safeName},</p>
        <p>Thanks for reaching out to the University of Florida Gator Chapter of NSBE! We've received your message and a member of our team will get back to you soon.</p>
        <p><strong>Your message:</strong></p>
        <p>${safeMessage}</p>
        <p>— UF NSBE</p>
      `,
    })
  } catch (error) {
    console.error('[v0] Failed to send contact form emails:', error)
    throw new Error('Something went wrong while sending your message. Please try again in a moment.')
  }
}
