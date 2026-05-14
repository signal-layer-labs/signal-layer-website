"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export function ProfileNavLink() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function loadSession() {
      if (!supabase) {
        setIsLoggedIn(false);
        return;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();
      setIsLoggedIn(Boolean(session));
    }

    loadSession();

    if (!supabase) {
      return;
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session));
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <Link className="rounded-md border border-line px-3 py-2 text-ink transition hover:border-signal/60" href="/profile/edit">
      {isLoggedIn ? "Edit profile" : "Join directory"}
    </Link>
  );
}
