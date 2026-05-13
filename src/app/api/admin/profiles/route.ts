import { NextResponse } from "next/server";
import { createSupabaseAdminClient, requireAdmin } from "@/lib/admin";

const allowedStatuses = new Set(["approved", "hidden"]);

export async function GET(request: Request) {
  const admin = await requireAdmin(request);

  if (!admin.ok) {
    return NextResponse.json({ error: admin.message }, { status: admin.status });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, slug, full_name, headline, bio, location, timezone, skills, interests, github_url, linkedin_url, portfolio_url, open_to_collaboration, open_to_opportunities, status, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profiles: data ?? [] });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);

  if (!admin.ok) {
    return NextResponse.json({ error: admin.message }, { status: admin.status });
  }

  const body = (await request.json()) as { profileId?: string; status?: string };

  if (!body.profileId || !body.status || !allowedStatuses.has(body.status)) {
    return NextResponse.json({ error: "Choose a valid profile and status." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("profiles").update({ status: body.status }).eq("id", body.profileId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
