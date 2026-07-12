"use client";

import { BarChart3, Download, KeyRound, Moon, Search, Settings, Sun, UserPlus } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/business-crawl", label: "Business Search", icon: Search },
  { href: "/export-history", label: "Export History", icon: Download },
  { href: "/team", label: "Manual Users", icon: UserPlus },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

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
        <nav className="mt-6 grid grid-cols-2 gap-2 lg:grid-cols-1">
          {items.map((item) => {
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
      </aside>
      <main className="min-w-0">
        <header className="sticky top-0 z-10 border-b border-line/20 bg-ink/75 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 rounded-md border border-line/20 bg-panel/65 px-3 py-2 text-sm text-muted">
              <Search className="h-4 w-4" />
              Search businesses, contacts, actionables, and exports
            </div>
            <div className="flex items-center gap-2 rounded-md border border-line/20 bg-panel/65 px-3 py-2 text-sm text-muted">
              <KeyRound className="h-4 w-4 text-gold" />
              Manual team login enabled
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
