import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <p className="text-sm uppercase tracking-[0.22em] text-signal">Not found</p>
      <h1 className="mt-4 text-3xl font-semibold text-ink">This builder profile is not available.</h1>
      <p className="mt-3 text-muted">It may still be pending approval or hidden from the public directory.</p>
      <Link className="mt-8 inline-flex rounded-md bg-signal px-4 py-2 text-sm font-semibold text-canvas" href="/builders">
        Back to builders
      </Link>
    </div>
  );
}
