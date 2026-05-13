import { createServerClient } from "@supabase/ssr";
import { AdminProfilesManager } from "@/components/admin/AdminProfilesManager";
import { isAdminEmail } from "@/lib/admin";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function AdminProfilesPage() {
  const cookieStore = await cookies();
  const supabase = supabaseUrl && supabaseAnonKey
    ? createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            return;
          }
        }
      })
    : null;
  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!isAdminEmail(user?.email)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-sm uppercase tracking-[0.22em] text-signal">Admin</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Profile review is restricted.</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Sign in with an admin email before reviewing pending builder profiles.
        </p>
        <Link className="mt-6 inline-flex rounded-md bg-signal px-4 py-2 text-sm font-semibold text-canvas" href="/profile/edit">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <AdminProfilesManager />
    </div>
  );
}
