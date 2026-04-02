import type { LucideIcon } from "lucide-react";

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  delay?: string;
  icon?: LucideIcon;
  id?: string;
}

export function SectionWrapper({ children, title, subtitle, delay = "", icon: Icon, id }: Props) {
  return (
    <section id={id} className={`col-span-full animate-fade-in ${delay}`}>
      <div className="flex items-center gap-3 mb-1">
        {Icon && (
          <div className="p-2 rounded-lg bg-[#a855f7]/10">
            <Icon className="h-5 w-5 text-[#a855f7]" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-4">
        {children}
      </div>
    </section>
  );
}
