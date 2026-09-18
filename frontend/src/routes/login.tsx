import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import logoImg from "@/assets/logo-transparent.png";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    error: (search.error as string) || undefined,
    returnTo: (search.returnTo as string) || undefined,
  }),
  component: LoginPage,
});

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function LoginPage() {
  const { signInWithGoogle, signInWithEmail, loading: authLoading } = useAuth();
  const { error, returnTo } = Route.useSearch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setFormError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setFormError("Failed to initiate Google sign-in. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);
    const { error } = await signInWithEmail(email, password);
    if (error) {
      setFormError(error);
      setIsLoading(false);
    } else {
      navigate({ to: returnTo || "/" });
    }
  };

  const displayError = error || formError;

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
          to="/"
          className="mb-8 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to store
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-border/50 bg-background/80 p-8 shadow-xl shadow-black/[0.03] backdrop-blur-sm sm:p-10">
          {/* Logo and title */}
          <div className="text-center">
            <img
              src={logoImg}
              alt="Evolve"
              className="mx-auto h-12"
            />
            <h1 className="mt-5 text-xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to access your account
            </p>
          </div>

          {/* Error display */}
          {displayError && (
            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-destructive/15 bg-destructive/5 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="text-[13px] leading-relaxed text-destructive">{displayError}</p>
            </div>
          )}

          {/* Google sign in */}
          <div className="mt-7">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading || authLoading}
              variant="outline"
              className="h-12 w-full gap-3 rounded-xl border-border/70 text-sm font-medium shadow-sm transition-all hover:border-border hover:bg-accent/60 hover:shadow-md"
            >
              <GoogleIcon />
              {isGoogleLoading ? "Redirecting to Google..." : "Continue with Google"}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background/80 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                or
              </span>
            </div>
          </div>

          {/* Email/Password form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] font-medium text-foreground/80">
                Email
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
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[13px] font-medium text-foreground/80">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/forgot-password" })}
                  className="text-[12px] font-medium text-primary/80 transition-colors hover:text-primary"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-border/60 pl-10 text-sm transition-colors focus:border-primary/40"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="mt-2 h-11 w-full rounded-xl text-sm font-medium shadow-sm transition-all hover:shadow-md"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>

        {/* Sign up link */}
        <p className="mt-6 text-center text-[13px] text-muted-foreground">
          New to Evolve?{" "}
          <Link
            to="/register"
            className="font-medium text-primary hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
