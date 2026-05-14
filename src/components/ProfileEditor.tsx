"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase";
import { isValidExternalUrl } from "@/lib/urls";
import { Github, Plus, Save, Trash2 } from "lucide-react";
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

const maxProjects = 5;

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getProfileRedirectUrl() {
  return new URL("/profile/edit", window.location.origin).toString();
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

function getGithubUrlFromMetadata(metadata: Record<string, unknown> | null | undefined) {
  const username = ["user_name", "preferred_username", "login", "nickname"]
    .map((key) => metadata?.[key])
    .find((value): value is string => typeof value === "string" && /^[a-zA-Z0-9-]+$/.test(value));

  return username ? `https://github.com/${username}` : null;
}

function validateProfile(form: ProfileForm, projects: ProjectForm[]) {
  const errors: string[] = [];

  if (!form.full_name.trim()) {
    errors.push("Full name is required.");
  }

  if (!form.slug.trim()) {
    errors.push("Slug is required.");
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
    errors.push("Slug must use lowercase letters, numbers, and hyphens.");
  }

  if (!form.headline.trim()) {
    errors.push("Headline is required.");
  }

  if (!splitList(form.skills).length) {
    errors.push("Add at least one skill.");
  }

  [
    ["GitHub URL", form.github_url],
    ["LinkedIn URL", form.linkedin_url],
    ["Portfolio URL", form.portfolio_url]
  ].forEach(([label, value]) => {
    if (!isValidExternalUrl(value)) {
      errors.push(`${label} must be a valid URL.`);
    }
  });

  if (projects.length > maxProjects) {
    errors.push(`Add up to ${maxProjects} projects.`);
  }

  projects.forEach((project, index) => {
    const hasProjectContent = [project.name, project.description, project.url, project.tags].some((value) => value.trim());

    if (hasProjectContent && !project.name.trim()) {
      errors.push(`Project ${index + 1} needs a name.`);
    }

    if (project.url.trim() && !isValidExternalUrl(project.url)) {
      errors.push(`Project ${index + 1} URL must be valid.`);
    }
  });

  return errors;
}

export function ProfileEditor() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [projects, setProjects] = useState<ProjectForm[]>([]);
  const [deletedProjectIds, setDeletedProjectIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const normalizedEmail = normalizeEmail(email);
  const hasEmailInput = normalizedEmail.length > 0;
  const canSendEmailLink = !isBusy && isValidEmail(email);
  const emailHelpText = hasEmailInput && !isValidEmail(email) ? "Enter a valid email address to enable the sign-in link." : "Use the email connected to your builder profile.";

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
        const {
          data: { user }
        } = await supabase.auth.getUser();
        const githubUrl = getGithubUrlFromMetadata(user?.user_metadata);

        if (githubUrl) {
          setForm((currentForm) => (currentForm.github_url ? currentForm : { ...currentForm, github_url: githubUrl }));
        }

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
      setDeletedProjectIds([]);
    }

    loadProfile();
  }, [supabase, userId]);

  async function sendMagicLink() {
    if (!supabase) {
      return;
    }

    if (!isValidEmail(email)) {
      setMessage("Enter a valid email address before requesting a sign-in link.");
      return;
    }

    setIsBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: getProfileRedirectUrl()
      }
    });
    setIsBusy(false);
    setMessage(error ? error.message : "Check your email for a sign-in link.");
  }

  async function continueWithGitHub() {
    if (!supabase) {
      return;
    }

    setIsBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: getProfileRedirectUrl()
      }
    });

    if (error) {
      setIsBusy(false);
      setMessage(error.message);
    }
  }

  async function saveProfile() {
    if (!supabase || !userId) {
      return;
    }

    setMessage(null);

    const validationErrors = validateProfile(form, projects);

    if (validationErrors.length) {
      setMessage(validationErrors.join(" "));
      return;
    }

    setIsBusy(true);

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

    if (deletedProjectIds.length) {
      const { error: deleteProjectError } = await supabase.from("projects").delete().in("id", deletedProjectIds);

      if (deleteProjectError) {
        setIsBusy(false);
        setMessage(deleteProjectError.message);
        return;
      }
    }

    const projectPayload = projects
      .filter((project) => [project.name, project.description, project.url, project.tags].some((value) => value.trim()))
      .map((project) => ({
        ...(project.id ? { id: project.id } : {}),
        profile_id: data.id,
        name: project.name.trim(),
        description: project.description.trim() || null,
        url: project.url.trim() || null,
        tags: splitList(project.tags)
      }));

    if (projectPayload.length) {
      const { data: savedProjects, error: projectError } = await supabase
        .from("projects")
        .upsert(projectPayload)
        .select("id, name, description, url, tags");

      if (projectError) {
        setIsBusy(false);
        setMessage(projectError.message);
        return;
      }

      setProjects(
        (savedProjects ?? []).map((project: { id: string; name: string; description: string | null; url: string | null; tags: string[] | null }) => ({
          id: project.id,
          name: project.name ?? "",
          description: project.description ?? "",
          url: project.url ?? "",
          tags: (project.tags ?? []).join(", ")
        }))
      );
    } else {
      setProjects([]);
    }

    setDeletedProjectIds([]);

    setIsBusy(false);
    setMessage("Profile saved. It is pending review before appearing publicly. Edits are reviewed before the profile appears in the directory.");
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
        <button
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:border-signal/60 sm:w-auto"
          disabled={isBusy}
          onClick={continueWithGitHub}
          type="button"
        >
          <Github size={17} />
          Continue with GitHub
        </button>
        <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted">
          <span className="h-px flex-1 bg-line" />
          Email access
          <span className="h-px flex-1 bg-line" />
        </div>
        <form
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start"
          onSubmit={(event) => {
            event.preventDefault();
            sendMagicLink();
          }}
        >
          <div className="grid flex-1 gap-2">
            <input
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              className="h-11 rounded-md border border-line bg-field px-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-signal"
              inputMode="email"
              onBlur={() => setEmail(normalizedEmail)}
              onChange={(event) => {
                setEmail(event.target.value);
                if (message?.startsWith("Enter a valid email")) {
                  setMessage(null);
                }
              }}
              placeholder="you@example.com"
              type="email"
              value={email}
            />
            <p className={`text-xs ${hasEmailInput && !isValidEmail(email) ? "text-signal" : "text-muted"}`}>{emailHelpText}</p>
          </div>
          <button
            aria-disabled={!canSendEmailLink}
            className="h-11 rounded-md bg-signal px-4 py-2 text-sm font-semibold text-canvas transition disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
            disabled={!canSendEmailLink}
            title={!hasEmailInput ? "Enter your email to enable this button." : !isValidEmail(email) ? "Enter a valid email address." : undefined}
            type="submit"
          >
            Send sign-in link
          </button>
        </form>
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
          New profiles and edits are saved as pending. Approved profiles appear publicly in the directory after review.
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Projects</h2>
            <p className="mt-1 text-sm text-muted">Add up to {maxProjects} examples of practical work.</p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md border border-line px-3 py-2 text-sm text-ink hover:border-signal/60 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={projects.length >= maxProjects}
            onClick={() => {
              if (projects.length < maxProjects) {
                setProjects([...projects, { name: "", description: "", url: "", tags: "" }]);
              }
            }}
            type="button"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
        {projects.map((project, index) => (
          <div className="grid gap-3 rounded-md border border-line bg-field p-4" key={project.id ?? index}>
            <div className="flex justify-end">
              <button
                className="text-muted hover:text-ink"
                onClick={() => {
                  if (project.id) {
                    setDeletedProjectIds((currentIds) => [...currentIds, project.id as string]);
                  }
                  setProjects(projects.filter((_, projectIndex) => projectIndex !== index));
                }}
                type="button"
              >
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

      <section className="rounded-lg border border-line bg-panel p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-signal/40 bg-signal/10 px-2.5 py-1 text-xs font-medium text-signal">Pending review preview</span>
          {form.open_to_collaboration ? <span className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">Open to collaboration</span> : null}
          {form.open_to_opportunities ? <span className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">Open to opportunities</span> : null}
        </div>
        <h2 className="text-xl font-semibold text-ink">{form.full_name || "Your name"}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{form.headline || "Your headline will appear here."}</p>
        {form.bio ? <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted">{form.bio}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {splitList(form.skills).length ? (
            splitList(form.skills).map((skill) => (
              <span className="rounded-full border border-line bg-field px-2.5 py-1 text-xs text-muted" key={skill}>
                {skill}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted">Add skills to make the profile easier to find.</span>
          )}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="inline-flex items-center gap-2 rounded-md bg-signal px-4 py-2 text-sm font-semibold text-canvas disabled:opacity-60"
          disabled={isBusy}
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
