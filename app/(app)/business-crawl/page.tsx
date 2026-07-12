import { CrawlWorkspace } from "@/components/crawl/crawl-workspace";
import { PageHeader } from "@/components/layout/page-header";

export default function BusinessCrawlPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Public business intelligence"
        title="Business Search"
        description="Fetch web leads from Google Maps or free public sources, assign an agent, write actionables, save for future follow-up, and export."
      />
      <CrawlWorkspace />
    </div>
  );
}
