import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkoutBuilder } from "@/components/dashboard/WorkoutBuilder";

export default async function BuildPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/build");

  return <WorkoutBuilder />;
}
