import { NextRequest, NextResponse } from "next/server";

// ============================================================================
// SERVER-SIDE ORDER APPROVAL & META CONVERSIONS API (CAPI) PURCHASE TRIGGER
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const { orderId, itemSlug, amountBdt, customerEmail, customerPhone } = await req.json();

    if (!orderId || !itemSlug) {
      return NextResponse.json({ ok: false, error: "Missing orderId or itemSlug" }, { status: 400 });
    }

    // Fire Server-Side Meta Conversions API (CAPI) Purchase Event if configured
    const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
    const capiToken = process.env.FB_CAPI_ACCESS_TOKEN;
    let capiFired = false;

    if (pixelId && capiToken) {
      try {
        const fbRes = await fetch(
          `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${capiToken}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              data: [
                {
                  event_name: "Purchase",
                  event_time: Math.floor(Date.now() / 1000),
                  action_source: "website",
                  custom_data: {
                    currency: "BDT",
                    value: Number(amountBdt) || 0,
                    content_ids: [itemSlug],
                  },
                },
              ],
            }),
          }
        );
        capiFired = fbRes.ok;
      } catch {
        capiFired = false;
      }
    }

    return NextResponse.json({
      ok: true,
      orderId,
      unlockedSlug: itemSlug,
      customerEmail,
      customerPhone,
      capiFired,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Verification error" },
      { status: 500 }
    );
  }
}
