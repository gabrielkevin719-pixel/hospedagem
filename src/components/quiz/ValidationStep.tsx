import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

const messages = [
  "Verificando suas respostas...",
  "Analisando elegibilidade...",
  "Consultando estoque regional...",
  "Reservando sua unidade...",
];

export function ValidationStep({ onDone }: { onDone: () => void }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) return;
    const text = messages[msgIdx];
    let i = 0;
    setTyped("");
    const typer = setInterval(() => {
      i++;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(typer);
    }, 30);
    const next = setTimeout(() => {
      if (msgIdx < messages.length - 1) setMsgIdx(msgIdx + 1);
      else setSuccess(true);
    }, 1100);
    return () => {
      clearInterval(typer);
      clearTimeout(next);
    };
  }, [msgIdx, success]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => onDone(), 1200);
      return () => clearTimeout(t);
    }
  }, [success, onDone]);

  return (
    <div className="animate-fade-up flex flex-col items-center justify-center py-24 text-center space-y-6 max-w-md mx-auto">
      {!success ? (
        <>
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-primary/30 animate-pulse" />
            <div className="absolute inset-4 rounded-full bg-primary flex items-center justify-center">
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-foreground min-h-[2rem]">
            {typed}<span className="animate-pulse">|</span>
          </h2>
          <p className="text-sm text-muted-foreground">Por favor, aguarde alguns segundos.</p>
        </>
      ) : (
        <>
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-fade-up">
            <CheckCircle2 className="w-14 h-14 text-primary" />
          </div>
          <h2 className="text-3xl font-black text-foreground">Parabéns! 🎉</h2>
          <p className="text-base text-muted-foreground">Você foi selecionado para o resgate exclusivo.</p>
        </>
      )}
    </div>
  );
}
