import { CrawlWorkspace } from "@/components/crawl/crawl-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { currentSessionUser } from "@/lib/server/session";
import { redirect } from "next/navigation";

export default async function BusinessCrawlPage() {
  const user = await currentSessionUser();
  if (!user) redirect("/login");
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Public business intelligence"
        title="Business Search"
        description="Fetch NearMe leads from Google Maps, save local agent remarks, and export agent-ready reports."
      />
      <CrawlWorkspace user={user} />
    </div>
  );
}
