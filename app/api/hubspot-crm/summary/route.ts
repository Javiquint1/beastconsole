import { NextRequest, NextResponse } from "next/server";
import { hubSpotApiError, requireHubSpotClientId } from "@/lib/hubspot-crm/api";
import { getHubSpotCrmDashboard } from "@/lib/hubspot-crm/hubspotCrmService";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(getHubSpotCrmDashboard(requireHubSpotClientId(request)));
  } catch (error) {
    return hubSpotApiError(error);
  }
}
