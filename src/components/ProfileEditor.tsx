"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ProjectForm = {
  id?: string;
  name: string;
  description: string;
  url: string;
  tags: string;
};

type ProfileForm = {
  slug: string;
  full_name: string;
  headline: string;
  bio: string;
  location: string;
  timezone: string;
  languages: string;
  skills: string;
  interests: string;
  github_url: string;
  linkedin_url: string;
  portfolio_url: string;
  open_to_collaboration: boolean;
  open_to_opportunities: boolean;
};

const emptyForm: ProfileForm = {
  slug: "",
  full_name: "",
  headline: "",
  bio: "",
  location: "",
  timezone: "",
  languages: "",
  skills: "",
  interests: "",
  github_url: "",
  linkedin_url: "",
  portfolio_url: "",
  open_to_collaboration: true,
  open_to_opportunities: false
};

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ProfileEditor() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [projects, setProjects] = useState<ProjectForm[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    async function loadProfile() {
      if (!supabase || !userId) {
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*, projects(*)")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        setMessage(error.message);
        return;
      }

      if (!data) {
        return;
      }

      setProfileId(data.id);
      setForm({
        slug: data.slug ?? "",
        full_name: data.full_name ?? "",
        headline: data.headline ?? "",
        bio: data.bio ?? "",
        location: data.location ?? "",
        timezone: data.timezone ?? "",
        languages: (data.languages ?? []).join(", "),
        skills: (data.skills ?? []).join(", "),
        interests: (data.interests ?? []).join(", "),
        github_url: data.github_url ?? "",
        linkedin_url: data.linkedin_url ?? "",
        portfolio_url: data.portfolio_url ?? "",
        open_to_collaboration: Boolean(data.open_to_collaboration),
        open_to_opportunities: Boolean(data.open_to_opportunities)
      });
      setProjects(
        (data.projects ?? []).map((project: { id: string; name: string; description: string | null; url: string | null; tags: string[] | null }) => ({
          id: project.id,
          name: project.name ?? "",
          description: project.description ?? "",
          url: project.url ?? "",
          tags: (project.tags ?? []).join(", ")
        }))
      );
    }

    loadProfile();
  }, [supabase, userId]);

  async function sendMagicLink() {
    if (!supabase) {
      return;
    }

    setIsBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/profile/edit`
      }
    });
    setIsBusy(false);
    setMessage(error ? error.message : "Check your email for a sign-in link.");
  }

  async function saveProfile() {
    if (!supabase || !userId) {
      return;
    }

    setIsBusy(true);
    setMessage(null);

    const payload = {
      user_id: userId,
      slug: form.slug.trim(),
      full_name: form.full_name.trim(),
      headline: form.headline.trim() || null,
      bio: form.bio.trim() || null,
      location: form.location.trim() || null,
      timezone: form.timezone.trim() || null,
      languages: splitList(form.languages),
      skills: splitList(form.skills),
      interests: splitList(form.interests),
      github_url: form.github_url.trim() || null,
      linkedin_url: form.linkedin_url.trim() || null,
      portfolio_url: form.portfolio_url.trim() || null,
      open_to_collaboration: form.open_to_collaboration,
      open_to_opportunities: form.open_to_opportunities,
      status: "pending"
    };

    const { data, error } = await supabase.from("profiles").upsert(payload, { onConflict: "user_id" }).select("id").single();

    if (error) {
      setIsBusy(false);
      setMessage(error.message);
      return;
    }

    setProfileId(data.id);

    if (projects.length) {
      const projectPayload = projects
        .filter((project) => project.name.trim())
        .map((project) => ({
          id: project.id,
          profile_id: data.id,
          name: project.name.trim(),
          description: project.description.trim() || null,
          url: project.url.trim() || null,
          tags: splitList(project.tags)
        }));

      if (projectPayload.length) {
        const { error: projectError } = await supabase.from("projects").upsert(projectPayload).select("id");
        if (projectError) {
          setIsBusy(false);
          setMessage(projectError.message);
          return;
        }
      }
    }

    setIsBusy(false);
    setMessage("Profile saved. It will appear in the directory after approval.");
  }

  if (!supabase) {
    return (
      <div className="rounded-lg border border-line bg-panel p-6 text-muted">
        Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to enable authentication and profile editing.
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="rounded-lg border border-line bg-panel p-6">
        <h1 className="text-2xl font-semibold text-ink">Create or edit your profile</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Sign in with an email link to manage your builder profile.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            className="h-11 flex-1 rounded-md border border-line bg-field px-3 text-sm text-ink outline-none focus:border-signal"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            type="email"
            value={email}
          />
          <button
            className="rounded-md bg-signal px-4 py-2 text-sm font-semibold text-canvas disabled:opacity-60"
            disabled={isBusy || !email}
            onClick={sendMagicLink}
            type="button"
          >
            Send sign-in link
          </button>
        </div>
        {message ? <p className="mt-4 text-sm text-muted">{message}</p> : null}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-signal">Builder profile</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Create or edit your public profile</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          New and edited profiles are saved as pending by default so the directory can stay focused and calm.
        </p>
      </div>

      <section className="grid gap-4 rounded-lg border border-line bg-panel p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={form.full_name} onChange={(value) => setForm({ ...form, full_name: value })} />
          <Field label="Slug" value={form.slug} onChange={(value) => setForm({ ...form, slug: value })} placeholder="your-name" />
        </div>
        <Field label="Headline" value={form.headline} onChange={(value) => setForm({ ...form, headline: value })} />
        <TextArea label="Bio" value={form.bio} onChange={(value) => setForm({ ...form, bio: value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Location" value={form.location} onChange={(value) => setForm({ ...form, location: value })} />
          <Field label="Timezone" value={form.timezone} onChange={(value) => setForm({ ...form, timezone: value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Languages" value={form.languages} onChange={(value) => setForm({ ...form, languages: value })} placeholder="English, Portuguese" />
          <Field label="Skills" value={form.skills} onChange={(value) => setForm({ ...form, skills: value })} placeholder="TypeScript, AI workflows" />
          <Field label="Interests" value={form.interests} onChange={(value) => setForm({ ...form, interests: value })} placeholder="Observability, orchestration" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="GitHub URL" value={form.github_url} onChange={(value) => setForm({ ...form, github_url: value })} />
          <Field label="LinkedIn URL" value={form.linkedin_url} onChange={(value) => setForm({ ...form, linkedin_url: value })} />
          <Field label="Portfolio URL" value={form.portfolio_url} onChange={(value) => setForm({ ...form, portfolio_url: value })} />
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted">
          <label className="flex items-center gap-2">
            <input checked={form.open_to_collaboration} onChange={(event) => setForm({ ...form, open_to_collaboration: event.target.checked })} type="checkbox" />
            Open to collaboration
          </label>
          <label className="flex items-center gap-2">
            <input checked={form.open_to_opportunities} onChange={(event) => setForm({ ...form, open_to_opportunities: event.target.checked })} type="checkbox" />
            Open to opportunities
          </label>
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-line bg-panel p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Projects</h2>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm text-ink hover:border-signal/60"
            onClick={() => setProjects([...projects, { name: "", description: "", url: "", tags: "" }])}
            type="button"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
        {projects.map((project, index) => (
          <div className="grid gap-3 rounded-md border border-line bg-field p-4" key={project.id ?? index}>
            <div className="flex justify-end">
              <button className="text-muted hover:text-ink" onClick={() => setProjects(projects.filter((_, projectIndex) => projectIndex !== index))} type="button">
                <Trash2 size={17} />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" value={project.name} onChange={(value) => updateProject(index, "name", value)} />
              <Field label="URL" value={project.url} onChange={(value) => updateProject(index, "url", value)} />
            </div>
            <TextArea label="Description" value={project.description} onChange={(value) => updateProject(index, "description", value)} />
            <Field label="Tags" value={project.tags} onChange={(value) => updateProject(index, "tags", value)} placeholder="automation, observability" />
          </div>
        ))}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="inline-flex items-center gap-2 rounded-md bg-signal px-4 py-2 text-sm font-semibold text-canvas disabled:opacity-60"
          disabled={isBusy || !form.full_name || !form.slug}
          onClick={saveProfile}
          type="button"
        >
          <Save size={16} />
          Save profile
        </button>
        {message ? <p className="text-sm text-muted">{message}</p> : null}
        {profileId ? <p className="text-xs text-muted">Profile id: {profileId}</p> : null}
      </div>
    </div>
  );

  function updateProject(index: number, field: keyof ProjectForm, value: string) {
    setProjects(projects.map((project, projectIndex) => (projectIndex === index ? { ...project, [field]: value } : project)));
  }
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="grid gap-2 text-sm text-muted">
      {label}
      <input
        className="h-11 rounded-md border border-line bg-field px-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-signal"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm text-muted">
      {label}
      <textarea
        className="min-h-28 rounded-md border border-line bg-field px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted focus:border-signal"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}
