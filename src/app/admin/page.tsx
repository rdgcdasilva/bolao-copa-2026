import { createClient } from "@/lib/supabase/server";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const supabase = await createClient();

  const [{ data: jogos }, { data: participantes }] = await Promise.all([
    supabase.from("jogos").select("*").order("ordem"),
    supabase.from("perfis").select("id, nome, email, is_admin").order("nome"),
  ]);

  return <AdminClient jogos={jogos ?? []} participantes={participantes ?? []} />;
}
