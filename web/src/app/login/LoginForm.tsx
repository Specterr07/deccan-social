"use client";

import { useActionState } from "react";
import { login } from "./actions";

// Password form; shows the error message returned by the login action.
export function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(login, null);

  return (
    <form action={formAction} className="stack">
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" required autoFocus />
      {errorMessage && <p role="alert" className="error">{errorMessage}</p>}
      <button type="submit" disabled={isPending}>{isPending ? "Checking…" : "Log in"}</button>
    </form>
  );
}
