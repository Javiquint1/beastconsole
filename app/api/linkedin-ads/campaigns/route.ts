import { NextRequest, NextResponse } from "next/server";
import { linkedInApiError, requireLinkedInAdmin, requireLinkedInClientId } from "@/lib/linkedin-ads/api";
import { createLinkedInAdsCampaign, getLinkedInAdsCampaigns } from "@/lib/linkedin-ads/linkedinAdsService";
export async function GET(r:NextRequest){try{return NextResponse.json({campaigns:getLinkedInAdsCampaigns(requireLinkedInClientId(r))});}catch(e){return linkedInApiError(e);}}
export async function POST(r:NextRequest){try{requireLinkedInAdmin(r);return NextResponse.json({campaign:createLinkedInAdsCampaign(requireLinkedInClientId(r),await r.json())});}catch(e){return linkedInApiError(e);}}
