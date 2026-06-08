import { NextResponse } from "next/server";
export async function POST(){return NextResponse.json({available:false,message:"LinkedIn account selection is coming later."},{status:501});}
