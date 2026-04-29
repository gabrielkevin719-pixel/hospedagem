import { useState } from "react";
import { Star, ThumbsUp } from "lucide-react";
import t1 from "@/assets/testimonial-stanley-1.png";
import t2 from "@/assets/testimonial-stanley-2.jpeg";
import t3 from "@/assets/testimonial-stanley-3.jpeg";

const reviews = [
  {
    name: "Marina S.",
    time: "há 2 horas",
    text: "Chegou em 4 dias! Qualidade absurda, mantém a água gelada o dia todo. Recomendo demais 💚",
    likes: 142,
    img: t1,
  },
  {
    name: "Rafael C.",
    time: "há 5 horas",
    text: "Achei que era golpe mas chegou certinho. Paguei só o frete mesmo. Stanley original!",
    likes: 98,
    img: t2,
  },
  {
    name: "Juliana P.",
    time: "ontem",
    text: "Meu marido amou! Vou pedir outro pra mim. Entrega super rápida via Correios.",
    likes: 211,
    img: t3,
  },
];

export function Testimonials() {
  const [likes, setLikes] = useState<number[]>(reviews.map((r) => r.likes));
  const [liked, setLiked] = useState<boolean[]>(reviews.map(() => false));

  const toggleLike = (i: number) => {
    setLiked((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
    setLikes((prev) => {
      const next = [...prev];
      next[i] = next[i] + (liked[i] ? -1 : 1);
      return next;
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-foreground">Comentários (3.247)</h3>
        <div className="flex items-center gap-1 text-sm font-bold text-primary">
          <Star className="w-4 h-4 fill-current" /> 4.9
        </div>
      </div>
      {reviews.map((r, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4 shadow-[var(--shadow-soft)] space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
              {r.name[0]}
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm text-foreground">{r.name}</div>
              <div className="text-xs text-muted-foreground">{r.time}</div>
            </div>
            <div className="flex gap-0.5 text-warning">
              {[...Array(5)].map((_, k) => <Star key={k} className="w-3 h-3 fill-current" />)}
            </div>
          </div>
          <p className="text-sm text-foreground">{r.text}</p>
          <img src={r.img} alt="Cliente" loading="lazy" className="w-full max-w-xs rounded-lg" />
          <div className="flex gap-4 pt-1 text-xs font-semibold">
            <button
              onClick={() => toggleLike(i)}
              className={`flex items-center gap-1 transition-colors ${
                liked[i] ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${liked[i] ? "fill-current" : ""}`} /> Curtir ({likes[i]})
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}
