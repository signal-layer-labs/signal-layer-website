import type { ReactNode } from "react";
import { ExternalLink, Github, Linkedin, MapPin } from "lucide-react";
import Link from "next/link";
import type { BuilderProfile } from "@/lib/types";
import { normalizeExternalUrl } from "@/lib/urls";
import { Tag } from "./Tag";

type BuilderCardProps = {
  profile: BuilderProfile;
};

export function BuilderCard({ profile }: BuilderCardProps) {
  return (
    <article className="rounded-lg border border-line bg-panel/70 p-5 shadow-soft transition hover:border-signal/40">
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {profile.open_to_collaboration ? <Tag tone="signal">Open to collaboration</Tag> : null}
            {profile.open_to_opportunities ? <Tag>Open to opportunities</Tag> : null}
            {profile.projects?.length ? <Tag tone="muted">{profile.projects.length} {profile.projects.length === 1 ? "project" : "projects"}</Tag> : null}
            {profile.is_demo ? <Tag tone="muted">Demo data</Tag> : null}
          </div>
          <Link href={`/builders/${profile.slug}`} className="text-xl font-semibold text-ink hover:text-signal">
            {profile.full_name}
          </Link>
          {profile.headline ? <p className="mt-2 text-sm leading-6 text-muted">{profile.headline}</p> : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {profile.skills.slice(0, 5).map((skill) => (
            <Tag key={skill}>{skill}</Tag>
          ))}
        </div>

        <div className="flex flex-col gap-2 text-sm text-muted sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
          {profile.location || profile.timezone ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={15} />
              {[profile.location, profile.timezone].filter(Boolean).join(" / ")}
            </span>
          ) : null}
          <ProfileLink href={profile.github_url} label="GitHub" icon={<Github size={15} />} />
          <ProfileLink href={profile.linkedin_url} label="LinkedIn" icon={<Linkedin size={15} />} />
          <ProfileLink href={profile.portfolio_url} label="Portfolio" icon={<ExternalLink size={15} />} />
        </div>
      </div>
    </article>
  );
}

function ProfileLink({ href, label, icon }: { href: string | null; label: string; icon: ReactNode }) {
  const normalizedHref = normalizeExternalUrl(href);

  if (!normalizedHref) {
    return null;
  }

  return (
    <a className="inline-flex items-center gap-1.5 hover:text-ink" href={normalizedHref} target="_blank" rel="noreferrer">
      {icon}
      {label}
    </a>
  );
}
