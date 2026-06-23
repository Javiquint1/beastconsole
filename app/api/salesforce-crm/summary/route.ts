import { NextRequest, NextResponse } from "next/server";
import { requireSalesforceClientId, salesforceApiError } from "@/lib/salesforce-crm/api";
import { getSalesforceCrmDashboard } from "@/lib/salesforce-crm/salesforceCrmService";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(getSalesforceCrmDashboard(requireSalesforceClientId(request)));
  } catch (error) {
    return salesforceApiError(error);
  }
}
