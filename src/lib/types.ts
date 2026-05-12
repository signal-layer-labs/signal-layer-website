export type ProfileStatus = "pending" | "approved" | "hidden";

export type Project = {
  id: string;
  profile_id: string;
  name: string;
  description: string | null;
  url: string | null;
  tags: string[];
  created_at?: string;
  updated_at?: string;
};

export type BuilderProfile = {
  id: string;
  user_id: string | null;
  slug: string;
  full_name: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  timezone: string | null;
  languages: string[];
  skills: string[];
  interests: string[];
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  open_to_collaboration: boolean;
  open_to_opportunities: boolean;
  status: ProfileStatus;
  created_at?: string;
  updated_at?: string;
  projects?: Project[];
  is_demo?: boolean;
};

export type BuilderFilters = {
  query?: string;
  availability?: "all" | "collaboration" | "opportunities";
};
