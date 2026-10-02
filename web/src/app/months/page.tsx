import { logout } from "../login/actions";

// Placeholder list of months; the upload form and real list arrive in T-03.
export default function MonthsPage() {
  return (
    <main className="card">
      <h1>Months</h1>
      <p>No months yet. Uploading a calendar will be added soon.</p>
      <form action={logout}>
        <button type="submit">Log out</button>
      </form>
    </main>
  );
}
