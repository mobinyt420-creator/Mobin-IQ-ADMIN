import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// ============================================================================
// SECURE CROSS-SERVER SYNC ENDPOINT (ADMIN PANEL -> MAIN WEBSITE + FIREBASE)
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.ADMIN_SYNC_SECRET || "miq_sync_live_9f8e7d6c5b4a3210";
    const body = await req.json();

    const payloadString = JSON.stringify(body);
    const hmacSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadString)
      .digest("hex");

    const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://mobiniq.com";

    // Optional webhook push to Main Website to trigger instant cache revalidation
    let mainSiteAck = false;
    try {
      const res = await fetch(`${mainSiteUrl}/api/admin-webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-mobiniq-signature": hmacSignature,
        },
        body: payloadString,
      });
      mainSiteAck = res.ok;
    } catch {
      // Main website webhook optional when using shared Firebase Firestore real-time listeners
    }

    return NextResponse.json({
      ok: true,
      hmacSignature,
      mainSiteAck,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Sync error" },
      { status: 500 }
    );
  }
}
