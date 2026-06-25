export type SemrushKeyword = {
  id: string;
  keyword: string;
  intent: "Informational" | "Commercial" | "Transactional" | "Navigational";
  position: number;
  previousPosition: number;
  volume: number;
  traffic: number;
  url: string;
};

export type SemrushCompetitor = {
  domain: string;
  visibility: number;
  sharedKeywords: number;
  competitorKeywords: number;
  paidKeywords: number;
  backlinks: number;
};

export type SemrushBacklink = {
  domain: string;
  authorityScore: number;
  links: number;
  toxic: boolean;
  anchor: string;
};

export type SemrushSiteAuditIssue = {
  id: string;
  severity: "Error" | "Warning" | "Notice";
  issue: string;
  pages: number;
};

export type SemrushKeywordGap = {
  keyword: string;
  competitor: string;
  competitorPosition: number;
  clientPosition: number | null;
  volume: number;
};

export type SemrushVisibilityPoint = {
  month: string;
  visibility: number;
  trafficEstimate: number;
};

export type SemrushSeoSummary = {
  topRankingKeywords: number;
  keywordsGained: number;
  keywordsLost: number;
  trackedKeywords: number;
  siteAuditScore: number;
  backlinkCount: number;
  toxicBacklinks: number;
  keywordGaps: number;
  domainVisibility: number;
  organicTrafficEstimate: number;
  paidSearchCompetitors: number;
};
