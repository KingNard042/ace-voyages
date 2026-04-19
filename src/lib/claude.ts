import Anthropic from '@anthropic-ai/sdk'

// Model per PROJECT.md — cheapest/fastest, used only for AI-decision tasks
const MODEL = 'claude-haiku-4-5-20251001'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── Types ────────────────────────────────────────────────────────────────────

export type LeadTier = 'hot' | 'warm' | 'cold'

export interface LeadClassification {
  tier: LeadTier
  reasoning: string
}

// ─── Lead classification ──────────────────────────────────────────────────────
// Called by Edge Function when a new lead is inserted into Supabase

export async function classifyLead(lead: {
  name: string
  destination: string
  budget: string
  message: string
}): Promise<LeadClassification> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `Classify this travel lead for ACE Voyages (Nigerian travel agency).
Lead details: ${JSON.stringify(lead)}

Return JSON only — no markdown, no explanation:
{"tier":"hot|warm|cold","reasoning":"one sentence max"}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '{}'
  return JSON.parse(text) as LeadClassification
}

// ─── WhatsApp follow-up copy ───────────────────────────────────────────────────
// Generates a personalised WhatsApp message for a lead

export async function generateFollowUpMessage(lead: {
  name: string
  destination: string
  tier: LeadTier
}): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `Write a warm, friendly WhatsApp follow-up for ACE Voyages (Nigerian travel agency).
Customer: ${lead.name}
Interested in: ${lead.destination}
Lead quality: ${lead.tier}

Keep under 200 words. Friendly tone, Nigerian context, clear call to action. No markdown.`,
      },
    ],
  })

  return response.content[0].type === 'text' ? response.content[0].text.trim() : ''
}

// ─── Visa document check ───────────────────────────────────────────────────────
// Reviews a customer-submitted document checklist against destination requirements

export async function checkVisaDocuments(params: {
  destination: string
  documentsProvided: string[]
}): Promise<{ complete: boolean; missing: string[]; notes: string }> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 400,
    messages: [
      {
        role: 'user',
        content: `Check if a Nigerian passport holder has the required visa documents.
Destination: ${params.destination}
Documents provided: ${params.documentsProvided.join(', ')}

Return JSON only:
{"complete":true|false,"missing":["list","of","missing","docs"],"notes":"brief advice"}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '{}'
  return JSON.parse(text)
}
