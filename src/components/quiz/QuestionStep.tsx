import { Check } from "lucide-react";
import { useState } from "react";

export type Question = {
  title: string;
  options: { label: string; sub?: string; swatch?: string }[];
};

export function QuestionStep({
  question,
  onAnswer,
  index,
  total,
}: {
  question: Question;
  onAnswer: (value: string) => void;
  index: number;
  total: number;
}) {
  const [picked, setPicked] = useState<string | null>(null);

  const choose = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    setTimeout(() => onAnswer(opt), 500);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-7 animate-slide-in">
      <div className="text-xs font-black uppercase tracking-wider text-primary">
        Pergunta {index + 1} de {total}
      </div>
      <h2 className="text-2xl sm:text-3xl font-black text-foreground leading-tight tracking-tight">
        {question.title}
      </h2>

      <div className="space-y-3">
        {question.options.map((opt) => {
          const isPicked = picked === opt.label;
          return (
            <button
              key={opt.label}
              onClick={() => choose(opt.label)}
              disabled={!!picked}
              className={`w-full text-left px-5 py-4 rounded-xl bg-card border-2 transition-all shadow-[var(--shadow-soft)] font-semibold flex items-center gap-3 group active:scale-[0.99] ${
                isPicked
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : picked
                    ? "border-border opacity-40"
                    : "border-border hover:border-primary hover:bg-primary/5"
              }`}
            >
              {opt.swatch && (
                <span
                  className="w-8 h-8 rounded-full border-2 border-white shadow-md flex-shrink-0"
                  style={{ background: opt.swatch }}
                />
              )}
              <span className="flex-1">
                <span className="block text-foreground">{opt.label}</span>
                {opt.sub && <span className="block text-xs text-muted-foreground font-normal">{opt.sub}</span>}
              </span>
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  isPicked ? "bg-primary text-primary-foreground scale-100" : "bg-muted scale-90 opacity-0 group-hover:opacity-50"
                }`}
              >
                <Check className="w-4 h-4" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
