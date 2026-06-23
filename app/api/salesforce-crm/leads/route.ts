import { NextRequest, NextResponse } from "next/server";
import { requireSalesforceAdmin, requireSalesforceClientId, salesforceApiError } from "@/lib/salesforce-crm/api";
import { createSalesforceLead, getSalesforceLeads } from "@/lib/salesforce-crm/salesforceCrmService";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ leads: getSalesforceLeads(requireSalesforceClientId(request)) });
  } catch (error) {
    return salesforceApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    requireSalesforceAdmin(request);
    return NextResponse.json({ lead: createSalesforceLead(requireSalesforceClientId(request), await request.json()) });
  } catch (error) {
    return salesforceApiError(error);
  }
}
