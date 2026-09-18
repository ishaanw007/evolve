import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { industries } from "@/components/site/data";

const title = "Industries We Serve | Evolve Life Sciences";
const description =
  "We supply universities, biotechnology and pharmaceutical companies, hospitals, diagnostic laboratories, research institutes and CROs across India.";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "/industries" },
    ],
    links: [{ rel: "canonical", href: "/industries" }],
  }),
  component: Industries,
});

function Industries() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Procurement shaped around your sector"
        subtitle="Every sector has its own documentation, compliance and delivery expectations. We work within them rather than around them."
      />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((c, i) => (
            <Reveal key={c.name} delay={i * 45}>
              <article className="h-full rounded-3xl border border-border/70 bg-card p-7 shadow-[var(--shadow-soft)]">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[image:var(--gradient-brand)] text-primary-foreground">
                  <c.icon className="h-5 w-5" />
                </span>
                <h2 className="mt-5 text-base font-semibold tracking-tight">{c.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12">
          <div className="glass-card flex flex-col items-start gap-5 rounded-3xl p-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Need a supply arrangement for a multi-lab facility or a recurring annual requirement?
              Our team can structure a rate contract for you.
            </p>
            <Button asChild variant="hero" size="xl" className="shrink-0">
              <Link to="/contact" hash="quote">
                Talk to our team
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}