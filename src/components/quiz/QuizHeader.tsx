export function QuizHeader({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-background border-b border-border">
      <div className="max-w-3xl mx-auto px-4 py-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <span>Pesquisa Oficial Stanley</span>
          <span className="text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
