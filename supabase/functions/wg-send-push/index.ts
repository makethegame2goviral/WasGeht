import { createClient } from "npm:@supabase/supabase-js@2.57.0";
import { send } from "jsr:@daaku/webpush@0.2.0";

const APP_ORIGIN = "https://wasgeht-app.wasgeht.workers.dev";
const cors = {
  "Access-Control-Allow-Origin": APP_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
  });
}

function readKey(name: string, dictionaryName?: string): string | undefined {
  const direct = Deno.env.get(name);
  if (direct) return direct;
  if (!dictionaryName) return undefined;
  try {
    const values = JSON.parse(Deno.env.get(dictionaryName) || "{}");
    return values.default;
  } catch {
    return undefined;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authorization = req.headers.get("Authorization") || "";
  if (!authorization.startsWith("Bearer ")) return json({ error: "Anmeldung erforderlich." }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publishableKey = readKey("SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEYS");
  const serviceKey = readKey("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEYS");
  if (!supabaseUrl || !publishableKey || !serviceKey) {
    return json({ error: "Supabase-Serverkonfiguration ist unvollständig." }, 500);
  }

  const userClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const accessToken = authorization.slice("Bearer ".length);
  const { data: userData, error: userError } = await userClient.auth.getUser(accessToken);
  const user = userData?.user;
  if (userError || !user) return json({ error: "Ungültige Anmeldung." }, 401);

  let messageId = "";
  try {
    const body = await req.json();
    messageId = typeof body?.message_id === "string" ? body.message_id : "";
  } catch {
    return json({ error: "Ungültige Anfrage." }, 400);
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(messageId)) {
    return json({ error: "Ungültige Nachrichten-ID." }, 400);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: message, error: messageError } = await admin
    .from("wg_messages")
    .select("id,conversation_id,sender_id,body,message_type")
    .eq("id", messageId)
    .maybeSingle();

  if (messageError || !message) return json({ error: "Nachricht nicht gefunden." }, 404);
  if (message.sender_id !== user.id) return json({ error: "Nicht erlaubt." }, 403);

  const conversationId = message.conversation_id;
  if (!conversationId) return json({ error: "Nachricht hat keinen Chat." }, 400);

  const [{ data: members, error: membersError }, { data: profile }, { data: conversation }, { data: config }] =
    await Promise.all([
      admin.from("wg_conversation_members").select("user_id").eq("conversation_id", conversationId).neq("user_id", user.id),
      admin.from("wg_profiles").select("username").eq("user_id", user.id).maybeSingle(),
      admin.from("wg_conversations").select("title,kind").eq("id", conversationId).maybeSingle(),
      admin.from("wg_push_config").select("vapid_private_jwk,subject").eq("id", 1).maybeSingle(),
    ]);

  if (membersError) return json({ error: "Chat-Mitglieder konnten nicht geladen werden." }, 500);
  if (!config?.vapid_private_jwk) return json({ error: "Push-Schlüssel fehlen auf dem Server." }, 503);

  const recipientIds = [...new Set((members || []).map((m: { user_id: string }) => m.user_id))];
  if (!recipientIds.length) return json({ ok: true, sent: 0, skipped: 0 });

  const { data: settings } = await admin
    .from("wg_conversation_settings")
    .select("user_id,muted")
    .eq("conversation_id", conversationId)
    .in("user_id", recipientIds);
  const muted = new Set((settings || []).filter((s: { muted: boolean }) => s.muted).map((s: { user_id: string }) => s.user_id));
  const targets = recipientIds.filter((id) => !muted.has(id));
  if (!targets.length) return json({ ok: true, sent: 0, skipped: recipientIds.length });

  const { data: subscriptions, error: subscriptionsError } = await admin
    .from("wg_push_subscriptions")
    .select("id,user_id,subscription")
    .in("user_id", targets);
  if (subscriptionsError) return json({ error: "Push-Abonnements konnten nicht geladen werden." }, 500);
  if (!subscriptions?.length) return json({ ok: true, sent: 0, skipped: recipientIds.length });

  const rawBody = String(message.body || "");
  const isVideoCall = rawBody === "__WG_CALL_INVITE_VIDEO__" || rawBody === "__WG_GROUP_CALL_INVITE_VIDEO__";
  const isAudioCall = rawBody === "__WG_CALL_INVITE_AUDIO__" || rawBody === "__WG_GROUP_CALL_INVITE_AUDIO__";
  const isCall = isVideoCall || isAudioCall;
  const senderName = profile?.username || "WasGeht";
  const title = conversation?.kind === "group"
    ? String(conversation.title || "Gruppe") + " · " + senderName
    : senderName;
  const notificationBody = isCall
    ? (isVideoCall ? "Eingehender Videoanruf" : "Eingehender Sprachanruf")
    : message.message_type === "image" ? "Hat dir ein Bild gesendet."
    : message.message_type === "video" ? "Hat dir ein Video gesendet."
    : message.message_type === "audio" ? "Hat dir eine Sprachnachricht gesendet."
    : message.message_type === "file" ? "Hat dir eine Datei gesendet."
    : rawBody.slice(0, 140) || "Du hast eine neue Nachricht.";
  const targetUrl = APP_ORIGIN + "/?conversation=" + encodeURIComponent(conversationId) + (isCall ? "&call=1" : "");
  const payload = JSON.stringify({
    title,
    body: notificationBody,
    url: targetUrl,
    timestamp: Date.now(),
    tag: "wg-" + conversationId,
  });

  let sent = 0;
  let failed = 0;
  let removed = 0;
  await Promise.all(subscriptions.map(async (row: { id: string; subscription: unknown }) => {
    try {
      await send(row.subscription as never, payload, {
        vapid: config.vapid_private_jwk,
        subscriber: config.subject || APP_ORIGIN,
        ttl: 120,
        urgency: "high",
      });
      sent++;
    } catch (error) {
      failed++;
      const status = Number((error as { statusCode?: number })?.statusCode || 0);
      if (status === 404 || status === 410) {
        await admin.from("wg_push_subscriptions").delete().eq("id", row.id);
        removed++;
      } else {
        console.warn("Push delivery failed:", status || "unknown");
      }
    }
  }));

  return json({ ok: true, sent, failed, removed, skipped: recipientIds.length - targets.length });
});
