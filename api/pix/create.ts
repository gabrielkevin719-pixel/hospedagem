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

    const apiUrl = process.env.PIX_API_URL || 'https://www.pagamentos-seguros.app/api-pix/Bitun_vGRkvI7H7xXLElXzCPhX9zrlMjzjQskOS_bcn8hvQCxSqHVNVVLd31s8MbtDiDZKWpMCN6MT51eEalfg';

    const payload = {
      amount,
      customer: {
        name,
        document: cpf.replace(/\D/g, ''),
        email,
        phone: (phone || '11999999999').replace(/\D/g, ''),
      },
      items: {
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

    // A API retorna o transactionId diretamente no objeto
    const transactionId =
      json?.transactionId ??
      json?._id?.$oid ??
      json?.transaction_id ??
      json?.id;

    // O pixCode pode vir em diferentes campos dependendo da API
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
      console.error('PIX API missing transactionId', json);
      return res.status(500).json({ error: 'Resposta PIX sem transactionId' });
    }

    return res.status(200).json({
      pixCode: pixCode || '',
      transactionId,
      status: json.status ?? 'PENDING',
      amount: json.amount,
    });
  } catch (error: any) {
    console.error('PIX create error:', error);
    return res.status(500).json({ error: error.message || 'Erro interno' });
  }
}
