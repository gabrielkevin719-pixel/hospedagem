import { createAPIFileRoute } from "@tanstack/react-start/api";
import { z } from "zod";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With, Accept, Origin, x-api-key",
  "Access-Control-Max-Age": "86400",
} as const;

const PixWebhookSchema = z
  .object({
    transaction_hash: z.string().trim().min(1).max(160).optional(),
    transactionId: z.string().trim().min(1).max(160).optional(),
    status: z.string().trim().min(1).max(40),
    quantidade: z.number().int().min(1).max(100000000).optional(),
    amount: z.number().int().min(1).max(100000000).optional(),
    método_de_pagamento: z.string().trim().min(1).max(40).optional(),
    metodo_de_pagamento: z.string().trim().min(1).max(40).optional(),
    paymentMethod: z.string().trim().min(1).max(40).optional(),
    pago_em: z.string().datetime().optional(),
    paidAt: z.string().datetime().optional(),
    shipping_method: z.string().trim().max(40).optional(),
    item_title: z.string().trim().max(200).optional(),
    items: z
      .object({ title: z.string().trim().max(200).optional() })
      .passthrough()
      .optional(),
  })
  .passthrough();

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...(init?.headers ?? {}),
    },
  });
}

export const APIRoute = createAPIFileRoute("/api/public/webhooks/pix")({
  OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
  POST: async ({ request }) => {
    try {
      const apiKey = process.env.PIX_API_KEY;
      const authHeader = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
      const headerApiKey = request.headers.get("x-api-key");

      if (!apiKey || (authHeader !== apiKey && headerApiKey !== apiKey)) {
        return jsonResponse(
          { success: false, error: "Webhook PIX não autorizado" },
          { status: 401 },
        );
      }

      const rawBody = await request.json();
      const parsed = PixWebhookSchema.safeParse(rawBody);

      if (!parsed.success) {
        return jsonResponse(
          { success: false, error: "Payload PIX inválido", details: parsed.error.flatten() },
          { status: 400 },
        );
      }

      const payload = parsed.data;
      const transactionHash = payload.transaction_hash ?? payload.transactionId;

      if (!transactionHash) {
        return jsonResponse(
          { success: false, error: "Transação PIX não informada" },
          { status: 400 },
        );
      }

      return jsonResponse({ success: true, transactionHash, status: payload.status });
    } catch (error) {
      console.error("PIX webhook error", error);
      return jsonResponse(
        { success: false, error: "Erro ao processar webhook PIX" },
        { status: 500 },
      );
    }
  },
});
