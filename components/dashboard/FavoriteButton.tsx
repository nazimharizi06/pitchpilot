"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function FavoriteButton({ drillId, initialFavorited }: { drillId: string; initialFavorited: boolean }) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setPending(false);
      return;
    }

    if (favorited) {
      await supabase.from("favorite_drills").delete().eq("user_id", user.id).eq("drill_id", drillId);
      setFavorited(false);
    } else {
      await supabase.from("favorite_drills").insert({ user_id: user.id, drill_id: drillId });
      setFavorited(true);
    }
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
        favorited ? "text-rose-500" : "text-zinc-400 hover:text-rose-500"
      }`}
    >
      <Heart className="h-4 w-4" fill={favorited ? "currentColor" : "none"} />
    </button>
  );
}
