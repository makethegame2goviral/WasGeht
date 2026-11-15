const APP_ORIGIN = "https://wasgeht-app.wasgeht.workers.dev";
const cors = {
  "Access-Control-Allow-Origin": APP_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Vary": "Origin",
};

Deno.serve((req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const iceServers: Array<Record<string, unknown>> = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ];

  // Optional TURN credentials can be added later as Supabase Function secrets.
  // No Cloudflare service is used for call signaling or media.
  const turnUrls = (Deno.env.get("TURN_URLS") || "").split(",").map((s) => s.trim()).filter(Boolean);
  const turnUsername = Deno.env.get("TURN_USERNAME");
  const turnCredential = Deno.env.get("TURN_CREDENTIAL");
  if (turnUrls.length && turnUsername && turnCredential) {
    iceServers.push({ urls: turnUrls, username: turnUsername, credential: turnCredential });
  }

  return new Response(JSON.stringify({ iceServers }), {
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
});
