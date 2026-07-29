import crypto from 'crypto'

// Helpers for the email-to-pack ingestion route.

/**
 * Verifies a Svix-signed webhook (the scheme Resend uses for inbound email).
 * Implemented against node:crypto rather than pulling in the `svix` package:
 * one less dependency, and svix currently ships a vulnerable uuid transitive.
 *
 * Returns true only when a signature matches AND the timestamp is fresh.
 */
export function verifySvixSignature(opts: {
  body: string
  id: string | null
  timestamp: string | null
  signature: string | null
  secret: string
  toleranceSeconds?: number
}): boolean {
  const { body, id, timestamp, signature, secret } = opts
  if (!id || !timestamp || !signature || !secret) return false

  // Replay protection.
  const tolerance = opts.toleranceSeconds ?? 300
  const ts = Number(timestamp)
  if (!Number.isFinite(ts)) return false
  if (Math.abs(Date.now() / 1000 - ts) > tolerance) return false

  // Secrets are shipped as `whsec_<base64>`; the raw key is the base64 part.
  const rawSecret = secret.startsWith('whsec_') ? secret.slice(6) : secret
  let keyBytes: Buffer
  try {
    keyBytes = Buffer.from(rawSecret, 'base64')
  } catch {
    return false
  }

  const expected = crypto
    .createHmac('sha256', keyBytes)
    .update(`${id}.${timestamp}.${body}`)
    .digest('base64')

  // Header holds a space-separated list like "v1,<sig> v1,<sig>".
  for (const part of signature.split(' ')) {
    const [version, value] = part.split(',')
    if (version !== 'v1' || !value) continue
    const a = Buffer.from(value)
    const b = Buffer.from(expected)
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true
  }
  return false
}

/**
 * Pulls the per-user ingest token out of the recipient address.
 * Accepts `flash+TOKEN@domain` (plus addressing) and `TOKEN@domain`.
 */
export function extractInboundToken(to: unknown): string | null {
  const candidates: string[] = []
  if (typeof to === 'string') candidates.push(to)
  else if (Array.isArray(to)) for (const t of to) if (typeof t === 'string') candidates.push(t)

  for (const raw of candidates) {
    // "Name <addr@x>" → "addr@x"
    const angle = raw.match(/<([^>]+)>/)
    const addr = (angle ? angle[1] : raw).trim().toLowerCase()
    const local = addr.split('@')[0]
    if (!local) continue
    const token = local.includes('+') ? local.split('+').slice(1).join('+') : local
    if (token && /^[a-z0-9-]{8,}$/.test(token)) return token
  }
  return null
}

/**
 * Strips the noise humans leave in emails: quoted replies, forwarded headers
 * and signature blocks. Meeting notes typed on a phone are usually at the top,
 * so we cut at the first reply/signature marker we hit.
 */
export function cleanEmailBody(raw: string): string {
  if (!raw) return ''
  let text = raw.replace(/\r\n/g, '\n')

  const cutMarkers: RegExp[] = [
    /^-{2,}\s*$/m,                                  // "--" signature delimiter
    /^On .+ wrote:\s*$/m,                           // Gmail/Apple reply header
    /^Le .+ a écrit\s*:\s*$/m,                      // French reply header
    /^_{5,}\s*$/m,                                  // Outlook divider
    /^-{3,}\s*Forwarded message\s*-{3,}\s*$/im,
    /^From:\s.+$/m,                                 // Outlook quoted header block
    /^Sent from my \w+/m,
    /^Envoyé de mon \w+/m,
  ]

  let cut = text.length
  for (const marker of cutMarkers) {
    const m = text.match(marker)
    if (m && typeof m.index === 'number' && m.index < cut) cut = m.index
  }
  text = text.slice(0, cut)

  // Drop any remaining quoted lines.
  text = text
    .split('\n')
    .filter(line => !/^\s*>/.test(line))
    .join('\n')

  return text.trim()
}
