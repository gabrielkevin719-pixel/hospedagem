import { Button } from "@/components/ui/button";
import { ShieldCheck, Truck, Award } from "lucide-react";

export function IntroStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="animate-fade-up text-center space-y-6 py-10 max-w-2xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider">
        <Award className="w-3.5 h-3.5" /> Campanha Oficial 2026
      </div>
      <h1 className="text-3xl sm:text-5xl font-black text-foreground leading-[1.05] tracking-tight">
        PESQUISA EXCLUSIVA<br />STANLEY BRASIL
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
        Queremos te ouvir! Responda 5 perguntas rápidas e você pode ser selecionado para receber uma das últimas unidades do <strong className="text-foreground">Quencher 1.18L Edição Karol G</strong> pagando apenas o frete.
      </p>
      <Button
        size="lg"
        onClick={onStart}
        className="text-base font-black px-12 py-7 rounded-xl shadow-[var(--shadow-premium)] animate-pulse-glow uppercase tracking-wide"
      >
        Começar Pesquisa →
      </Button>
      <div className="grid grid-cols-3 gap-4 pt-8 max-w-md mx-auto border-t border-border pt-6">
        <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground font-semibold">
          <ShieldCheck className="w-5 h-5 text-primary" /> 100% Seguro
        </div>
        <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground font-semibold">
          <Truck className="w-5 h-5 text-primary" /> Entrega Rápida
        </div>
        <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground font-semibold">
          <Award className="w-5 h-5 text-primary" /> Garantia Oficial
        </div>
      </div>
    </div>
  );
}
