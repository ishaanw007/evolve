import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Dna, Linkedin, Twitter, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { contact, productCategories } from "./data";

export function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="mt-24 border-t border-border/70 bg-[image:var(--gradient-surface)]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[image:var(--gradient-brand)] text-primary-foreground">
                <Dna className="h-5 w-5" />
              </span>
              <span className="text-[15px] font-semibold tracking-tight">Evolve Life Sciences</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A trusted supplier of laboratory chemicals, reagents, cell culture products and
              scientific instruments to research organisations across India.
            </p>
            <div className="mt-5 flex gap-2">
              {[Linkedin, Twitter, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social profile"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-tight">Quick Links</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {[
                { to: "/", label: "Home" },
                { to: "/products", label: "Products" },
                { to: "/industries", label: "Industries" },
                { to: "/brands", label: "Brands" },
                { to: "/about", label: "About Us" },
                { to: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="transition-colors hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-tight">Product Categories</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {productCategories.slice(0, 8).map((c) => (
                <li key={c.name}>
                  <Link
                    to="/products"
                    search={{ q: c.name }}
                    className="transition-colors hover:text-primary"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-tight">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a>
              </li>
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <span>{contact.address}</span>
              </li>
            </ul>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Subscribed — thank you for joining our updates.");
                setEmail("");
              }}
              className="mt-6"
            >
              <label htmlFor="newsletter" className="text-sm font-semibold tracking-tight">
                Newsletter
              </label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="newsletter"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@institute.edu"
                  className="h-10 rounded-full"
                />
                <Button type="submit" variant="hero" className="h-10 shrink-0 px-5">
                  Join
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Evolve Life Sciences. All rights reserved.</p>
          <p>GST-compliant supplier · Serving research institutions across India</p>
        </div>
      </div>
    </footer>
  );
}