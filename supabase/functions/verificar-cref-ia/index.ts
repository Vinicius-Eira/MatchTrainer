// @ts-nocheck
/* eslint-disable */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalizarTexto(str: string): string {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizarCref(str: string): string {
  return (str || "").toUpperCase().replace(/[^0-9A-Z]/g, "");
}

function nomesCompativeis(nomeCadastro: string, nomeDocumento: string): boolean {
  const stopWords = new Set(["personal", "trainer", "prof", "professor", "professora", "coach", "de", "da", "do", "dos", "das", "e"]);
  const tokensCad = normalizarTexto(nomeCadastro)
    .split(" ")
    .filter((t) => t.length >= 2 && !stopWords.has(t));
  const tokensDoc = new Set(
    normalizarTexto(nomeDocumento)
      .split(" ")
      .filter((t) => t.length >= 2 && !stopWords.has(t))
  );

  if (tokensCad.length === 0 || tokensDoc.size === 0) return false;

  const acertos = tokensCad.filter((t) => tokensDoc.has(t)).length;
  if (tokensCad.length === 1) return acertos === 1;
  return acertos >= 2 || acertos / tokensCad.length >= 0.6;
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY")!;
    const autoApprove = (Deno.env.get("CREF_AUTO_APPROVE") ?? "true").toLowerCase() === "true";

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authErr,
    } = await userClient.auth.getUser();

    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Sessão inválida." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { storage_path, mime_type, cref_informado, nome_cadastro } = await req.json();

    if (!storage_path || !cref_informado) {
      return new Response(JSON.stringify({ error: "Dados incompletos para verificação." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Impede acesso a arquivos de outro usuário
    if (!String(storage_path).startsWith(`${user.id}/`)) {
      return new Response(JSON.stringify({ error: "Caminho de documento não autorizado." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Garante que o CREF não pertença a outro personal
    const crefLimpo = String(cref_informado).trim().toUpperCase();
    const { data: duplicado } = await adminClient
      .from("personals")
      .select("id")
      .ilike("cref", crefLimpo)
      .neq("id", user.id)
      .maybeSingle();

    if (duplicado) {
      return new Response(JSON.stringify({ error: "Este número de CREF já está vinculado a outra conta." }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Baixa o documento do bucket privado
    const { data: fileBlob, error: dlErr } = await adminClient.storage
      .from("cref-documentos")
      .download(storage_path);

    if (dlErr || !fileBlob) {
      return new Response(JSON.stringify({ error: "Não foi possível ler o arquivo enviado." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bytes = new Uint8Array(await fileBlob.arrayBuffer());
    const base64Data = uint8ToBase64(bytes);

    const prompt = `Você é um auditor documental especializado em Cédulas de Identidade Profissional do Sistema CONFEF/CREF (Conselho Regional de Educação Física do Brasil, física ou CREF Digital).
Analise o documento enviado e responda EXCLUSIVAMENTE um JSON válido com esta estrutura:
{
  "eh_cedula_cref": boolean,
  "legivel": boolean,
  "numero_cref_extraido": string | null,
  "nome_titular_extraido": string | null,
  "categoria": "G" | "P" | "L" | "desconhecida",
  "uf": string | null,
  "validade": string | null,
  "dentro_validade": boolean | null,
  "confianca": number,
  "observacao": string
}
Regras:
- "numero_cref_extraido" deve estar no formato 000000-G/UF (ex: 012345-G/SP) se encontrado.
- "categoria": "G" para Bacharel/Graduado/Plena, "P" para Provisionado, "L" se constar explicitamente apenas Licenciatura (atuação restrita à educação básica).
- Se não for uma cédula/carteira/certidão oficial do CREF/CONFEF, marque "eh_cedula_cref": false.
- "confianca" de 0 a 100 conforme nitidez e clareza dos dados.
- Data atual para checar validade: ${new Date().toISOString().slice(0, 10)}.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mime_type || "image/jpeg",
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.1,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errTxt = await geminiRes.text();
      throw new Error(`Erro na API de IA: ${errTxt}`);
    }

    const geminiJson = await geminiRes.json();
    const rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const parsed = JSON.parse(rawText);

    // Regra de decisão
    let statusFinal: "aprovado" | "em_analise" | "rejeitado" = "em_analise";
    let motivo = "";

    const numeroBate =
      Boolean(parsed.numero_cref_extraido) &&
      normalizarCref(parsed.numero_cref_extraido) === normalizarCref(crefLimpo);

    const nomeBate =
      Boolean(parsed.nome_titular_extraido) &&
      nomesCompativeis(nome_cadastro || "", parsed.nome_titular_extraido);

    if (!parsed.eh_cedula_cref) {
      statusFinal = "rejeitado";
      motivo = "O arquivo enviado não parece ser uma cédula oficial do CREF/CONFEF.";
    } else if (!parsed.legivel || (parsed.confianca ?? 0) < 60) {
      statusFinal = "em_analise";
      motivo = "A imagem está um pouco ilegível. Enviamos para conferência manual rápida (ou você pode reenviar uma foto mais nítida).";
    } else if (parsed.categoria === "L") {
      statusFinal = "rejeitado";
      motivo = "A cédula indica atuação apenas em Licenciatura. Para Personal Trainer é necessário registro Bacharel/Graduado (G) ou Provisionado (P).";
    } else if (parsed.dentro_validade === false) {
      statusFinal = "rejeitado";
      motivo = `A cédula enviada aparenta estar vencida (${parsed.validade || "validade expirada"}). Envie a cédula atualizada ou o CREF Digital.`;
    } else if (parsed.numero_cref_extraido && !numeroBate) {
      statusFinal = "rejeitado";
      motivo = `O número lido na cédula (${parsed.numero_cref_extraido}) não bate com o CREF digitado (${crefLimpo}).`;
    } else if (numeroBate && nomeBate && (parsed.confianca ?? 0) >= 80) {
      if (autoApprove) {
        statusFinal = "aprovado";
        motivo = "Cédula validada com sucesso! Selo CREF Verificado ativado no seu perfil.";
      } else {
        statusFinal = "em_analise";
        motivo = "Pré-validação concluída com sucesso! Aguardando confirmação final da equipe.";
      }
    } else {
      statusFinal = "em_analise";
      motivo = nomeBate
        ? "Documento recebido e enviado para conferência final da equipe."
        : "O nome na cédula difere um pouco do Nome Público do perfil. Enviamos para conferência manual rápida.";
    }

    // Garante que existe linha do personal antes de salvar verificação
    const { data: existePersonal } = await adminClient
      .from("personals")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!existePersonal) {
      await adminClient.from("personals").insert({
        id: user.id,
        email: user.email || "",
        nome: nome_cadastro || "Profissional",
        cref: crefLimpo,
        cref_verificado: statusFinal === "aprovado",
      });
    } else {
      await adminClient
        .from("personals")
        .update({
          cref: crefLimpo,
          cref_verificado: statusFinal === "aprovado",
        })
        .eq("id", user.id);
    }

    await adminClient.from("personal_cref_verificacoes").upsert(
      {
        personal_id: user.id,
        cref_informado: crefLimpo,
        storage_path,
        mime_type: mime_type || "image/jpeg",
        status: statusFinal,
        confianca_ia: Math.round(Number(parsed.confianca || 0)),
        dados_extraidos: parsed,
        motivo_recusa: statusFinal === "aprovado" ? null : motivo,
        analisado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: "personal_id" }
    );

    return new Response(
      JSON.stringify({
        status: statusFinal,
        cref_verificado: statusFinal === "aprovado",
        motivo,
        confianca: parsed.confianca ?? 0,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Erro interno ao verificar CREF." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});