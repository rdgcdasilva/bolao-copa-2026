"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Gamepad2, Shield, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function NavBar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const links = [
    { href: "/jogos", label: "Jogos", icon: Gamepad2 },
    { href: "/ranking", label: "Ranking", icon: Trophy },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 flex-1 py-2 rounded-lg transition",
                active ? "text-[#009c3b]" : "text-gray-400"
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 flex-1 py-2 text-gray-400 rounded-lg"
        >
          <LogOut size={22} strokeWidth={1.8} />
          <span className="text-[10px] font-medium">Sair</span>
        </button>
      </div>
    </nav>
  );
}
