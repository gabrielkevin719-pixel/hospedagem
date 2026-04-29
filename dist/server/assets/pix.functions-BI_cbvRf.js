import { _ as TSS_SERVER_FUNCTION, $ as createServerFn } from "./worker-entry-PKSq54oJ.js";
import { o as objectType, s as stringType, n as numberType } from "./types-BoWyrJuk.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const PixInputSchema = objectType({
  name: stringType().trim().min(2).max(120),
  email: stringType().trim().email().max(200),
  cpf: stringType().trim().min(11).max(20),
  phone: stringType().trim().min(8).max(20).optional().default("11999999999"),
  amount: numberType().int().min(100).max(1e6),
  description: stringType().trim().min(1).max(200),
  itemTitle: stringType().trim().min(1).max(200),
  utm: stringType().max(500).optional().default("")
});
function parseJsonResponse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {
      raw: text
    };
  }
}
const createPixCharge_createServerFn_handler = createServerRpc({
  id: "27291c6ff795d0330b67f7a4e28e03e39b2be612f7e2793a1c7bf80f592eed54",
  name: "createPixCharge",
  filename: "src/server/pix.functions.ts"
}, (opts) => createPixCharge.__executeServer(opts));
const createPixCharge = createServerFn({
  method: "POST"
}).inputValidator((input) => PixInputSchema.parse(input)).handler(createPixCharge_createServerFn_handler, async ({
  data
}) => {
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
      phone: data.phone.replace(/\D/g, "")
    },
    item: {
      title: data.itemTitle,
      price: data.amount,
      quantity: 1
    },
    paymentMethod: "PIX",
    utm: data.utm
  };
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
      "x-api-key": apiKey
    },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  const json = parseJsonResponse(text);
  if (!res.ok) {
    console.error("PIX API error", res.status, json);
    const detail = Array.isArray(json?.message) ? json.message.join(", ") : json?.message || json?.error || `Falha ao gerar PIX (${res.status})`;
    throw new Error(detail);
  }
  const pixCode = json?.pixCode ?? json?.pix_code ?? json?.qrCode ?? json?.qr_code ?? json?.qrcode ?? json?.emv ?? json?.copia_cola;
  const transactionId = json?.transactionId ?? json?.transaction_id ?? json?.transaction_hash ?? json?.id ?? json?.hash;
  if (!pixCode || !transactionId) {
    console.error("PIX API error", res.status, json);
    const detail = Array.isArray(json?.message) ? json.message.join(", ") : json?.message || json?.error || "Resposta PIX sem código ou transação";
    throw new Error(detail);
  }
  return {
    pixCode,
    transactionId,
    status: json.status ?? "PENDING"
  };
});
const StatusInputSchema = objectType({
  transactionId: stringType().min(1).max(100)
});
const checkPixStatus_createServerFn_handler = createServerRpc({
  id: "df494cbd0a988d60c4cf5f593c6fa5254d845820883ba8cc9a62b59492a7fb26",
  name: "checkPixStatus",
  filename: "src/server/pix.functions.ts"
}, (opts) => checkPixStatus.__executeServer(opts));
const checkPixStatus = createServerFn({
  method: "POST"
}).inputValidator((input) => StatusInputSchema.parse(input)).handler(checkPixStatus_createServerFn_handler, async ({
  data
}) => {
  const apiKey = process.env.PIX_API_KEY;
  const apiUrl = process.env.PIX_API_URL;
  if (!apiKey || !apiUrl) throw new Error("PIX não configurado");
  const base = apiUrl.replace(/\/+$/, "").replace(/\/(transactions|cashIn|charges|pix)\/?$/i, "");
  const tryUrls = [`${base}/transactions/${data.transactionId}`, `${apiUrl.replace(/\/+$/, "")}/${data.transactionId}`];
  for (const url of tryUrls) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "x-api-key": apiKey
      }
    });
    if (res.ok) {
      const json = await res.json();
      const status = json.status ?? "PENDING";
      return {
        status,
        raw: json
      };
    }
  }
  return {
    status: "PENDING",
    raw: null
  };
});
export {
  checkPixStatus_createServerFn_handler,
  createPixCharge_createServerFn_handler
};
