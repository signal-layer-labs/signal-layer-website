"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export function DirectoryFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const availability = searchParams.get("availability") ?? "all";

  const updateUrl = useMemo(
    () => (next: { q?: string; availability?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      const nextQuery = next.q ?? query;
      const nextAvailability = next.availability ?? availability;

      if (nextQuery.trim()) {
        params.set("q", nextQuery.trim());
      } else {
        params.delete("q");
      }

      if (nextAvailability && nextAvailability !== "all") {
        params.set("availability", nextAvailability);
      } else {
        params.delete("availability");
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [availability, pathname, query, router, searchParams]
  );

  return (
    <div className="grid gap-3 rounded-lg border border-line bg-panel/70 p-4 sm:grid-cols-[1fr_auto]">
      <form
        className="relative"
        onSubmit={(event) => {
          event.preventDefault();
          updateUrl({ q: query });
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input
          className="h-11 w-full rounded-md border border-line bg-field pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-signal"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, skills, interests"
        />
      </form>

      <div className="grid grid-cols-3 overflow-hidden rounded-md border border-line text-sm">
        {[
          ["all", "All"],
          ["collaboration", "Collaborate"],
          ["opportunities", "Opportunities"]
        ].map(([value, label]) => (
          <button
            className={`px-3 py-2 transition ${availability === value ? "bg-signal text-canvas" : "bg-field text-muted hover:text-ink"}`}
            key={value}
            onClick={() => updateUrl({ availability: value })}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
