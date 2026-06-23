import { NextRequest, NextResponse } from "next/server";
import { requireSalesforceAdmin, requireSalesforceClientId, salesforceApiError } from "@/lib/salesforce-crm/api";
import { createSalesforceOpportunity, getSalesforceOpportunities } from "@/lib/salesforce-crm/salesforceCrmService";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ opportunities: getSalesforceOpportunities(requireSalesforceClientId(request)) });
  } catch (error) {
    return salesforceApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    requireSalesforceAdmin(request);
    return NextResponse.json({ opportunity: createSalesforceOpportunity(requireSalesforceClientId(request), await request.json()) });
  } catch (error) {
    return salesforceApiError(error);
  }
}
