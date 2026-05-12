import { BuilderCard } from "@/components/BuilderCard";
import { DirectoryFilters } from "@/components/DirectoryFilters";
import { getApprovedBuilders } from "@/lib/builders";
import type { BuilderFilters } from "@/lib/types";

type BuildersPageProps = {
  searchParams: Promise<{
    q?: string;
    availability?: string;
  }>;
};

export default async function BuildersPage({ searchParams }: BuildersPageProps) {
  const params = await searchParams;
  const filters: BuilderFilters = {
    query: params.q,
    availability:
      params.availability === "collaboration" || params.availability === "opportunities"
        ? params.availability
        : "all"
  };
  const builders = await getApprovedBuilders(filters);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.22em] text-signal">Directory</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Builders working on practical systems</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          Search by name, skills, interests, or availability. Approved profiles are shown publicly.
        </p>
      </div>

      <DirectoryFilters />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {builders.map((builder) => (
          <BuilderCard key={builder.id} profile={builder} />
        ))}
      </div>

      {!builders.length ? (
        <div className="mt-6 rounded-lg border border-line bg-panel p-8 text-center text-muted">
          No approved builders match this search yet.
        </div>
      ) : null}
    </div>
  );
}
