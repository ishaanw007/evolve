import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const { setTokenAndUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error) {
      navigate({
        to: "/login",
        search: { error: "Sign-in failed. Please try again." },
      });
      return;
    }

    if (token) {
      setTokenAndUser(token);
      navigate({ to: "/" });
    } else {
      navigate({
        to: "/login",
        search: { error: "No authentication token received." },
      });
    }
  }, [navigate, setTokenAndUser]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Completing sign-in...</p>
      </div>
    </div>
  );
}
