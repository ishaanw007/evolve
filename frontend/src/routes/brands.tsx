import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { brands } from "@/components/site/data";
import thermoLogo from "@/assets/thermo.png";
import sigmaLogo from "@/assets/sigma.svg";
import himediaLogo from "@/assets/HiMedia_Logo.png";
import abcamLogo from "@/assets/abcam.svg";
import bioradLogo from "@/assets/bio-rad-logo.svg";
import corningLogo from "@/assets/corning.webp";
import qiagenLogo from "@/assets/qiagen_logo.jpeg";
import gibcoLogo from "@/assets/gibico.png";
import eppendorfLogo from "@/assets/eppendorf.png";
import borosilLogo from "@/assets/borosil.jpeg";
import sartoriusLogo from "@/assets/satorious.png";

const brandLogos: Record<string, string> = {
  thermo: thermoLogo,
  sigma: sigmaLogo,
  himedia: himediaLogo,
  abcam: abcamLogo,
  biorad: bioradLogo,
  corning: corningLogo,
  qiagen: qiagenLogo,
  gibco: gibcoLogo,
  eppendorf: eppendorfLogo,
  borosil: borosilLogo,
  sartorius: sartoriusLogo,
};

const title = "Brands We Supply | Evolve Life Sciences";
const description =
  "Products sourced from globally recognized manufacturers of chemicals, reagents, antibodies, media, glassware and laboratory instruments.";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "/brands" },
    ],
    links: [{ rel: "canonical", href: "/brands" }],
  }),
  component: Brands,
});

function Brands() {
  return (
    <>
      <PageHero
        eyebrow="Brands"
        title="Products sourced from globally recognized manufacturers."
        subtitle="We work with established international and Indian manufacturers so your results stay reproducible from one lot to the next."
      />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((b, i) => (
            <Reveal key={b.name} delay={i * 35}>
              <div className="grid h-32 place-items-center rounded-3xl border border-border/70 bg-card p-4 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
                {b.logo && brandLogos[b.logo] ? (
                  <img
                    src={brandLogos[b.logo]}
                    alt={`${b.name} logo`}
                    className="h-10 w-auto object-contain"
                  />
                ) : null}
                <span className="text-base font-semibold tracking-tight text-muted-foreground">
                  {b.name}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Logos are shown as placeholders. All brand names and trademarks remain the property of
          their respective owners; listing indicates the manufacturers whose products we supply.
        </p>
      </section>
    </>
  );
}