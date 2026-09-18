import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Clock, BadgeCheck } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { QuoteForm } from "@/components/site/QuoteForm";
import { contact } from "@/components/site/data";

const title = "Contact & Request a Quote | Evolve Life Sciences";
const description =
  "Contact Evolve Life Sciences for pricing, availability and lead times on laboratory chemicals, reagents, antibodies, FBS, glassware and instruments in India.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Speak with our sourcing team"
        subtitle="Send your requirement with catalogue numbers or specifications and we will respond with pricing, availability and lead time within one business day."
      />

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <div className="grid gap-4">
              {[
                { icon: Phone, label: "Phone", value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
                { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
                { icon: MapPin, label: "Business Address", value: contact.address },
                { icon: BadgeCheck, label: "GSTIN", value: contact.gstin },
                { icon: Clock, label: "Working Hours", value: "Monday – Saturday, 9:30 AM – 6:30 PM IST" },
              ].map((c) => (
                <div
                  key={c.label}
                  className="flex gap-4 rounded-3xl border border-border/70 bg-card p-6 shadow-[var(--shadow-soft)]"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                    <c.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                      {c.label}
                    </p>
                    {c.href ? (
                      <a
                        href={c.href}
                        className="mt-1 block text-sm leading-relaxed font-medium break-words hover:text-primary"
                      >
                        {c.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm leading-relaxed font-medium">{c.value}</p>
                    )}
                  </div>
                </div>
              ))}

              <div className="overflow-hidden rounded-3xl border border-border/70 bg-[image:var(--gradient-surface)]">
                <div className="grid h-56 place-items-center text-center">
                  <div>
                    <MapPin className="mx-auto h-6 w-6 text-secondary" />
                    <p className="mt-3 text-sm font-medium">Google Maps</p>
                    <p className="mt-1 px-6 text-xs text-muted-foreground">
                      Map embed placeholder — the live location map will appear here.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100} className="scroll-mt-24" >
            <div id="quote" className="scroll-mt-24">
              <h2 className="mb-5 text-2xl font-semibold tracking-tight">Request a Quote</h2>
              <QuoteForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}