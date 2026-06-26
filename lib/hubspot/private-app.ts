import "server-only";

import type { HubSpotCompany, HubSpotContact, HubSpotDeal } from "@/lib/hubspot-crm/types";

type HubSpotObjectResponse = {
  results?: HubSpotObject[];
  paging?: { next?: { after?: string } };
  message?: string;
  error?: string;
};

type HubSpotObject = {
  id: string;
  properties?: Record<string, string | null>;
  createdAt?: string;
  updatedAt?: string;
  associations?: Record<string, { results?: Array<{ id: string; type: string }> }>;
};

export function hasHubSpotPrivateToken() {
  return Boolean(process.env.HUBSPOT_ACCESS_TOKEN);
}

export async function fetchHubSpotPrivateAppSnapshot(clientId: string) {
  const [companies, contacts, deals] = await Promise.all([
    fetchCompanies(clientId),
    fetchContacts(clientId),
    fetchDeals(clientId)
  ]);

  return { companies, contacts, deals };
}

async function fetchCompanies(clientId: string): Promise<HubSpotCompany[]> {
  const rows = await fetchAllObjects("companies", [
    "name",
    "domain",
    "industry",
    "city",
    "createdate",
    "hs_lastmodifieddate"
  ]);

  return rows.map((row) => {
    const properties = row.properties || {};
    return {
      id: `hubspot-company-${row.id}`,
      clientId,
      name: value(properties.name) || "Unnamed company",
      domain: value(properties.domain),
      industry: value(properties.industry),
      city: value(properties.city),
      createdAt: dateTime(properties.createdate, row.createdAt),
      updatedAt: dateTime(properties.hs_lastmodifieddate, row.updatedAt)
    };
  });
}

async function fetchContacts(clientId: string): Promise<HubSpotContact[]> {
  const rows = await fetchAllObjects(
    "contacts",
    [
      "firstname",
      "lastname",
      "email",
      "phone",
      "lifecyclestage",
      "hs_analytics_source",
      "createdate",
      "lastmodifieddate",
      "notes_last_updated"
    ],
    ["companies"]
  );

  return rows.map((row) => {
    const properties = row.properties || {};
    return {
      id: `hubspot-contact-${row.id}`,
      clientId,
      firstName: value(properties.firstname) || "Unknown",
      lastName: value(properties.lastname) || "Contact",
      email: value(properties.email),
      phone: value(properties.phone),
      companyId: associationId(row, "companies", "hubspot-company-"),
      lifecycleStage: lifecycleStage(properties.lifecyclestage),
      leadSource: sourceLabel(properties.hs_analytics_source),
      lastActivityAt: dateTime(properties.notes_last_updated, properties.lastmodifieddate, row.updatedAt),
      createdAt: dateTime(properties.createdate, row.createdAt),
      updatedAt: dateTime(properties.lastmodifieddate, row.updatedAt)
    };
  });
}

async function fetchDeals(clientId: string): Promise<HubSpotDeal[]> {
  const rows = await fetchAllObjects(
    "deals",
    [
      "dealname",
      "amount",
      "dealstage",
      "closedate",
      "hs_analytics_source",
      "createdate",
      "hs_lastmodifieddate"
    ],
    ["companies", "contacts"]
  );

  return rows.map((row) => {
    const properties = row.properties || {};
    return {
      id: `hubspot-deal-${row.id}`,
      clientId,
      dealName: value(properties.dealname) || "Unnamed deal",
      companyId: associationId(row, "companies", "hubspot-company-"),
      contactId: associationId(row, "contacts", "hubspot-contact-"),
      amount: Number(properties.amount || 0),
      pipelineStage: pipelineStage(properties.dealstage),
      leadSource: sourceLabel(properties.hs_analytics_source),
      closeDate: dateOnly(properties.closedate),
      createdAt: dateTime(properties.createdate, row.createdAt),
      updatedAt: dateTime(properties.hs_lastmodifieddate, row.updatedAt)
    };
  });
}

async function fetchAllObjects(objectType: string, properties: string[], associations: string[] = []) {
  const records: HubSpotObject[] = [];
  let after: string | undefined;

  do {
    const url = new URL(`https://api.hubapi.com/crm/v3/objects/${objectType}`);
    url.searchParams.set("limit", "100");
    url.searchParams.set("properties", properties.join(","));
    if (associations.length) url.searchParams.set("associations", associations.join(","));
    if (after) url.searchParams.set("after", after);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${getHubSpotAccessToken()}` }
    });
    const data = (await response.json()) as HubSpotObjectResponse;
    if (!response.ok) {
      throw new Error(data.message || data.error || `HubSpot ${objectType} sync failed.`);
    }

    records.push(...(data.results || []));
    after = data.paging?.next?.after;
  } while (after);

  return records;
}

function getHubSpotAccessToken() {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) throw new Error("HUBSPOT_ACCESS_TOKEN is missing.");
  return token;
}

function associationId(row: HubSpotObject, key: string, prefix: string) {
  const id = row.associations?.[key]?.results?.[0]?.id;
  return id ? `${prefix}${id}` : "";
}

function value(input: string | null | undefined) {
  return input || "";
}

function sourceLabel(input: string | null | undefined) {
  if (!input) return "HubSpot";
  return input
    .split("_")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function lifecycleStage(input: string | null | undefined): HubSpotContact["lifecycleStage"] {
  const normalized = (input || "").toLowerCase();
  if (normalized === "marketingqualifiedlead") return "Marketing Qualified Lead";
  if (normalized === "salesqualifiedlead") return "Sales Qualified Lead";
  if (normalized === "customer") return "Customer";
  return "Lead";
}

function pipelineStage(input: string | null | undefined): HubSpotDeal["pipelineStage"] {
  const normalized = (input || "").toLowerCase();
  if (normalized.includes("won")) return "Won";
  if (normalized.includes("lost")) return "Lost";
  if (normalized.includes("proposal")) return "Proposal Sent";
  if (normalized.includes("qualified")) return "Qualified";
  return "New Lead";
}

function dateTime(...values: Array<string | null | undefined>) {
  const value = values.find(Boolean);
  return value ? new Date(value).toISOString() : new Date().toISOString();
}

function dateOnly(value: string | null | undefined) {
  if (!value) return new Date().toISOString().slice(0, 10);
  return value.slice(0, 10);
}
