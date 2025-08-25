export async function POST(request) {
  try {
    const body = await request.json();
    const email = body?.email;

    if (!email) {
      return Response.json({ message: "Email is required" }, { status: 400 });
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return Response.json({ message: "Invalid email format" }, { status: 400 });
    }

    const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
    const PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

    if (!BEEHIIV_API_KEY || !PUBLICATION_ID) {
      console.error("Missing environment variables", {
        beehiivApiKey: !!BEEHIIV_API_KEY,
        publicationId: !!PUBLICATION_ID
      });
      return Response.json({ message: "Configuration error" }, { status: 500 });
    }

    const url = `https://api.beehiiv.com/v2/publications/${PUBLICATION_ID}/subscriptions`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${BEEHIIV_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const contentType = resp.headers.get("content-type") || "";
    let payload;
    try {
      if (contentType.includes("application/json")) {
        payload = await resp.json();
      } else {
        payload = await resp.text();
      }
    } catch (_) {
      payload = null;
    }

    if (resp.ok) {
      // Forward JSON or a simple success message
      return Response.json(payload || { message: "Subscribed" }, { status: resp.status });
    } else {
      const message = (payload && typeof payload === "object" && payload.message)
        ? payload.message
        : (typeof payload === "string" && payload) || "Subscription failed";
      return Response.json({ message }, { status: resp.status });
    }
  } catch (err) {
    console.error("beehiiv POST error", { error: err.message, stack: err.stack });
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
