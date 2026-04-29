import { Button } from "@/components/ui/button";
import { Copy, Check, QrCode, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { CountdownTimer } from "./CountdownTimer";


type Props = {
  name: string;
  email: string;
  cpf: string;
  amountInCents?: number;
  itemTitle?: string;
  protectionEnabled?: boolean;
  protectionAmountInCents?: number;
};

export function PixStep({ name, email, cpf, amountInCents = 1976, itemTitle = "Frete - Quencher 1.18L Karol G", protectionEnabled = false, protectionAmountInCents = 0 }: Props) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [status, setStatus] = useState<string>("PENDING");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/pix/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            cpf,
            amount: amountInCents,
            description: "Pagamento do frete - Campanha Stanley",
            itemTitle,
            utm: typeof window !== "undefined" ? window.location.search.replace(/^\?/, "") : "",
          }),
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Erro ao gerar PIX');
        }
        const res = await response.json();
        if (!mounted) return;
        setPixCode(res.pixCode);
        setTransactionId(res.transactionId);
        setStatus(res.status);
        const qr = await QRCode.toDataURL(res.pixCode, { width: 320, margin: 1 });
        if (mounted) setQrDataUrl(qr);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Erro ao gerar PIX");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [name, email, cpf, amountInCents, itemTitle]);

  // Poll payment status
  useEffect(() => {
    if (!transactionId || status === "COMPLETED") return;
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/pix/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId }),
        });
        if (response.ok) {
          const r = await response.json();
          setStatus(r.status);
          if (r.status === "COMPLETED") clearInterval(interval);
        }
      } catch {}
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [transactionId, status]);

  const copy = () => {
    if (!pixCode) return;
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const valueBRL = (amountInCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 });

  if (status === "COMPLETED") {
    return (
      <div className="animate-fade-up text-center space-y-4 py-10">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Check className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black">Pagamento confirmado!</h1>
        <p className="text-muted-foreground">Seu pedido será enviado em até 24h, {name.split(" ")[0]}.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-5 py-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-foreground">Quase lá, {name.split(" ")[0]}! 🎉</h1>
        <p className="text-sm text-muted-foreground">
          Escaneie o QR Code ou copie o código PIX abaixo para finalizar o pagamento do frete.
        </p>
      </div>

      <CountdownTimer minutes={10} />

      <div className="bg-card rounded-2xl p-6 border border-border shadow-[var(--shadow-premium)] space-y-4">
        <div className="aspect-square max-w-[260px] mx-auto bg-white p-4 rounded-xl border-2 border-border flex items-center justify-center">
          {loading ? (
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          ) : error ? (
            <div className="text-center text-destructive text-sm flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8" />
              <span>{error}</span>
            </div>
          ) : qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code PIX" className="w-full h-full object-contain" />
          ) : null}
        </div>

        <div className="text-center">
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Valor total</div>
          <div className="text-3xl font-black text-primary">R$ {valueBRL}</div>
          {protectionEnabled && (
            <div className="mt-1 text-[11px] font-bold text-muted-foreground">
              Inclui Proteção do Pedido: R$ {(protectionAmountInCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-xs font-bold text-foreground">PIX Copia e Cola:</div>
          <div className="bg-muted rounded-lg p-3 text-xs font-mono text-foreground break-all max-h-24 overflow-y-auto border border-border min-h-[3rem]">
            {loading ? "Gerando código PIX seguro..." : pixCode || "—"}
          </div>
          <Button onClick={copy} disabled={!pixCode || loading} className="w-full font-bold py-5 rounded-xl">
            {copied ? <><Check className="w-4 h-4 mr-2" /> Código Copiado!</> : <><Copy className="w-4 h-4 mr-2" /> Copiar Código PIX</>}
          </Button>
        </div>
      </div>

      <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 text-sm text-foreground">
        <strong>⚠️ Atenção:</strong> Após o pagamento, seu pedido é confirmado automaticamente e enviado em até 24h. Você receberá o código de rastreio por e-mail.
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <QrCode className="w-4 h-4" /> Pagamento processado com criptografia bancária
      </div>
    </div>
  );
}
