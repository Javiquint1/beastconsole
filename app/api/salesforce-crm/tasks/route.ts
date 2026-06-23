import { NextRequest, NextResponse } from "next/server";
import { requireSalesforceAdmin, requireSalesforceClientId, salesforceApiError } from "@/lib/salesforce-crm/api";
import { createSalesforceTask, getSalesforceTasks } from "@/lib/salesforce-crm/salesforceCrmService";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ tasks: getSalesforceTasks(requireSalesforceClientId(request)) });
  } catch (error) {
    return salesforceApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    requireSalesforceAdmin(request);
    return NextResponse.json({ task: createSalesforceTask(requireSalesforceClientId(request), await request.json()) });
  } catch (error) {
    return salesforceApiError(error);
  }
}
