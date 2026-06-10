import { NextRequest, NextResponse } from "next/server";
import { linkedInApiError, requireLinkedInAdmin, requireLinkedInClientId } from "@/lib/linkedin-ads/api";
import { deleteLinkedInAdsReport, getLinkedInAdsReport, updateLinkedInAdsReport } from "@/lib/linkedin-ads/linkedinAdsService";
export async function GET(r:NextRequest,{params}:{params:Promise<{id:string}>}){try{return NextResponse.json({report:getLinkedInAdsReport(requireLinkedInClientId(r),(await params).id)});}catch(e){return linkedInApiError(e);}}
export async function PUT(r:NextRequest,{params}:{params:Promise<{id:string}>}){try{requireLinkedInAdmin(r);return NextResponse.json({report:updateLinkedInAdsReport(requireLinkedInClientId(r),(await params).id,await r.json())});}catch(e){return linkedInApiError(e);}}
export async function DELETE(r:NextRequest,{params}:{params:Promise<{id:string}>}){try{requireLinkedInAdmin(r);return NextResponse.json({ok:deleteLinkedInAdsReport(requireLinkedInClientId(r),(await params).id)});}catch(e){return linkedInApiError(e);}}
