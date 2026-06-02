import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RankingClient from "./RankingClient";

export default async function RankingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: ranking } = await supabase
    .from("ranking")
    .select("*, perfis(*)")
    .order("total_pontos", { ascending: false })
    .order("acertos_exatos", { ascending: false });

  return <RankingClient rankingInicial={ranking ?? []} userId={user.id} />;
}
