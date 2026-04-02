interface Props {
  children: React.ReactNode;
}

export function NarrativeBlock({ children }: Props) {
  return (
    <div className="border-l-4 border-primary/30 bg-muted/50 rounded-r-lg px-5 py-4 my-6 text-sm leading-relaxed text-foreground/80">
      {children}
    </div>
  );
}
