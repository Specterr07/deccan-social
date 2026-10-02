"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "./actions";

// Password form; shows the error message returned by the login action.
export function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(login, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={errorMessage ? "password-error" : undefined}
        />
        {errorMessage && (
          <p id="password-error" role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Checking…" : "Log in"}
      </Button>
    </form>
  );
}
