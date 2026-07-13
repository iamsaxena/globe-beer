import { PageHeader } from "@/components/layout/page-header";
import { IntegrationStatus } from "@/components/settings/integration-status";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Control center" title="Settings" description="Manage Namahmi Labs branding, Google Sheets connection, web crawler sources, and production keys." />
      <IntegrationStatus />
      <div className="grid gap-5 lg:grid-cols-2">
        {["Powered By", "Theme", "Google Sheets Connection", "Crawler Sources"].map((title) => (
          <section key={title} className="rounded-lg border border-line/20 bg-panel/80 p-5 backdrop-blur-xl">
            <h2 className="text-lg font-semibold">{title}</h2>
            <div className="mt-4 rounded-md border border-line/20 bg-ink/35 px-4 py-3 text-sm text-muted">
              {title === "Theme" ? "Dark and light modes enabled" : title === "Google Sheets Connection" ? "Connect free Google account" : title === "Crawler Sources" ? "Google Maps Places, public web, and OSM/Overpass" : "Namahmi Labs Pvt. Ltd."}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
