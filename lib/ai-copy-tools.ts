export type AiCopyToolId =
  | "social-post"
  | "ad-headline"
  | "email-subject"
  | "promotion-text"
  | "gbp-post";

export type AiCopyTool = {
  id: AiCopyToolId;
  label: string;
  description: string;
};

export type AiCopyInput = {
  businessName: string;
  service: string;
  offer: string;
  tone: string;
  targetAudience: string;
};

export const aiCopyTools: AiCopyTool[] = [
  {
    id: "social-post",
    label: "Social Media Post",
    description: "Create a short post for Facebook, Instagram, or LinkedIn."
  },
  {
    id: "ad-headline",
    label: "Ad Headline",
    description: "Create a punchy paid ad headline."
  },
  {
    id: "email-subject",
    label: "Email Subject Line",
    description: "Create an email subject line for a campaign."
  },
  {
    id: "promotion-text",
    label: "Promotion Text",
    description: "Create a short promotional blurb for your offer."
  },
  {
    id: "gbp-post",
    label: "Google Business Profile Post",
    description: "Create a local search-friendly business post."
  }
];

export function generateAiCopy(toolId: AiCopyToolId, input: AiCopyInput) {
  const businessName = input.businessName.trim() || "Your business";
  const service = input.service.trim() || "your service";
  const offer = input.offer.trim() || "a special offer";
  const tone = input.tone.trim() || "friendly";
  const targetAudience = input.targetAudience.trim() || "local customers";

  switch (toolId) {
    case "social-post":
      return `${businessName} is offering ${offer} on ${service}. If you are one of our ${targetAudience}, contact us today to learn more.`;
    case "ad-headline":
      return `${offer} on ${service} from ${businessName}`;
    case "email-subject":
      return `${businessName}: ${offer} for ${targetAudience}`;
    case "promotion-text":
      return `${businessName} helps ${targetAudience} get more from ${service}. For a limited time, we are offering ${offer}. Reach out today and let us help.`;
    case "gbp-post":
      return `${businessName} is now featuring ${offer} on ${service}. This ${tone} update is perfect for ${targetAudience}. Contact us or visit our profile to get started.`;
    default:
      return `${businessName} is offering ${offer} on ${service}. Contact us today to learn more.`;
  }
}

export function createAiGenerationRecord(
  clientId: string,
  toolId: AiCopyToolId,
  input: AiCopyInput,
  output: string
) {
  const createdAt = new Date().toISOString();

  return {
    id: `ai-${clientId}-${createdAt}`,
    clientId,
    toolId,
    input,
    output,
    createdAt
  };
}
