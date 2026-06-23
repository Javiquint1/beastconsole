import { NextRequest, NextResponse } from "next/server";
import { hubSpotApiError, requireHubSpotAdmin, requireHubSpotClientId } from "@/lib/hubspot-crm/api";
import { createHubSpotContact, getHubSpotContacts } from "@/lib/hubspot-crm/hubspotCrmService";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ contacts: getHubSpotContacts(requireHubSpotClientId(request)) });
  } catch (error) {
    return hubSpotApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    requireHubSpotAdmin(request);
    return NextResponse.json({ contact: createHubSpotContact(requireHubSpotClientId(request), await request.json()) });
  } catch (error) {
    return hubSpotApiError(error);
  }
}
