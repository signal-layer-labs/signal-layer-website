import type { ReactNode } from "react";
import { ExternalLink, Github, Linkedin, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { Tag } from "@/components/Tag";
import { getBuilderBySlug } from "@/lib/builders";

type BuilderProfilePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BuilderProfilePage({ params }: BuilderProfilePageProps) {
  const { slug } = await params;
  const profile = await getBuilderBySlug(slug);

  if (!profile) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <section className="rounded-lg border border-line bg-panel/70 p-6 shadow-soft">
        <div className="mb-4 flex flex-wrap gap-2">
          {profile.open_to_collaboration ? <Tag tone="signal">Open to collaboration</Tag> : null}
          {profile.open_to_opportunities ? <Tag>Open to opportunities</Tag> : null}
          {profile.is_demo ? <Tag tone="muted">Demo data</Tag> : null}
        </div>
        <h1 className="text-4xl font-semibold text-ink">{profile.full_name}</h1>
        {profile.headline ? <p className="mt-3 max-w-3xl text-lg leading-8 text-muted">{profile.headline}</p> : null}

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted">
          {profile.location || profile.timezone ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={16} />
              {[profile.location, profile.timezone].filter(Boolean).join(" / ")}
            </span>
          ) : null}
          <ProfileLink href={profile.github_url} label="GitHub" icon={<Github size={16} />} />
          <ProfileLink href={profile.linkedin_url} label="LinkedIn" icon={<Linkedin size={16} />} />
          <ProfileLink href={profile.portfolio_url} label="Portfolio" icon={<ExternalLink size={16} />} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <section className="rounded-lg border border-line bg-panel/70 p-6">
          <h2 className="text-lg font-semibold text-ink">About</h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted">{profile.bio || "No bio provided yet."}</p>
        </section>

        <aside className="grid gap-4">
          <TagGroup title="Skills" items={profile.skills} />
          <TagGroup title="Interests" items={profile.interests} />
          <TagGroup title="Languages" items={profile.languages} />
        </aside>
      </div>

      <section className="mt-6 rounded-lg border border-line bg-panel/70 p-6">
        <h2 className="text-lg font-semibold text-ink">Projects</h2>
        <div className="mt-4 grid gap-3">
          {profile.projects?.length ? (
            profile.projects.map((project) => (
              <article className="rounded-md border border-line bg-field p-4" key={project.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-semibold text-ink">{project.name}</h3>
                  {project.url ? (
                    <a className="inline-flex items-center gap-1.5 text-sm text-signal" href={project.url} target="_blank" rel="noreferrer">
                      Visit
                      <ExternalLink size={14} />
                    </a>
                  ) : null}
                </div>
                {project.description ? <p className="mt-2 text-sm leading-6 text-muted">{project.description}</p> : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <p className="text-sm text-muted">No projects added yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function TagGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-lg border border-line bg-panel/70 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length ? items.map((item) => <Tag key={item}>{item}</Tag>) : <p className="text-sm text-muted">Not listed.</p>}
      </div>
    </section>
  );
}

function ProfileLink({ href, label, icon }: { href: string | null; label: string; icon: ReactNode }) {
  if (!href) {
    return null;
  }

  return (
    <a className="inline-flex items-center gap-1.5 hover:text-ink" href={href} target="_blank" rel="noreferrer">
      {icon}
      {label}
    </a>
  );
}
