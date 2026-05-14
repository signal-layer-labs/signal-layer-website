"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { BuilderProfile } from "@/lib/types";
import { normalizeExternalUrl } from "@/lib/urls";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AdminProfile = Pick<
  BuilderProfile,
  | "id"
  | "slug"
  | "full_name"
  | "headline"
  | "bio"
  | "location"
  | "timezone"
  | "skills"
  | "interests"
  | "github_url"
  | "linkedin_url"
  | "portfolio_url"
  | "open_to_collaboration"
  | "open_to_opportunities"
  | "status"
  | "created_at"
>;

export function AdminProfilesManager() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [message, setMessage] = useState("Loading pending profiles...");
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getToken() {
    if (!supabase) {
      return null;
    }

    const {
      data: { session }
    } = await supabase.auth.getSession();

    return session?.access_token ?? null;
  }

  async function loadProfiles() {
    const token = await getToken();

    if (!token) {
      setMessage("Sign in with an admin email before reviewing profiles.");
      return;
    }

    const response = await fetch("/api/admin/profiles", {
      headers: {
        authorization: `Bearer ${token}`
      }
    });
    const payload = (await response.json()) as { profiles?: AdminProfile[]; error?: string };

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to load pending profiles.");
      return;
    }

    setProfiles(payload.profiles ?? []);
    setMessage(payload.profiles?.length ? "" : "No pending profiles right now.");
  }

  async function updateProfile(profileId: string, status: "approved" | "hidden") {
    const token = await getToken();

    if (!token) {
      setMessage("Sign in with an admin email before reviewing profiles.");
      return;
    }

    setIsBusy(true);
    const response = await fetch("/api/admin/profiles", {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ profileId, status })
    });
    const payload = (await response.json()) as { error?: string };
    setIsBusy(false);

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to update profile.");
      return;
    }

    const profile = profiles.find((currentProfile) => currentProfile.id === profileId);
    setProfiles((currentProfiles) => currentProfiles.filter((currentProfile) => currentProfile.id !== profileId));
    setMessage(status === "approved" ? `${profile?.full_name ?? "Profile"} approved.` : `${profile?.full_name ?? "Profile"} hidden.`);
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-signal">Admin</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Pending builder profiles</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Review lightweight profile submissions and decide whether they should appear in the public directory.
        </p>
      </div>

      {message ? (
        <div className="rounded-lg border border-line bg-panel p-5 text-sm text-muted">
          {message}{" "}
          {message.startsWith("Sign in") ? (
            <Link className="text-signal" href="/profile/edit">
              Go to sign in.
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4">
        {profiles.map((profile) => (
          <article className="rounded-lg border border-line bg-panel p-5" key={profile.id}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-ink">{profile.full_name}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{profile.headline}</p>
                {profile.bio ? <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{profile.bio}</p> : null}
              </div>
              <div className="grid gap-2 sm:flex sm:flex-wrap">
                <button className="rounded-md bg-signal px-3 py-2 text-sm font-semibold text-canvas disabled:opacity-60" disabled={isBusy} onClick={() => updateProfile(profile.id, "approved")} type="button">
                  Approve
                </button>
                <button className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink disabled:opacity-60" disabled={isBusy} onClick={() => updateProfile(profile.id, "hidden")} type="button">
                  Hide
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span className="rounded-full border border-line bg-field px-2.5 py-1 text-xs text-muted" key={skill}>
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
              <span>{profile.slug}</span>
              {[profile.location, profile.timezone].filter(Boolean).join(" / ")}
              <AdminLink href={profile.github_url} label="GitHub" />
              <AdminLink href={profile.linkedin_url} label="LinkedIn" />
              <AdminLink href={profile.portfolio_url} label="Portfolio" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function AdminLink({ href, label }: { href: string | null; label: string }) {
  const normalizedHref = normalizeExternalUrl(href);

  if (!normalizedHref) {
    return null;
  }

  return (
    <a className="inline-flex items-center gap-1.5 text-signal" href={normalizedHref} rel="noreferrer" target="_blank">
      {label}
      <ExternalLink size={14} />
    </a>
  );
}
