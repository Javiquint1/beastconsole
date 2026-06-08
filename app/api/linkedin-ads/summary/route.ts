import { NextRequest, NextResponse } from "next/server";
import { linkedInApiError, requireLinkedInClientId } from "@/lib/linkedin-ads/api";
import { getDemoLinkedInAdsData, getLinkedInAdsCampaigns, getLinkedInAdsReports, getLinkedInAdsSummary, getLinkedInRecommendations } from "@/lib/linkedin-ads/linkedinAdsService";
export async function GET(r:NextRequest){try{const id=requireLinkedInClientId(r),reports=getLinkedInAdsReports(id);if(!reports.length)return NextResponse.json({...getDemoLinkedInAdsData(id),demoMode:true});const campaigns=getLinkedInAdsCampaigns(id);return NextResponse.json({report:reports[0],campaigns,summary:getLinkedInAdsSummary(id),recommendations:getLinkedInRecommendations(campaigns),demoMode:false});}catch(e){return linkedInApiError(e);}}
