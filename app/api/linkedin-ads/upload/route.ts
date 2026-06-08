import { NextRequest, NextResponse } from "next/server";
import { linkedInApiError, requireLinkedInAdmin, requireLinkedInClientId } from "@/lib/linkedin-ads/api";
import { importLinkedInAdsCsv } from "@/lib/linkedin-ads/linkedinAdsService";
export async function POST(r:NextRequest){try{requireLinkedInAdmin(r);const b=await r.json() as {csvData?:string;fileName?:string};if(!b.csvData)return NextResponse.json({error:"CSV data is required."},{status:400});return NextResponse.json({upload:importLinkedInAdsCsv(requireLinkedInClientId(r),b.csvData,b.fileName)});}catch(e){return linkedInApiError(e);}}
