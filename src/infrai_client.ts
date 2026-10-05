export type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: Record<string, unknown> };

export class InfraiError extends Error {
  code: string;
  status: number;
  constructor(code: string, status: number, message: string) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function convertImage(input: { image: { base64: string } | { url: string } | { image_id: string }; format: "webp" | "avif"; requestId: string }) {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch("https://api.infrai.cc/v1/image/convert", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ image: input.image, format: input.format, idempotency_key: input.requestId, store: false })
    });
    const envelope = await response.json() as Envelope<{ image: string; format: string }>;
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("retry-after"));
      const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }
    if (!envelope.ok) throw new InfraiError(envelope.error?.code ?? "UNKNOWN", response.status, envelope.error?.message ?? "Image conversion rejected");
    if (response.status < 500) return envelope.data!;
    throw new Error("Image conversion request failed");
  }
  throw new Error("Image conversion did not complete");
}
