import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountdownTimer } from "./CountdownTimer";
import { Testimonials } from "./Testimonials";
import { ShieldCheck, Truck, Lock, Flame, Check, Snowflake, Package, Award, Plus, Minus, Loader2, AlertCircle, MapPin, ShieldAlert, X } from "lucide-react";
import { useState, useRef } from "react";
import imgReal from "@/assets/karolg/quencher-karolg-real.jpeg";
import imgKarolg2 from "@/assets/karolg/quencher-karolg-2.png";
import imgKarolg3 from "@/assets/karolg/quencher-karolg-3.png";
import imgHeroBack from "@/assets/karolg/karolg-hero-back.webp";
import imgCloseup from "@/assets/karolg/karolg-closeup.webp";
import imgDetail from "@/assets/karolg/karolg-detail.webp";
import correiosLogo from "@/assets/correios-logo.png";
import sedexLogo from "@/assets/sedex-logo.png";
import portoSeguroPopupLogo from "@/assets/porto-seguro-popup-logo.png";

// Ordem: copo inteiro frontal → copo inteiro angulado → close-ups (tampa, alça, logo) → lifestyle (mulher) por último
const gallery = [imgReal, imgHeroBack, imgKarolg3, imgDetail, imgCloseup, imgKarolg2];

type ShippingMethod = "pac" | "sedex";
type CheckoutData = { name: string; email: string; cpf: string; address: string; shippingMethod: ShippingMethod; shippingAmount: number; protectionAmount: number; protectionEnabled: boolean };

const SHIPPING_OPTIONS: Record<ShippingMethod, { label: string; sub: string; price: number; deadline: string; logo: string }> = {
  pac: { label: "PAC", sub: "Econômico · Rastreável", price: 19.76, deadline: "7 a 10 dias úteis", logo: correiosLogo },
  sedex: { label: "SEDEX", sub: "Expresso · Prioritário", price: 37.59, deadline: "2 a 4 dias úteis", logo: sedexLogo },
};

const ORDER_PROTECTION_PRICE = 12.28;

export function OfferStep({ onCheckout }: { onCheckout: (data: CheckoutData) => void }) {
  const [selected, setSelected] = useState(0);
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", cpf: "", cep: "", address: "", number: "" });
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const [cpfError, setCpfError] = useState("");
  const [shippingReady, setShippingReady] = useState(false);
  const [cepData, setCepData] = useState<{ logradouro: string; bairro: string; cidade: string; uf: string } | null>(null);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("pac");
  const [protectionModalOpen, setProtectionModalOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState<Omit<CheckoutData, "protectionAmount" | "protectionEnabled"> | null>(null);
  const numberRef = useRef<HTMLInputElement>(null);

  const SHIPPING = SHIPPING_OPTIONS[shippingMethod].price;

  const formatCep = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  };

  const formatCpf = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const isValidCpf = (raw: string) => {
    const cpf = raw.replace(/\D/g, "");
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
    let d1 = (sum * 10) % 11;
    if (d1 === 10) d1 = 0;
    if (d1 !== parseInt(cpf[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
    let d2 = (sum * 10) % 11;
    if (d2 === 10) d2 = 0;
    return d2 === parseInt(cpf[10]);
  };

  const lookupCep = async (rawCep: string) => {
    const cep = rawCep.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setCepLoading(true);
    setCepError("");
    setShippingReady(false);
    setCepData(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepError("CEP não encontrado. Verifique e tente novamente.");
        setForm((f) => ({ ...f, address: "" }));
      } else {
        const addr = `${data.logradouro || ""}, ${data.bairro || ""} - ${data.localidade || ""}/${data.uf || ""}`;
        setForm((f) => ({ ...f, address: addr }));
        setCepData({
          logradouro: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          uf: data.uf || "",
        });
        setShippingReady(true);
        setTimeout(() => numberRef.current?.focus(), 50);
      }
    } catch {
      setCepError("Erro ao consultar o CEP. Tente novamente.");
    } finally {
      setCepLoading(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.cpf || !form.address) return;
    if (!isValidCpf(form.cpf)) {
      setCpfError("CPF inválido. Verifique os dígitos.");
      return;
    }
    setCpfError("");
    const fullAddress = form.number ? `${form.address}, nº ${form.number}` : form.address;
    setPendingCheckout({
      name: form.name,
      email: form.email,
      cpf: form.cpf,
      address: fullAddress,
      shippingMethod,
      shippingAmount: SHIPPING_OPTIONS[shippingMethod].price,
    });
    setProtectionModalOpen(true);
  };

  const finishCheckout = (protectionEnabled: boolean) => {
    if (!pendingCheckout) return;
    onCheckout({
      ...pendingCheckout,
      protectionEnabled,
      protectionAmount: protectionEnabled ? ORDER_PROTECTION_PRICE : 0,
    });
  };

  return (
    <div className="animate-fade-up bg-background overflow-x-hidden">
      {protectionModalOpen && pendingCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 px-4 py-6 backdrop-blur-sm">
          <div className="relative w-full max-w-sm animate-fade-up rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-premium)]">
            <button
              type="button"
              onClick={() => finishCheckout(false)}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Continuar sem proteção"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="pr-6 text-center">
              <img src={portoSeguroPopupLogo} alt="Porto Seguro" className="mx-auto mb-4 h-12 w-auto object-contain" />
              <h2 className="text-base font-black leading-tight text-foreground">Seguro anti-roubo</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Cobre roubo, extravio ou quebra durante o transporte.
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-center text-sm font-black leading-snug text-primary">
              92% dos compradores ativam a proteção para garantir o reembolso
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-background p-4">
              <div>
                <div className="text-sm font-bold text-foreground">Proteção do pedido</div>
                <div className="text-xs text-muted-foreground">Opcional</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-primary">R$ {ORDER_PROTECTION_PRICE.toFixed(2).replace(".", ",")}</div>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <Button type="button" onClick={() => finishCheckout(true)} size="lg" className="w-full rounded-xl py-5 text-sm font-black">
                Adicionar proteção
              </Button>
              <button
                type="button"
                onClick={() => finishCheckout(false)}
                className="w-full rounded-xl px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Continuar sem proteção
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 w-full">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted-foreground mb-4">
          <a href="#" className="hover:text-foreground">Início</a> <span className="mx-1">›</span>
          <a href="#" className="hover:text-foreground">All Products</a> <span className="mx-1">›</span>
          <span className="text-foreground font-semibold">Copo Quencher Karol G | 1.18L</span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_460px] gap-8 lg:gap-12 min-w-0">
          {/* LEFT: Gallery */}
          <div className="grid grid-cols-[64px_1fr] sm:grid-cols-[80px_1fr] gap-3 min-w-0">
            <div className="flex flex-col gap-2">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`aspect-square rounded-lg overflow-hidden bg-white border-2 transition ${
                    selected === i ? "border-black" : "border-transparent hover:border-neutral-300"
                  }`}
                >
                  <img src={src} alt={`Vista ${i + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
            <div className="relative bg-white rounded-xl overflow-hidden aspect-square shadow-[var(--shadow-soft)]">
              <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/90 text-white text-[10px] font-black uppercase tracking-wider">
                ✦ Edição Limitada
              </span>
              <img src={gallery[selected]} alt="Copo Quencher Karol G 1.18L" className="w-full h-full object-contain p-6" />
            </div>
          </div>

          {/* RIGHT: Product info + checkout */}
          <div className="space-y-5 min-w-0">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight leading-[1.05] uppercase">
                Copo Quencher Karol G | 1.18L
              </h1>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl text-muted-foreground line-through">R$ 459,00</span>
                <span className="text-3xl font-black text-primary">R$ 0,00</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Tamanho: 1.18L &nbsp; · &nbsp; SKU: 09091</div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-black">
              <Flame className="w-3.5 h-3.5" /> RESTAM APENAS 14 UNIDADES PARA SUA REGIÃO
            </div>

            <CountdownTimer minutes={10} />

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold">Quantidade:</span>
              <div className="inline-flex items-center border border-border rounded-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-muted"><Minus className="w-3.5 h-3.5" /></button>
                <span className="px-4 font-bold tabular-nums">{qty}</span>
                <button onClick={() => setQty(Math.min(1, qty + 1))} className="px-3 py-2 hover:bg-muted opacity-50 cursor-not-allowed"><Plus className="w-3.5 h-3.5" /></button>
              </div>
              <span className="text-xs text-muted-foreground">Limite: 1 por CPF</span>
            </div>

            {/* Checkout form */}
            <form onSubmit={submit} className="bg-card rounded-2xl p-5 border-2 border-primary/20 shadow-[var(--shadow-premium)] space-y-4">
              <div>
                <h2 className="text-lg font-black text-foreground">Garanta o seu agora!</h2>
                
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wide">Nome completo</Label>
                  <Input id="name" required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wide">E-mail</Label>
                  <Input id="email" type="email" required maxLength={150} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="cpf" className="text-xs font-bold uppercase tracking-wide">CPF</Label>
                  <Input
                    id="cpf"
                    required
                    inputMode="numeric"
                    maxLength={14}
                    placeholder="000.000.000-00"
                    value={form.cpf}
                    onChange={(e) => { setForm({ ...form, cpf: formatCpf(e.target.value) }); if (cpfError) setCpfError(""); }}
                    onBlur={() => { if (form.cpf && !isValidCpf(form.cpf)) setCpfError("CPF inválido. Verifique os dígitos."); }}
                    className={`mt-1 ${cpfError ? "border-destructive" : ""}`}
                  />
                  {cpfError && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {cpfError}</p>}
                </div>
                <div>
                  <Label htmlFor="cep" className="text-xs font-bold uppercase tracking-wide">CEP</Label>
                  <Input
                    id="cep"
                    required
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="00000-000"
                    value={form.cep}
                    onChange={(e) => {
                      const v = formatCep(e.target.value);
                      setForm({ ...form, cep: v });
                      setCepError("");
                      if (v.replace(/\D/g, "").length === 8) lookupCep(v);
                    }}
                    onBlur={(e) => lookupCep(e.target.value)}
                    className="mt-1"
                  />
                  {cepError && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-destructive font-semibold">
                      <AlertCircle className="w-3 h-3" /> {cepError}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wide">Endereço completo</Label>
                  <div className="relative">
                    <Input
                      id="address"
                      required
                      maxLength={200}
                      placeholder="Será preenchido pelo CEP"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="mt-1 pr-9"
                      disabled={cepLoading}
                    />
                    {cepLoading && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {cepLoading && (
                    <div className="mt-2 space-y-2">
                      <div className="h-3 rounded bg-muted animate-pulse w-1/2" />
                      <div className="h-3 rounded bg-muted animate-pulse w-3/4" />
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="number" className="text-xs font-bold uppercase tracking-wide">Número / Complemento</Label>
                  <Input
                    id="number"
                    ref={numberRef}
                    maxLength={50}
                    placeholder="Ex: 123, Apto 45"
                    value={form.number}
                    onChange={(e) => setForm({ ...form, number: e.target.value })}
                    className="mt-1"
                  />
                </div>

                {shippingReady && cepData && (
                  <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden animate-fade-up">
                    {/* Header com logo Correios */}
                    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border-b border-primary/15">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={correiosLogo}
                          alt="Correios"
                          width={64}
                          height={64}
                          loading="lazy"
                          className="h-8 w-auto object-contain"
                        />
                        <div className="leading-tight">
                          <div className="text-[11px] font-black text-foreground uppercase tracking-wide">Correios · Escolha o envio</div>
                          <div className="text-[10px] text-muted-foreground font-semibold">Rastreável · Seguro incluso</div>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 text-[9px] font-black uppercase tracking-wider">
                        <Check className="w-2.5 h-2.5" /> Disponível
                      </span>
                    </div>

                    {/* Endereço entregue */}
                    <div className="px-4 py-3 space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-[12px] leading-snug min-w-0">
                          <div className="font-bold text-foreground truncate">
                            {cepData.logradouro || "Endereço confirmado"}
                          </div>
                          <div className="text-muted-foreground">
                            {cepData.bairro && <>{cepData.bairro} · </>}
                            {cepData.cidade}/{cepData.uf} · CEP {form.cep}
                          </div>
                        </div>
                      </div>

                      {/* Seletor de modalidade */}
                      <div className="space-y-2 pt-1">
                        {(Object.keys(SHIPPING_OPTIONS) as ShippingMethod[]).map((key) => {
                          const opt = SHIPPING_OPTIONS[key];
                          const isActive = shippingMethod === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setShippingMethod(key)}
                              className={`w-full text-left flex items-center gap-3 rounded-lg border-2 px-3 py-2.5 transition-all ${
                                isActive
                                  ? "border-primary bg-primary/10 shadow-sm"
                                  : "border-border bg-card hover:border-primary/40"
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                  isActive ? "border-primary" : "border-muted-foreground/40"
                                }`}
                              >
                                {isActive && <span className="w-2 h-2 rounded-full bg-primary" />}
                              </span>
                              <div className="flex items-center justify-center bg-white rounded px-1.5 py-1 border border-border/60 flex-shrink-0">
                                <img
                                  src={opt.logo}
                                  alt={`Logo ${opt.label}`}
                                  width={64}
                                  height={32}
                                  loading="lazy"
                                  className="h-5 w-auto object-contain"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 text-[12px] font-black text-foreground">
                                  {opt.label}
                                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">· {opt.sub}</span>
                                </div>
                                <div className="text-[10px] text-muted-foreground font-semibold mt-0.5 flex items-center gap-1">
                                  <Truck className="w-3 h-3 text-primary" /> Prazo: {opt.deadline}
                                </div>
                              </div>
                              <span className={`text-[13px] font-black ${isActive ? "text-primary" : "text-foreground"}`}>
                                R$ {opt.price.toFixed(2).replace(".", ",")}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/60">
                        <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-primary" /> Total do frete
                        </span>
                        <span className="text-base font-black text-primary">R$ {SHIPPING.toFixed(2).replace(".", ",")}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button type="submit" size="lg" className="w-full text-xs sm:text-sm font-black py-6 sm:py-7 rounded-xl shadow-[var(--shadow-premium)] animate-pulse-glow uppercase tracking-wide whitespace-normal break-words leading-tight h-auto">
                Gerar PIX para pagamento do frete →
              </Button>

              <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground font-semibold">
                <Lock className="w-3 h-3" /> Pagamento processado com criptografia bancária
              </div>
            </form>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-card border border-border text-center">
                <Snowflake className="w-5 h-5 text-primary" />
                <div className="text-[11px] font-bold">11 horas</div>
                <div className="text-[10px] text-muted-foreground">Gelado</div>
              </div>
              <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-card border border-border text-center">
                <Package className="w-5 h-5 text-primary" />
                <div className="text-[11px] font-bold">2 dias</div>
                <div className="text-[10px] text-muted-foreground">Envio</div>
              </div>
              <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-card border border-border text-center">
                <Award className="w-5 h-5 text-primary" />
                <div className="text-[11px] font-bold">Vitalícia</div>
                <div className="text-[10px] text-muted-foreground">Garantia</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border pt-4">
              <div className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground text-center font-semibold">
                <Lock className="w-4 h-4 text-primary" /> Site Seguro
              </div>
              <div className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground text-center font-semibold">
                <Truck className="w-4 h-4 text-primary" /> Entrega 3-7 dias
              </div>
              <div className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground text-center font-semibold">
                <ShieldCheck className="w-4 h-4 text-primary" /> Garantia Oficial
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-12 grid lg:grid-cols-2 gap-8 border-t border-border pt-10">
          <div>
            <h3 className="text-xl font-black mb-3 uppercase tracking-tight">Sobre o Produto</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O <strong className="text-foreground">Copo Quencher Karol G 1.18L</strong> é uma edição limitada que celebra a parceria entre Stanley e a artista. Em aço inox 18/8 com tecnologia de isolamento a vácuo, mantém bebidas geladas por até 11 horas e quentes por até 7 horas. Tampa Quencher multifuncional com canudo reutilizável e alça ergonômica para levar a qualquer lugar.
            </p>
            <ul className="mt-4 space-y-2">
              {[
                "Capacidade 1.18L (40oz)",
                "Aço inox 18/8 livre de BPA",
                "Tampa anti-vazamento com canudo",
                "Encaixa em porta-copos de carro",
                "Garantia vitalícia oficial Stanley",
              ].map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" /> {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl overflow-hidden bg-white">
            <img src={imgReal} alt="Karol G com o Copo Quencher" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-12 border-t border-border pt-10">
          <Testimonials />
        </div>
      </div>
    </div>
  );
}
