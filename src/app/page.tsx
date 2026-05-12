import { ArrowRight, Blocks, GitBranch, Network } from "lucide-react";
import Link from "next/link";
import { BuilderCard } from "@/components/BuilderCard";
import { getApprovedBuilders } from "@/lib/builders";

export default async function HomePage() {
  const builders = (await getApprovedBuilders()).slice(0, 2);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-signal">Signal Layer Builders</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-6xl">
            A lightweight directory for people building real systems.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted">
            Find builders working on operational AI, workflows, orchestration, infrastructure, observability,
            automation, and the practical work of putting systems into production.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="inline-flex items-center gap-2 rounded-md bg-signal px-4 py-2.5 text-sm font-semibold text-canvas" href="/builders">
              Browse builders
              <ArrowRight size={17} />
            </Link>
            <Link className="rounded-md border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:border-signal/60" href="/profile/edit">
              Create profile
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {builders.map((builder) => (
            <BuilderCard key={builder.id} profile={builder} />
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-4 md:grid-cols-3">
        {[
          {
            icon: <Blocks size={22} />,
            title: "Systems over resumes",
            body: "Profiles center practical work, skills, interests, and projects rather than a feed or ranking layer."
          },
          {
            icon: <GitBranch size={22} />,
            title: "Built for collaboration",
            body: "Members can show what they are working on and whether they are open to collaborations or opportunities."
          },
          {
            icon: <Network size={22} />,
            title: "Small surface area",
            body: "The MVP avoids recruiter flows, likes, messages, and matching. It keeps the foundation clear."
          }
        ].map((item) => (
          <div className="rounded-lg border border-line bg-panel/70 p-5" key={item.title}>
            <div className="mb-4 text-signal">{item.icon}</div>
            <h2 className="text-lg font-semibold text-ink">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
