import { Reveal } from "./Reveal";

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-[image:var(--gradient-surface)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full bg-secondary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <p className="text-xs font-semibold tracking-[0.18em] text-secondary uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {subtitle}
          </p>
        </Reveal>
      </div>
    </section>
  );
}