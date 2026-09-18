import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const fields = [
  { id: "name", label: "Name", type: "text", required: true, placeholder: "Dr. A. Sharma" },
  { id: "company", label: "Company / Institution", type: "text", required: true, placeholder: "IIT Bombay" },
  { id: "email", label: "Email", type: "email", required: true, placeholder: "you@institute.edu" },
  { id: "phone", label: "Phone", type: "tel", required: true, placeholder: "+91 7303442030" },
  { id: "product", label: "Product Required", type: "text", required: true, placeholder: "Fetal Bovine Serum, 500 mL" },
  { id: "quantity", label: "Quantity", type: "text", required: false, placeholder: "10 bottles" },
] as const;

export function QuoteForm() {
  const [pending, setPending] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setPending(true);
        const form = e.currentTarget;
        setTimeout(() => {
          setPending(false);
          form.reset();
          toast.success("Quote request received", {
            description: "Our team will respond with pricing and lead time within one business day.",
          });
        }, 700);
      }}
      className="glass-card rounded-3xl p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.id} className="grid gap-2">
            <Label htmlFor={f.id}>{f.label}</Label>
            <Input
              id={f.id}
              name={f.id}
              type={f.type}
              required={f.required}
              placeholder={f.placeholder}
              className="h-11 rounded-xl bg-background"
            />
          </div>
        ))}
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            name="message"
            rows={4}
            placeholder="Catalogue numbers, grade, packing size, delivery timeline…"
            className="rounded-xl bg-background"
          />
        </div>
      </div>
      <Button type="submit" variant="hero" size="xl" disabled={pending} className="mt-6 w-full sm:w-auto">
        {pending ? "Sending…" : "Request a Quote"}
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">
        We reply to every enquiry within one business day with pricing, availability and lead time.
      </p>
    </form>
  );
}