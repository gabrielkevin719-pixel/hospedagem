import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PixInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  cpf: z.string().trim().min(11).max(20),
  phone: z.string().trim().min(8).max(20).optional().default("11999999999"),
  amount: z.number().int().min(100).max(1000000),
  description: z.string().trim().min(1).max(200),
  itemTitle: z.string().trim().min(1).max(200),
  utm: z.string().max(500).optional().default(""),
});

export type PixInput = z.infer<typeof PixInputSchema>;

function parseJsonResponse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

const PIX_API_URL = process.env.PIX_API_URL || 'https://www.pagamentos-seguros.app/api-pix/Bitun_vGRkvI7H7xXLElXzCPhX9zrlMjzjQskOS_bcn8hvQCxSqHVNVVLd31s8MbtDiDZKWpMCN6MT51eEalfg';

export const createPixCharge = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PixInputSchema.parse(input))
  .handler(async ({ data }) => {
    const payload = {
      amount: data.amount,
      customer: {
        name: data.name,
        document: data.cpf.replace(/\D/g, ""),
        email: data.email,
        phone: data.phone.replace(/\D/g, ""),
      },
      items: {
        title: data.itemTitle,
        price: data.amount,
        quantity: 1,
      },
      paymentMethod: "PIX",
      utm: data.utm,
    };

    console.log("[PIX] Creating charge with payload:", JSON.stringify(payload));

    const res = await fetch(PIX_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log("[PIX] API response:", res.status, text);
    
    const json: any = parseJsonResponse(text);

    if (!res.ok) {
      console.error("PIX API error", res.status, json);
      const detail = Array.isArray(json?.message)
        ? json.message.join(", ")
        : json?.message || json?.error || `Falha ao gerar PIX (${res.status})`;
      throw new Error(detail);
    }

    // A API retorna transactionId diretamente ou em _id.$oid
    const transactionId =
      json?.transactionId ??
      json?._id?.$oid ??
      json?.transaction_id ??
      json?.id;

    // O pixCode pode vir em diferentes campos
    const pixCode =
      json?.pixCode ??
      json?.pix_code ??
      json?.qrCode ??
      json?.qr_code ??
      json?.qrcode ??
      json?.emv ??
      json?.copia_cola ??
      json?.copiaECola;

    if (!transactionId) {
      console.error("PIX API missing transactionId", json);
      throw new Error("Resposta PIX sem transactionId");
    }

    return {
      pixCode: (pixCode || '') as string,
      transactionId,
      status: (json.status as string) ?? "PENDING",
    };
  });

const StatusInputSchema = z.object({
  transactionId: z.string().min(1).max(100),
});

export const checkPixStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => StatusInputSchema.parse(input))
  .handler(async ({ data }) => {
    const statusUrl = `${PIX_API_URL.replace(/\/+$/, "")}/${data.transactionId}`;
    
    console.log("[PIX] Checking status:", statusUrl);

    const res = await fetch(statusUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      console.error("[PIX] Status check failed", res.status);
      return { status: "PENDING" as const };
    }

    const json = await res.json();
    console.log("[PIX] Status response:", json);
    
    return { 
      status: (json.status as string) ?? "PENDING",
    };
  });
