"use client";

import { BarChart3, Download, LogOut, Moon, Search, Settings, Sun, UserPlus, UserRound } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/business-crawl", label: "Business Search", icon: Search },
  { href: "/export-history", label: "Export History", icon: Download },
  { href: "/team", label: "Manual Users", icon: UserPlus, adminOnly: true },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/settings", label: "Settings", icon: Settings }
];

type AppShellProps = {
  children: React.ReactNode;
  user?: { name: string; username: string; role: string; profile_pic?: string } | null;
  setupMode?: boolean;
};

export function AppShell({ children, user, setupMode = false }: AppShellProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };
  const visibleItems = items.filter((item) => !item.adminOnly || user?.role === "Admin");

  return (
    <div className="min-h-screen text-text lg:grid lg:grid-cols-[300px_1fr]">
      <aside className="border-b border-line/20 bg-panel/78 p-4 shadow-glow backdrop-blur-xl lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-2 py-3">
          <Image className="rounded-lg border border-gold/40 object-cover shadow-glow" src="/brand/globe-logo.png" alt="Globe by Namahmi Labs Pvt. Ltd." width={56} height={56} priority />
          <div>
            <p className="text-xl font-bold tracking-normal">Globe</p>
            <p className="text-xs text-muted">Powered by Namahmi Labs Pvt. Ltd.</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-line/20 bg-ink/45 p-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Lead Generation</p>
          <p className="mt-2 text-sm text-muted">Simple compliant crawling workflow with mandatory contact numbers and export-ready results.</p>
        </div>
        <div className="mt-3 rounded-lg border border-line/20 bg-ink/45 p-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">{setupMode ? "Setup Mode" : "Signed In"}</p>
          <p className="mt-2 text-sm font-semibold">{user?.name ?? "Owner setup access"}</p>
          <p className="text-xs text-muted">{user ? `@${user.username} · ${user.role}` : "Create the first manual user to enable login."}</p>
        </div>
        <nav className="mt-6 grid grid-cols-2 gap-2 lg:grid-cols-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted transition hover:bg-ink/35 hover:text-text",
                  active && "border border-gold/30 bg-gold/10 text-text"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </a>
            );
          })}
        </nav>
        <button
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-line/20 bg-ink/35 px-3 py-2.5 text-sm text-text"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          type="button"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "Light Theme" : "Dark Theme"}
        </button>
        {user && (
          <button
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-line/20 bg-ink/35 px-3 py-2.5 text-sm text-muted hover:text-text"
            onClick={logout}
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        )}
      </aside>
      <main className="min-w-0">
        <header className="sticky top-0 z-10 border-b border-line/20 bg-ink/75 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 rounded-md border border-line/20 bg-panel/65 px-3 py-2 text-sm text-muted">
              <Search className="h-4 w-4" />
              Search businesses, contacts, actionables, and exports
            </div>
            <div className="flex items-center gap-2 rounded-md border border-line/20 bg-panel/65 px-3 py-2 text-sm text-muted">
              {user?.profile_pic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.profile_pic} alt={user.name} className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <UserRound className="h-4 w-4 text-gold" />
              )}
              <span className="font-medium text-text">{user?.name ?? "Setup Access"}</span>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
