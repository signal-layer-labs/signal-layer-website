import type { BuilderProfile } from "./types";

export const demoProfiles: BuilderProfile[] = [
  {
    id: "demo-ada",
    user_id: null,
    slug: "ada-systems",
    full_name: "Ada Systems",
    headline: "Operational AI engineer building workflow orchestration tools",
    bio: "Works on practical automation layers for internal operations, with a focus on reliable handoffs between models, people, and production systems.",
    location: "Berlin, Germany",
    timezone: "CET",
    languages: ["English", "German"],
    skills: ["AI workflows", "TypeScript", "Supabase", "Observability", "Queue design"],
    interests: ["Human-in-the-loop systems", "Backoffice automation", "Evaluation"],
    github_url: "https://github.com/example",
    linkedin_url: "https://www.linkedin.com/in/example",
    portfolio_url: "https://example.com",
    open_to_collaboration: true,
    open_to_opportunities: false,
    status: "approved",
    is_demo: true,
    projects: [
      {
        id: "demo-project-1",
        profile_id: "demo-ada",
        name: "Workflow Control Plane",
        description: "A small orchestration layer for routing AI-assisted operational tasks.",
        url: "https://example.com",
        tags: ["orchestration", "operations"]
      }
    ]
  },
  {
    id: "demo-ren",
    user_id: null,
    slug: "ren-pipeline",
    full_name: "Ren Pipeline",
    headline: "Builder focused on data pipelines, monitoring, and applied systems thinking",
    bio: "Designs production workflows that make messy operational data easier to trust, inspect, and act on.",
    location: "Toronto, Canada",
    timezone: "ET",
    languages: ["English", "Portuguese"],
    skills: ["Python", "Data pipelines", "Postgres", "Monitoring", "Infrastructure"],
    interests: ["Operational maturity", "Internal tools", "Incident review"],
    github_url: "https://github.com/example",
    linkedin_url: null,
    portfolio_url: null,
    open_to_collaboration: true,
    open_to_opportunities: true,
    status: "approved",
    is_demo: true,
    projects: [
      {
        id: "demo-project-2",
        profile_id: "demo-ren",
        name: "Pipeline Health Notes",
        description: "Lightweight checks and weekly review surfaces for fragile business pipelines.",
        url: null,
        tags: ["observability", "data"]
      }
    ]
  },
  {
    id: "demo-mira",
    user_id: null,
    slug: "mira-runtime",
    full_name: "Mira Runtime",
    headline: "Systems architect working on scalable internal AI infrastructure",
    bio: "Explores where product workflows, model calls, permissions, and audit trails meet in real deployed systems.",
    location: "Remote",
    timezone: "UTC-3",
    languages: ["English", "Spanish"],
    skills: ["Architecture", "Node.js", "Workers", "Security", "API design"],
    interests: ["Model operations", "Auditability", "Platform design"],
    github_url: null,
    linkedin_url: "https://www.linkedin.com/in/example",
    portfolio_url: "https://example.com",
    open_to_collaboration: false,
    open_to_opportunities: true,
    status: "approved",
    is_demo: true,
    projects: []
  }
];
