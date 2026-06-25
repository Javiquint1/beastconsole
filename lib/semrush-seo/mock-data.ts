import type { SemrushBacklink, SemrushCompetitor, SemrushKeyword, SemrushKeywordGap, SemrushSiteAuditIssue, SemrushVisibilityPoint } from "./types";

export const demoSemrushKeywords: SemrushKeyword[] = [
  { id: "kw-1", keyword: "emergency dentist near me", intent: "Transactional", position: 3, previousPosition: 5, volume: 5400, traffic: 860, url: "/emergency-dentist" },
  { id: "kw-2", keyword: "same day dental appointment", intent: "Commercial", position: 5, previousPosition: 8, volume: 1900, traffic: 320, url: "/same-day-appointments" },
  { id: "kw-3", keyword: "teeth cleaning northstar", intent: "Navigational", position: 1, previousPosition: 1, volume: 720, traffic: 260, url: "/hygiene" },
  { id: "kw-4", keyword: "dental implants cost", intent: "Commercial", position: 11, previousPosition: 16, volume: 8100, traffic: 210, url: "/implants" },
  { id: "kw-5", keyword: "tooth pain at night", intent: "Informational", position: 8, previousPosition: 6, volume: 3600, traffic: 180, url: "/blog/tooth-pain-at-night" }
];

export const demoSemrushCompetitors: SemrushCompetitor[] = [
  { domain: "brightsmiles.test", visibility: 18.4, sharedKeywords: 642, competitorKeywords: 1180, paidKeywords: 146, backlinks: 8210 },
  { domain: "urbansmiledental.test", visibility: 14.9, sharedKeywords: 511, competitorKeywords: 890, paidKeywords: 88, backlinks: 5470 },
  { domain: "familydentistryhub.test", visibility: 11.7, sharedKeywords: 438, competitorKeywords: 720, paidKeywords: 42, backlinks: 3980 }
];

export const demoSemrushBacklinks: SemrushBacklink[] = [
  { domain: "localhealthguide.test", authorityScore: 61, links: 18, toxic: false, anchor: "Northstar Dental" },
  { domain: "citywellness.test", authorityScore: 54, links: 11, toxic: false, anchor: "emergency dental care" },
  { domain: "coupon-directory.test", authorityScore: 12, links: 34, toxic: true, anchor: "cheap dentist" },
  { domain: "dentalassociation.test", authorityScore: 72, links: 6, toxic: false, anchor: "member practice" }
];

export const demoSemrushSiteAuditIssues: SemrushSiteAuditIssue[] = [
  { id: "audit-1", severity: "Error", issue: "Broken internal links", pages: 7 },
  { id: "audit-2", severity: "Error", issue: "Missing meta descriptions", pages: 12 },
  { id: "audit-3", severity: "Warning", issue: "Slow mobile pages", pages: 9 },
  { id: "audit-4", severity: "Notice", issue: "Duplicate H1 tags", pages: 5 }
];

export const demoSemrushKeywordGaps: SemrushKeywordGap[] = [
  { keyword: "kids dentist weekend", competitor: "brightsmiles.test", competitorPosition: 4, clientPosition: null, volume: 1600 },
  { keyword: "clear aligners consultation", competitor: "urbansmiledental.test", competitorPosition: 6, clientPosition: 22, volume: 2400 },
  { keyword: "emergency root canal", competitor: "familydentistryhub.test", competitorPosition: 5, clientPosition: 18, volume: 1300 }
];

export const demoSemrushVisibilityTrend: SemrushVisibilityPoint[] = [
  { month: "Jan", visibility: 7.8, trafficEstimate: 4200 },
  { month: "Feb", visibility: 8.6, trafficEstimate: 4680 },
  { month: "Mar", visibility: 9.2, trafficEstimate: 5120 },
  { month: "Apr", visibility: 10.4, trafficEstimate: 5870 },
  { month: "May", visibility: 11.1, trafficEstimate: 6290 },
  { month: "Jun", visibility: 12.6, trafficEstimate: 7040 }
];
