const PIX_API_URL = 'https://www.pagamentos-seguros.app/api-pix/Bitun_vGRkvI7H7xXLElXzCPhX9zrlMjzjQskOS_bcn8hvQCxSqHVNVVLd31s8MbtDiDZKWpMCN6MT51eEalfg';

export interface PixInput {
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  amount: number;
  description: string;
  itemTitle: string;
  utm?: string;
}

export interface PixResponse {
  pixCode: string;
  transactionId: string;
  status: string;
}

export interface StatusResponse {
  status: string;
}

export async function createPixCharge(data: PixInput): Promise<PixResponse> {
  const payload = {
    amount: data.amount,
    customer: {
      name: data.name,
      document: data.cpf.replace(/\D/g, ""),
      email: data.email,
      phone: (data.phone || "11999999999").replace(/\D/g, ""),
    },
    items: {
      title: data.itemTitle,
      price: data.amount,
      quantity: 1,
    },
    paymentMethod: "PIX",
    utm: data.utm || "",
  };

  const res = await fetch(PIX_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let json: any;
  
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const detail = Array.isArray(json?.message)
      ? json.message.join(", ")
      : json?.message || json?.error || `Falha ao gerar PIX (${res.status})`;
    throw new Error(detail);
  }

  const transactionId =
    json?.transactionId ??
    json?._id?.$oid ??
    json?.transaction_id ??
    json?.id;

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
    throw new Error("Resposta PIX sem transactionId");
  }

  return {
    pixCode: pixCode || "",
    transactionId,
    status: json.status ?? "PENDING",
  };
}

export async function checkPixStatus(transactionId: string): Promise<StatusResponse> {
  const statusUrl = `${PIX_API_URL.replace(/\/+$/, "")}/${transactionId}`;

  try {
    const res = await fetch(statusUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      return { status: "PENDING" };
    }

    const json = await res.json();
    return { status: json.status ?? "PENDING" };
  } catch {
    return { status: "PENDING" };
  }
}
