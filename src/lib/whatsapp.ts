// Meta WhatsApp Cloud API helper
// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/messages

const GRAPH_URL = 'https://graph.facebook.com/v18.0'

interface SendTextOptions {
  to: string   // E.164 format, e.g. +2348061640504
  text: string
}

interface SendTemplateOptions {
  to: string
  templateName: string
  languageCode?: string
  components?: object[]
}

function getConfig() {
  const phoneId = process.env.META_WHATSAPP_PHONE_ID
  const token = process.env.META_WHATSAPP_TOKEN
  if (!phoneId || !token) throw new Error('META_WHATSAPP_PHONE_ID or META_WHATSAPP_TOKEN not set')
  return { phoneId, token }
}

function normalisePhone(phone: string) {
  return phone.startsWith('+') ? phone.replace(/[^\d+]/g, '') : phone.replace(/\D/g, '')
}

export async function sendWhatsAppText({ to, text }: SendTextOptions): Promise<boolean> {
  const { phoneId, token } = getConfig()
  const res = await fetch(`${GRAPH_URL}/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: normalisePhone(to),
      type: 'text',
      text: { body: text },
    }),
  })
  if (!res.ok) console.error('[WhatsApp] Send text failed:', await res.json())
  return res.ok
}

export async function sendWhatsAppTemplate({
  to,
  templateName,
  languageCode = 'en',
  components = [],
}: SendTemplateOptions): Promise<boolean> {
  const { phoneId, token } = getConfig()
  const res = await fetch(`${GRAPH_URL}/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: normalisePhone(to),
      type: 'template',
      template: { name: templateName, language: { code: languageCode }, components },
    }),
  })
  if (!res.ok) console.error('[WhatsApp] Send template failed:', await res.json())
  return res.ok
}

export function verifyWebhookToken(token: string): boolean {
  return token === process.env.META_WHATSAPP_VERIFY_TOKEN
}
