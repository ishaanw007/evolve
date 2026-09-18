import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Mail, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import logoImg from "@/assets/logo-transparent.png";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    const { error } = await resetPassword(email);
    setIsLoading(false);

    if (error) {
      setFormError(error);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]"
        />
        <div className="w-full max-w-[420px]">
          <div className="rounded-2xl border border-border/50 bg-background/80 p-8 text-center shadow-xl shadow-black/[0.03] backdrop-blur-sm sm:p-10">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-50 dark:bg-green-950/30">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
            <h1 className="mt-5 text-xl font-bold tracking-tight text-foreground">
              Check your email
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              If an account exists for <strong className="text-foreground">{email}</strong>, we've sent a password reset link. Check your inbox.
            </p>
            <Link
              to="/login"
              search={{ error: undefined, returnTo: undefined }}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      {/* Background effects */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-20 -z-10 h-[400px] w-[400px] rounded-full bg-secondary/5 blur-[80px]"
      />

      <div className="w-full max-w-[420px]">
        {/* Back link */}
        <Link
          to="/login"
          search={{ error: undefined, returnTo: undefined }}
          className="mb-8 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-border/50 bg-background/80 p-8 shadow-xl shadow-black/[0.03] backdrop-blur-sm sm:p-10">
          {/* Logo and title */}
          <div className="text-center">
            <img
              src={logoImg}
              alt="Evolve"
              className="mx-auto h-12 w-12 rounded-xl object-cover shadow-sm"
            />
            <h1 className="mt-5 text-xl font-bold tracking-tight text-foreground">
              Reset your password
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {/* Error display */}
          {formError && (
            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-destructive/15 bg-destructive/5 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="text-[13px] leading-relaxed text-destructive">{formError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] font-medium text-foreground/80">
                Email address
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@institution.edu"
                  className="h-11 rounded-xl border-border/60 pl-10 text-sm transition-colors focus:border-primary/40"
                  required
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-xl text-sm font-medium shadow-sm transition-all hover:shadow-md"
            >
              {isLoading ? "Sending link..." : "Send reset link"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
