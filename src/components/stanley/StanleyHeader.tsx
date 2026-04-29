import stanleyLogo from "@/assets/stanley-brand-logo.png";

export function StanleyHeader() {
  return (
    <header className="w-full">
      <div className="bg-black text-white text-[11px] sm:text-xs font-medium">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-6 text-center">
          <span>FRETE GRÁTIS acima de R$ 299</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Em até 12x sem juros</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">Garantia Vitalícia 🛡️</span>
        </div>
      </div>

      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-center">
          <img src={stanleyLogo} alt="Stanley" className="h-12 w-auto object-contain" />
        </div>
      </div>
    </header>
  );
}
