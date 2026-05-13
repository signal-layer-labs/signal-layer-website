import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "./supabase";

type AdminCheck =
  | {
      ok: true;
      email: string;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined) {
  return Boolean(email && getAdminEmails().includes(email.toLowerCase()));
}

export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin environment is not configured.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export async function requireAdmin(request: Request): Promise<AdminCheck> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return { ok: false, status: 401, message: "Sign in before opening admin tools." };
  }

  const adminEmails = getAdminEmails();

  if (!adminEmails.length) {
    return { ok: false, status: 403, message: "Admin emails are not configured." };
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return { ok: false, status: 500, message: "Supabase auth environment is not configured." };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  const {
    data: { user },
    error
  } = await supabase.auth.getUser(token);
  const email = user?.email?.toLowerCase();

  if (error || !email) {
    return { ok: false, status: 401, message: "Your session could not be verified." };
  }

  if (!adminEmails.includes(email)) {
    return { ok: false, status: 403, message: "You do not have access to admin profile review." };
  }

  return { ok: true, email };
}

export async function getAdminStatus(request: Request) {
  const admin = await requireAdmin(request);

  if (!admin.ok) {
    return { isAdmin: false };
  }

  return { isAdmin: true };
}
