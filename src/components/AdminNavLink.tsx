"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export function AdminNavLink() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function loadAdminStatus() {
      if (!supabase) {
        return;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setIsAdmin(false);
        return;
      }

      const response = await fetch("/api/admin/status", {
        headers: {
          authorization: `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        setIsAdmin(false);
        return;
      }

      const payload = (await response.json()) as { isAdmin?: boolean };
      setIsAdmin(Boolean(payload.isAdmin));
    }

    loadAdminStatus();

    if (!supabase) {
      return;
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(() => {
      loadAdminStatus();
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (!isAdmin) {
    return null;
  }

  return (
    <Link className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink" href="/admin/profiles">
      Admin
    </Link>
  );
}
