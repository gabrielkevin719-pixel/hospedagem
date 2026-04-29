import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ error: 'transactionId é obrigatório' });
    }

    const apiKey = process.env.PIX_API_KEY;
    const apiUrl = process.env.PIX_API_URL;

    if (!apiKey || !apiUrl) {
      return res.status(500).json({ error: 'PIX não configurado' });
    }

    // Endpoint para verificar status - usa o mesmo endpoint base com o transactionId
    const statusUrl = `${apiUrl.replace(/\/+$/, '')}/${transactionId}`;

    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'x-api-key': apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Se der erro, retorna PENDING para continuar polling
      console.error('PIX status check failed', response.status);
      return res.status(200).json({ status: 'PENDING' });
    }

    const json = await response.json();
    
    // Mapeia os status da API: PENDING, COMPLETED, etc.
    const status = json.status ?? 'PENDING';
    
    return res.status(200).json({ 
      status,
      amount: json.amount,
      result: json.result,
    });
  } catch (error: any) {
    console.error('PIX status error:', error);
    return res.status(500).json({ error: error.message || 'Erro interno' });
  }
}
