import Link from "next/link";
import { AdminNavLink } from "./AdminNavLink";
import { ProfileNavLink } from "./ProfileNavLink";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-[0.18em] text-ink">
          SIGNAL LAYER BUILDERS
        </Link>
        <nav className="flex w-full flex-wrap items-center gap-2 text-sm text-muted sm:w-auto sm:justify-end">
          <Link className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink" href="/builders">
            Builders
          </Link>
          <AdminNavLink />
          <ProfileNavLink />
        </nav>
      </div>
    </header>
  );
}
