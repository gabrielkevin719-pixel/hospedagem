import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, cpf, phone, amount, description, itemTitle, utm } = req.body;

    // Validation
    if (!name || name.length < 2) {
      return res.status(400).json({ error: 'Nome inválido' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    if (!cpf || cpf.replace(/\D/g, '').length < 11) {
      return res.status(400).json({ error: 'CPF inválido' });
    }
    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Valor inválido' });
    }

    const apiKey = process.env.PIX_API_KEY;
    const apiUrl = process.env.PIX_API_URL;

    if (!apiKey) {
      return res.status(500).json({ error: 'PIX_API_KEY não configurada' });
    }
    if (!apiUrl) {
      return res.status(500).json({ error: 'PIX_API_URL não configurada' });
    }

    const payload = {
      amount,
      description: description || 'Copo Quencher Karol G',
      customer: {
        name,
        document: cpf.replace(/\D/g, ''),
        email,
        phone: (phone || '11999999999').replace(/\D/g, ''),
      },
      item: {
        title: itemTitle || 'Copo Quencher Karol G 1.18L',
        price: amount,
        quantity: 1,
      },
      paymentMethod: 'PIX',
      utm: utm || '',
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }

    if (!response.ok) {
      console.error('PIX API error', response.status, json);
      const detail = Array.isArray(json?.message)
        ? json.message.join(', ')
        : json?.message || json?.error || `Falha ao gerar PIX (${response.status})`;
      return res.status(response.status).json({ error: detail });
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
      console.error('PIX API missing fields', json);
      return res.status(500).json({ error: 'Resposta PIX sem código ou transação' });
    }

    return res.status(200).json({
      pixCode,
      transactionId,
      status: json.status ?? 'PENDING',
    });
  } catch (error: any) {
    console.error('PIX create error:', error);
    return res.status(500).json({ error: error.message || 'Erro interno' });
  }
}
