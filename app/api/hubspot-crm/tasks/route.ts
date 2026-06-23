import { NextRequest, NextResponse } from "next/server";
import { hubSpotApiError, requireHubSpotAdmin, requireHubSpotClientId } from "@/lib/hubspot-crm/api";
import { createHubSpotTask, getHubSpotTasks } from "@/lib/hubspot-crm/hubspotCrmService";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ tasks: getHubSpotTasks(requireHubSpotClientId(request)) });
  } catch (error) {
    return hubSpotApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    requireHubSpotAdmin(request);
    return NextResponse.json({ task: createHubSpotTask(requireHubSpotClientId(request), await request.json()) });
  } catch (error) {
    return hubSpotApiError(error);
  }
}
