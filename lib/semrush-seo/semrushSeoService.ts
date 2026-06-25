import { demoSemrushBacklinks, demoSemrushCompetitors, demoSemrushKeywordGaps, demoSemrushKeywords, demoSemrushSiteAuditIssues, demoSemrushVisibilityTrend } from "./mock-data";
import type { SemrushKeyword, SemrushSeoSummary } from "./types";

export function getSemrushSeoDashboard(clientId: string) {
  const keywords = demoSemrushKeywords.map((item) => ({ ...item, id: `${clientId}-${item.id}` }));
  const backlinks = demoSemrushBacklinks;
  const siteAuditIssues = demoSemrushSiteAuditIssues;
  const keywordGaps = demoSemrushKeywordGaps;
  const visibilityTrend = demoSemrushVisibilityTrend;

  return {
    keywords,
    competitors: demoSemrushCompetitors,
    backlinks,
    siteAuditIssues,
    keywordGaps,
    visibilityTrend,
    summary: summarizeSeo(keywords),
    demoMode: true
  };
}

function summarizeSeo(keywords: SemrushKeyword[]): SemrushSeoSummary {
  const gained = keywords.filter((item) => item.position < item.previousPosition).length;
  const lost = keywords.filter((item) => item.position > item.previousPosition).length;
  return {
    topRankingKeywords: keywords.filter((item) => item.position <= 10).length,
    keywordsGained: gained,
    keywordsLost: lost,
    trackedKeywords: 284,
    siteAuditScore: 87,
    backlinkCount: 17694,
    toxicBacklinks: 34,
    keywordGaps: demoSemrushKeywordGaps.length,
    domainVisibility: 12.6,
    organicTrafficEstimate: 7040,
    paidSearchCompetitors: demoSemrushCompetitors.filter((item) => item.paidKeywords > 0).length
  };
}
