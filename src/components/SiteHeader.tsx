import Link from "next/link";
import { AdminNavLink } from "./AdminNavLink";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-[0.18em] text-ink">
          SIGNAL LAYER BUILDERS
        </Link>
        <nav className="flex items-center gap-2 text-sm text-muted">
          <Link className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink" href="/builders">
            Builders
          </Link>
          <AdminNavLink />
          <Link className="rounded-md border border-line px-3 py-2 text-ink transition hover:border-signal/60" href="/profile/edit">
            Edit profile
          </Link>
        </nav>
      </div>
    </header>
  );
}
