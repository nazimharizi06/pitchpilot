import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { drillsById } from "@/lib/data/drills";
import { FavoriteButton } from "@/components/dashboard/FavoriteButton";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/favorites");

  const { data: favoriteRows } = await supabase
    .from("favorite_drills")
    .select("drill_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const favoritedDrills = (favoriteRows ?? [])
    .map((row) => drillsById[row.drill_id as string])
    .filter((drill): drill is NonNullable<typeof drill> => Boolean(drill));

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-white mb-1">Favorites</h1>
      <p className="text-sm text-zinc-400 mb-8">
        Drills you&apos;ve bookmarked from the{" "}
        <Link href="/drills" className="underline text-emerald-400">
          drill library
        </Link>
        .
      </p>

      {favoritedDrills.length === 0 ? (
        <p className="text-sm text-zinc-400">
          No favorites yet — browse the{" "}
          <Link href="/drills" className="underline text-emerald-400">
            drill library
          </Link>{" "}
          and tap the heart on any drill.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {favoritedDrills.map((drill) => (
            <div key={drill.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm text-white">{drill.name}</h3>
                <p className="text-xs text-zinc-400 mt-1">{drill.instructions}</p>
              </div>
              <FavoriteButton drillId={drill.id} initialFavorited />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
