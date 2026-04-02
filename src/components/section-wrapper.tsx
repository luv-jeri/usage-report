import { Separator } from "@/components/ui/separator";

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  delay?: string;
  showSeparator?: boolean;
}

export function SectionWrapper({ children, title, subtitle, delay = "", showSeparator = true }: Props) {
  return (
    <>
      {showSeparator && <Separator className="my-4" />}
      <section className={`py-12 animate-fade-in ${delay}`}>
        <h2 className="text-2xl font-bold tracking-tight mb-2">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mb-6 max-w-3xl">{subtitle}</p>}
        {children}
      </section>
    </>
  );
}
