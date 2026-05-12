import { demoProfiles } from "./demo-data";
import { createSupabasePublicClient } from "./supabase";
import type { BuilderFilters, BuilderProfile, Project } from "./types";

function normalizeArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  return [];
}

function toProfile(row: Record<string, unknown>, projects: Project[] = []): BuilderProfile {
  return {
    id: String(row.id),
    user_id: row.user_id ? String(row.user_id) : null,
    slug: String(row.slug),
    full_name: String(row.full_name),
    headline: row.headline ? String(row.headline) : null,
    bio: row.bio ? String(row.bio) : null,
    location: row.location ? String(row.location) : null,
    timezone: row.timezone ? String(row.timezone) : null,
    languages: normalizeArray(row.languages),
    skills: normalizeArray(row.skills),
    interests: normalizeArray(row.interests),
    github_url: row.github_url ? String(row.github_url) : null,
    linkedin_url: row.linkedin_url ? String(row.linkedin_url) : null,
    portfolio_url: row.portfolio_url ? String(row.portfolio_url) : null,
    open_to_collaboration: Boolean(row.open_to_collaboration),
    open_to_opportunities: Boolean(row.open_to_opportunities),
    status: (row.status as BuilderProfile["status"]) ?? "pending",
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
    projects
  };
}

function matchesFilter(profile: BuilderProfile, filters?: BuilderFilters) {
  const query = filters?.query?.trim().toLowerCase();
  const availability = filters?.availability ?? "all";

  if (availability === "collaboration" && !profile.open_to_collaboration) {
    return false;
  }

  if (availability === "opportunities" && !profile.open_to_opportunities) {
    return false;
  }

  if (!query) {
    return true;
  }

  const searchable = [
    profile.full_name,
    profile.headline,
    profile.bio,
    ...profile.skills,
    ...profile.interests
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchable.includes(query);
}

export async function getApprovedBuilders(filters?: BuilderFilters) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return demoProfiles.filter((profile) => matchesFilter(profile, filters));
  }

  let query = supabase
    .from("profiles")
    .select("*, projects(*)")
    .eq("status", "approved")
    .order("updated_at", { ascending: false });

  if (filters?.availability === "collaboration") {
    query = query.eq("open_to_collaboration", true);
  }

  if (filters?.availability === "opportunities") {
    query = query.eq("open_to_opportunities", true);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Unable to load builders", error);
    return demoProfiles.filter((profile) => matchesFilter(profile, filters));
  }

  return data.map((row) => toProfile(row, normalizeProjects(row.projects))).filter((profile) => matchesFilter(profile, filters));
}

export async function getBuilderBySlug(slug: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return demoProfiles.find((profile) => profile.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*, projects(*)")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (error || !data) {
    console.error("Unable to load builder profile", error);
    return null;
  }

  return toProfile(data, normalizeProjects(data.projects));
}

function normalizeProjects(value: unknown): Project[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((project) => ({
    id: String(project.id),
    profile_id: String(project.profile_id),
    name: String(project.name),
    description: project.description ? String(project.description) : null,
    url: project.url ? String(project.url) : null,
    tags: normalizeArray(project.tags),
    created_at: project.created_at ? String(project.created_at) : undefined,
    updated_at: project.updated_at ? String(project.updated_at) : undefined
  }));
}
