import React from "react";
import type { LucideIcon } from "lucide-react";

const tones = {
  mint: "text-mint bg-mint/10",
  sky: "text-sky bg-sky/10",
  coral: "text-coral bg-coral/10"
};

export function MetricCard({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: keyof typeof tones }) {
  return (
    <div className="rounded-lg border border-line/20 bg-panel/80 p-5 backdrop-blur-xl">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-md ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}
