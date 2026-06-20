import { NextRequest, NextResponse } from "next/server";
import {
  META_NONCE_COOKIE,
  canStartMetaOAuth,
  createNonce,
  encodeMetaState,
  getMetaConfig
} from "@/lib/meta/oauth";

export const runtime = "nodejs";

// Meta Developer settings:
// Valid OAuth Redirect URI: https://beastconsole.vercel.app/api/meta/callback
// App domain: beastconsole.vercel.app
// Required scopes: ads_read,business_management
export async function GET(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get("clientId")?.trim();
    if (!clientId) {
      return NextResponse.json({ error: "Missing clientId." }, { status: 400 });
    }

    if (!canStartMetaOAuth(clientId)) {
      return NextResponse.json(
        { error: "Meta/Facebook Ads is not enabled for this client." },
        { status: 403 }
      );
    }

    const config = getMetaConfig();
    const nonce = createNonce();
    const state = encodeMetaState(clientId, nonce);
    const oauthUrl = new URL(`https://www.facebook.com/${config.graphVersion}/dialog/oauth`);
    oauthUrl.searchParams.set("client_id", config.appId);
    oauthUrl.searchParams.set("redirect_uri", config.redirectUri);
    oauthUrl.searchParams.set("response_type", "code");
    oauthUrl.searchParams.set("scope", "ads_read,business_management");
    oauthUrl.searchParams.set("state", state);

    const response = NextResponse.redirect(oauthUrl);
    response.cookies.set(META_NONCE_COOKIE, nonce, {
      httpOnly: true,
      maxAge: 10 * 60,
      path: "/",
      sameSite: "lax",
      secure: config.appUrl.startsWith("https://")
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Meta OAuth could not be started.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
