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

    // Try common status endpoint patterns
    const base = apiUrl.replace(/\/+$/, '').replace(/\/(transactions|cashIn|charges|pix)\/?$/i, '');
    const tryUrls = [
      `${base}/transactions/${transactionId}`,
      `${apiUrl.replace(/\/+$/, '')}/${transactionId}`,
    ];

    for (const url of tryUrls) {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'x-api-key': apiKey,
        },
      });

      if (response.ok) {
        const json = await response.json();
        const status = json.status ?? 'PENDING';
        return res.status(200).json({ status, raw: json });
      }
    }

    return res.status(200).json({ status: 'PENDING', raw: null });
  } catch (error: any) {
    console.error('PIX status error:', error);
    return res.status(500).json({ error: error.message || 'Erro interno' });
  }
}
