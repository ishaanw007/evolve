import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import logoImg from "@/assets/logo-transparent.png";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const Route = createFileRoute("/auth/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.message ?? "Failed to reset password.");
      } else {
        setSuccess(true);
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
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
              Password updated
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <Button
              onClick={() => navigate({ to: "/login", search: { error: undefined, returnTo: undefined } })}
              className="mt-6 h-11 w-full rounded-xl text-sm font-medium shadow-sm"
            >
              Sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-20 -z-10 h-[400px] w-[400px] rounded-full bg-secondary/5 blur-[80px]"
      />

      <div className="w-full max-w-[420px]">
        <div className="rounded-2xl border border-border/50 bg-background/80 p-8 shadow-xl shadow-black/[0.03] backdrop-blur-sm sm:p-10">
          <div className="text-center">
            <img
              src={logoImg}
              alt="Evolve"
              className="mx-auto h-12 w-12 rounded-xl object-cover shadow-sm"
            />
            <h1 className="mt-5 text-xl font-bold tracking-tight text-foreground">
              Set new password
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Choose a strong password for your account
            </p>
          </div>

          {formError && (
            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-destructive/15 bg-destructive/5 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="text-[13px] leading-relaxed text-destructive">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[13px] font-medium text-foreground/80">
                New password
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="h-11 rounded-xl border-border/60 pl-10 text-sm transition-colors focus:border-primary/40"
                  required
                  minLength={6}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-[13px] font-medium text-foreground/80">
                Confirm password
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="h-11 rounded-xl border-border/60 pl-10 text-sm transition-colors focus:border-primary/40"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-xl text-sm font-medium shadow-sm transition-all hover:shadow-md"
            >
              {isLoading ? "Updating..." : "Update password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
