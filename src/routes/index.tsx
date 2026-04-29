import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StanleyHeader } from "@/components/stanley/StanleyHeader";
import { StanleyFooter } from "@/components/stanley/StanleyFooter";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { IntroStep } from "@/components/quiz/IntroStep";
import { QuestionStep, type Question } from "@/components/quiz/QuestionStep";
import { ValidationStep } from "@/components/quiz/ValidationStep";
import { OfferStep } from "@/components/quiz/OfferStep";
import { PixStep } from "@/components/quiz/PixStep";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Copo Quencher Karol G | 1.18L — Stanley 1913" },
      {
        name: "description",
        content:
          "KAROL G se move pelo mundo ao seu próprio ritmo, com os pés no chão e completamente em seu elemento. A Coleção Stanley 1913 x Karol G traz essa energia com um acabamento dourado premium. www.stanley1913.com.br",
      },
      { name: "author", content: "Stanley 1913" },
      { name: "theme-color", content: "#2D3A30" },

      // Open Graph (WhatsApp, Facebook, LinkedIn, Telegram)
      { property: "og:type", content: "product" },
      { property: "og:site_name", content: "Stanley 1913" },
      { property: "og:title", content: "Copo Quencher Karol G | 1.18L" },
      {
        property: "og:description",
        content:
          "KAROL G se move pelo mundo ao seu próprio ritmo, com os pés no chão e completamente em seu elemento. A Coleção Stanley 1913 x Karol G traz essa energia com um acabamento dourado premium. www.stanley1913.com.br",
      },
      { property: "og:image", content: "/og-quencher-karolg.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Copo Quencher Karol G 1.18L Stanley 1913" },
      { property: "og:locale", content: "pt_BR" },

      // Twitter / X
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Copo Quencher Karol G | 1.18L" },
      {
        name: "twitter:description",
        content:
          "Coleção Stanley 1913 x Karol G — acabamento dourado premium. Edição Limitada.",
      },
      { name: "twitter:image", content: "/og-quencher-karolg.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://www.stanley1913.com.br/products/copo-quencher-karol-g-1-8l" }],
  }),
  component: QuizApp,
});

const questions: Question[] = [
  {
    title: "Qual sua maior frustração com copos e garrafas térmicas comuns?",
    options: [
      { label: "O gelo derrete muito rápido", sub: "Bebida quente em minutos" },
      { label: "O copo \"sua\" por fora e molha tudo", sub: "Mesa, mochila, carro" },
      { label: "A tampa vaza na mochila/carro", sub: "Sujeira e perda de líquido" },
      { label: "É difícil de limpar e pega cheiro", sub: "Higiene comprometida" },
    ],
  },
  {
    title: "Onde você mais sente falta de uma bebida gelada o dia todo?",
    options: [
      { label: "No carro (trânsito/viagem)" },
      { label: "Na mesa do escritório/home office" },
      { label: "Na academia ou durante esportes" },
      { label: "Em festas ou churrascos" },
    ],
  },
  {
    title: "Qual característica você mais valoriza em um produto da Stanley?",
    options: [
      { label: "Durabilidade Vitalícia", sub: "Garantia pra vida toda" },
      { label: "Manter a temperatura por longas horas" },
      { label: "A tampa Quencher multifunção" },
      { label: "Design e estilo premium" },
    ],
  },
  {
    title: "Você é fã da Karol G ou acompanha o universo Bichota?",
    options: [
      { label: "Sim, sou fã raiz 🔥", sub: "Não perco lançamento" },
      { label: "Curto as músicas", sub: "Ouço sempre" },
      { label: "Conheço de nome", sub: "Sei quem é" },
      { label: "Só quero o copo!", sub: "Vim pelo design" },
    ],
  },
  {
    title: "Qual benefício faria mais diferença na sua rotina hoje?",
    options: [
      { label: "Não precisar repor gelo toda hora", sub: "Mais praticidade durante o dia" },
      { label: "Ter uma tampa mais segura", sub: "Menos preocupação com vazamentos" },
      { label: "Levar mais líquido de uma vez", sub: "Ideal para uma rotina corrida" },
      { label: "Usar um produto resistente por anos", sub: "Compra útil, bonita e durável" },
    ],
  },
];

type Stage = "intro" | "quiz" | "validating" | "offer" | "pix";

function QuizApp() {
  const [stage, setStage] = useState<Stage>("intro");
  const [transition, setTransition] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [, setAnswers] = useState<string[]>([]);
  const [customer, setCustomer] = useState({ name: "", email: "", cpf: "", address: "", shippingMethod: "pac" as "pac" | "sedex", shippingAmount: 19.76, protectionAmount: 0, protectionEnabled: false });

  const progress =
    stage === "intro" ? 10
    : stage === "quiz" ? 10 + ((qIndex + 1) / questions.length) * 60
    : stage === "validating" ? 80
    : stage === "offer" ? 95
    : 100;

  const goTo = (next: Stage) => {
    setTransition(true);
    setTimeout(() => {
      setStage(next);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      setTransition(false);
    }, 400);
  };

  const handleAnswer = (val: string) => {
    setAnswers((a) => [...a, val]);
    if (qIndex < questions.length - 1) {
      setQIndex(qIndex + 1);
    } else {
      goTo("validating");
    }
  };

  const showQuizProgress = stage !== "offer" && stage !== "pix";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StanleyHeader />
      {showQuizProgress && <QuizHeader progress={progress} />}

      <main className={`flex-1 transition-opacity duration-400 ${transition ? "opacity-0" : "opacity-100"}`}>
        {stage === "intro" && (
          <div className="max-w-3xl mx-auto px-4">
            <IntroStep onStart={() => goTo("quiz")} />
          </div>
        )}
        {stage === "quiz" && (
          <div className="max-w-3xl mx-auto px-4">
            <QuestionStep
              key={qIndex}
              question={questions[qIndex]}
              onAnswer={handleAnswer}
              index={qIndex}
              total={questions.length}
            />
          </div>
        )}
        {stage === "validating" && (
          <div className="max-w-3xl mx-auto px-4">
            <ValidationStep onDone={() => goTo("offer")} />
          </div>
        )}
        {stage === "offer" && (
          <OfferStep
            onCheckout={(data) => {
              setCustomer(data);
              goTo("pix");
            }}
          />
        )}
        {stage === "pix" && (
          <div className="max-w-2xl mx-auto px-4 py-8">
            <PixStep
              name={customer.name}
              email={customer.email}
              cpf={customer.cpf}
              amountInCents={Math.round((customer.shippingAmount + customer.protectionAmount) * 100)}
              itemTitle={`${customer.protectionEnabled ? "Frete + Proteção do Pedido" : "Frete"} ${customer.shippingMethod.toUpperCase()} - Quencher 1.18L Karol G`}
              protectionEnabled={customer.protectionEnabled}
              protectionAmountInCents={Math.round(customer.protectionAmount * 100)}
            />
          </div>
        )}
      </main>

      <StanleyFooter />
    </div>
  );
}
