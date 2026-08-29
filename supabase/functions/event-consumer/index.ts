// supabase/functions/event-consumer/index.ts

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";
import { processEvent } from "./eventConsumer.ts";
import { DomainEvent } from "../_shared/types.ts";

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.json();
    const event = body.record as DomainEvent;

    if (!event || !event.id) {
      return new Response("Invalid payload", { status: 400 });
    }

    await processEvent(supabaseAdmin, event);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro fatal no event-consumer:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});