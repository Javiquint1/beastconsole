import type { ClientAccount, DashboardBlock, MarketingBlock } from "./types";
import { getDashboardBlockStatus } from "./access-control";

export const marketingBlocks: MarketingBlock[] = [
  {
    id: "google-ads",
    name: "Google Ads Pulse",
    category: "Ads",
    paid: true,
    description: "Track spend, conversions, CPA, and next optimization moves."
  },
  {
    id: "meta-ads",
    name: "Meta Ads Manager",
    category: "Ads",
    paid: true,
    description: "Review Facebook and Instagram ad performance."
  },
  {
    id: "tiktok-ads",
    name: "TikTok Ads Manager",
    category: "Ads",
    paid: true,
    description: "Review TikTok ad performance and reporting."
  },
  {
    id: "email",
    name: "Email Campaign Builder",
    category: "Email",
    paid: true,
    description: "Plan a campaign, target a segment, and draft the send."
  },
  {
    id: "free-ai",
    name: "Free AI Idea Lab",
    category: "AI",
    paid: false,
    description: "Generate quick marketing angles and subject lines."
  }
];

export function getBlockName(id: MarketingBlock["id"]) {
  return marketingBlocks.find((block) => block.id === id)?.name ?? id;
}

export function getClientDashboardBlocks(client: ClientAccount): DashboardBlock[] {
  const enabledBlocks: DashboardBlock[] = [
    {
      id: "google-ads",
      title: "Google Ads",
      description: "View and manage your Google Ads information.",
      status: getBlockStatus(client, "google-ads"),
      route: "/dashboard"
    },
    {
      id: "email-marketing",
      title: "Email Marketing",
      description: "Review campaign ideas, audiences, and email drafts.",
      status: getBlockStatus(client, "email"),
      route: "/dashboard"
    },
    {
      id: "meta-ads",
      title: "Meta Ads Manager",
      description: "View Facebook and Instagram campaign reports.",
      status: getBlockStatus(client, "meta-ads"),
      route: "/dashboard"
    },
    {
      id: "tiktok-ads",
      title: "TikTok Ads Manager",
      description: "View TikTok campaign performance and reports.",
      status: getBlockStatus(client, "tiktok-ads"),
      route: "/dashboard"
    },
    {
      id: "free-ai",
      title: "Free AI",
      description: "Generate quick campaign ideas and content angles.",
      status: getBlockStatus(client, "free-ai"),
      route: "/dashboard"
    }
  ];

  const futureBlocks: DashboardBlock[] = [
    {
      id: "seo-reports",
      title: "SEO Reports",
      description: "Organic visibility and ranking reports.",
      status: "coming-soon",
      route: "/dashboard/seo-reports"
    },
    {
      id: "social-planner",
      title: "Social Planner",
      description: "Content calendar and post planning tools.",
      status: "coming-soon",
      route: "/dashboard/social-planner"
    },
    {
      id: "lead-inbox",
      title: "Lead Inbox",
      description: "Centralized lead and follow-up tracking.",
      status: "coming-soon",
      route: "/dashboard/lead-inbox"
    }
  ];

  return [...enabledBlocks, ...futureBlocks];
}

function getBlockStatus(
  client: ClientAccount,
  blockId: MarketingBlock["id"]
): DashboardBlock["status"] {
  const block = marketingBlocks.find((item) => item.id === blockId);
  return getDashboardBlockStatus(client, blockId, Boolean(block?.paid));
}
