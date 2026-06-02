import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import JogosClient from "./JogosClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function JogosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: jogos }, { data: palpites }, { data: perfil }] = await Promise.all([
    supabase.from("jogos").select("*").order("data_hora", { ascending: true }),
    supabase.from("palpites").select("*").eq("user_id", user.id),
    supabase.from("perfis").select("*").eq("id", user.id).single(),
  ]);

  return (
    <JogosClient
      jogosIniciais={jogos ?? []}
      palpitesIniciais={palpites ?? []}
      userId={user.id}
      perfil={perfil}
    />
  );
}
