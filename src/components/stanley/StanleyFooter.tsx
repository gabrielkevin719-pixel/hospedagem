import { Lock, Truck, ShieldCheck, CreditCard } from "lucide-react";
import stanleyLogo from "@/assets/stanley-brand-logo.png";

export function StanleyFooter() {
  const cols = [
    {
      title: "Atendimento",
      links: ["Central de Ajuda", "Fale Conosco", "Trocas e Devoluções", "Rastrear Pedido", "Garantia Vitalícia"],
    },
    {
      title: "Institucional",
      links: ["Sobre a Stanley", "Sustentabilidade", "Nossa História", "Convocados", "Imprensa"],
    },
    {
      title: "Políticas",
      links: ["Política de Privacidade", "Termos de Uso", "Política de Cookies", "Trocas e Devoluções", "Segurança"],
    },
  ];

  return (
    <footer className="bg-black text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <img src={stanleyLogo} alt="Stanley" className="h-12 w-auto object-contain brightness-0 invert" />
            <p className="text-xs text-white/70 leading-relaxed">
              Construído para a vida ao ar livre desde 1913. Garantia vitalícia em todos os produtos.
            </p>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-black uppercase tracking-wider mb-4">{c.title}</h4>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l}><a href="#" className="text-xs text-white/70 hover:text-white">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="py-8 grid md:grid-cols-2 gap-6 items-center border-b border-white/10">
          <div className="flex flex-wrap items-center gap-4 text-xs text-white/70">
            <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> Site 100% Seguro</div>
            <div className="flex items-center gap-2"><Truck className="w-4 h-4" /> Entrega Nacional</div>
            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Garantia Vitalícia</div>
            <div className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Pix / Cartão</div>
          </div>
          <div className="flex md:justify-end gap-2">
            {["VISA","MASTER","ELO","AMEX","PIX"].map((b) => (
              <span key={b} className="text-[10px] font-black bg-white text-black px-2 py-1 rounded">{b}</span>
            ))}
          </div>
        </div>

        <div className="pt-6 text-[11px] text-white/50 text-center space-y-1">
          <div>STANLEY BRASIL — CNPJ 30.055.933/0006-51 — Av. Paulista, 1000 — São Paulo/SP</div>
          <div>Atendimento: 0800 021 32 78</div>
          <div>© 2026 Stanley PMI. Todos os direitos reservados.</div>
        </div>
      </div>
    </footer>
  );
}
