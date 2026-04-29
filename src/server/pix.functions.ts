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

export const createPixCharge = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PixInputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.PIX_API_KEY;
    const apiUrl = process.env.PIX_API_URL;

    if (!apiKey) throw new Error("PIX_API_KEY não configurada");
    if (!apiUrl) throw new Error("PIX_API_URL não configurada");

    const payload = {
      amount: data.amount,
      description: data.description,
      customer: {
        name: data.name,
        document: data.cpf.replace(/\D/g, ""),
        email: data.email,
        phone: data.phone.replace(/\D/g, ""),
      },
      item: {
        title: data.itemTitle,
        price: data.amount,
        quantity: 1,
      },
      paymentMethod: "PIX",
      utm: data.utm,
    };

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    const json: any = parseJsonResponse(text);

    if (!res.ok) {
      console.error("PIX API error", res.status, json);
      const detail = Array.isArray(json?.message)
        ? json.message.join(", ")
        : json?.message || json?.error || `Falha ao gerar PIX (${res.status})`;
      throw new Error(detail);
    }

    const pixCode =
      json?.pixCode ??
      json?.pix_code ??
      json?.qrCode ??
      json?.qr_code ??
      json?.qrcode ??
      json?.emv ??
      json?.copia_cola;
    const transactionId =
      json?.transactionId ??
      json?.transaction_id ??
      json?.transaction_hash ??
      json?.id ??
      json?.hash;

    if (!pixCode || !transactionId) {
      console.error("PIX API error", res.status, json);
      const detail = Array.isArray(json?.message)
        ? json.message.join(", ")
        : json?.message || json?.error || "Resposta PIX sem código ou transação";
      throw new Error(detail);
    }

    return {
      pixCode: pixCode as string,
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
    const apiKey = process.env.PIX_API_KEY;
    const apiUrl = process.env.PIX_API_URL;
    if (!apiKey || !apiUrl) throw new Error("PIX não configurado");

    // Try common status endpoint patterns
    const base = apiUrl.replace(/\/+$/, "").replace(/\/(transactions|cashIn|charges|pix)\/?$/i, "");
    const tryUrls = [
      `${base}/transactions/${data.transactionId}`,
      `${apiUrl.replace(/\/+$/, "")}/${data.transactionId}`,
    ];

    for (const url of tryUrls) {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "x-api-key": apiKey,
        },
      });
      if (res.ok) {
        const json = await res.json();
        const status = (json.status as string) ?? "PENDING";
        return { status, raw: json };
      }
    }
    return { status: "PENDING" as const, raw: null };
  });
