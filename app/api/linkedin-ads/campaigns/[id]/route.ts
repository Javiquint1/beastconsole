import { NextRequest, NextResponse } from "next/server";
import { linkedInApiError, requireLinkedInAdmin, requireLinkedInClientId } from "@/lib/linkedin-ads/api";
import { deleteLinkedInAdsCampaign, updateLinkedInAdsCampaign } from "@/lib/linkedin-ads/linkedinAdsService";
export async function PUT(r:NextRequest,{params}:{params:Promise<{id:string}>}){try{requireLinkedInAdmin(r);return NextResponse.json({campaign:updateLinkedInAdsCampaign(requireLinkedInClientId(r),(await params).id,await r.json())});}catch(e){return linkedInApiError(e);}}
export async function DELETE(r:NextRequest,{params}:{params:Promise<{id:string}>}){try{requireLinkedInAdmin(r);return NextResponse.json({ok:deleteLinkedInAdsCampaign(requireLinkedInClientId(r),(await params).id)});}catch(e){return linkedInApiError(e);}}
