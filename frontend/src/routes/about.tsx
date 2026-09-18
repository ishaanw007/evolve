import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { advantages } from "@/components/site/data";

const title = "About Evolve Life Sciences | Life Science Supply Partner";
const description =
  "Evolve Life Sciences is an India-based supplier of laboratory chemicals, reagents, biologicals and instruments, built on quality documentation and technical support.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="Built by people who have worked at the bench"
        subtitle="Evolve Life Sciences exists to remove friction from research procurement — the right product, correctly documented, delivered on time."
      />

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <div className="space-y-5 leading-relaxed text-muted-foreground">
              <p>
                We supply high-quality laboratory chemicals, research reagents, antibodies, cell
                culture media, Fetal Bovine Serum, ELISA kits, molecular biology reagents,
                consumables, glassware and scientific instruments to universities, research
                institutes, pharmaceutical companies, hospitals, biotechnology companies and
                laboratories across India.
              </p>
              <p>
                Our team combines scientific training with sourcing expertise. That means enquiries
                are answered by someone who understands the difference between grades, storage
                conditions and validation requirements — not just a catalogue number.
              </p>
              <p>
                From a single vial of antibody to an annual chemical rate contract for a
                multi-department facility, we treat every consignment as part of an experiment that
                has to work.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="glass-card rounded-3xl p-8">
              <h2 className="text-lg font-semibold tracking-tight">What we commit to</h2>
              <ul className="mt-6 space-y-5">
                {advantages.map((a) => (
                  <li key={a.name} className="flex gap-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                      <a.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold tracking-tight">{a.name}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{a.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}