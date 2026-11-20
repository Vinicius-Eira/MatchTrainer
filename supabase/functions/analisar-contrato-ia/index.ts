// @ts-nocheck
/* eslint-disable */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const BUCKET_CONTRATOS = "contratos-documentos";
const MAX_FILE_BYTES = 10 * 1024 * 1024; 
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; 
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

function inferMimeType(path: string, headerType?: string | null): string {
  const cleanHeader = (headerType || "").split(";")[0].trim().toLowerCase();
  if (ALLOWED_MIME_TYPES.has(cleanHeader)) return cleanHeader;

  const lower = path.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "";
}

const SYSTEM_PROMPT = `
Você é um assistente de organização documental para Personal Trainers na plataforma MatchTrainer.
Sua função é APENAS assistir na leitura e organização de contratos de prestação de serviços de educação física/treinamento. Você NÃO substitui um advogado nem fornece validação jurídica.

REGRAS OBRIGATÓRIAS (INVIOLÁVEIS):
1. NÃO INVENTE cláusulas, prazos, multas, SLAs, valores ou obrigações que não estejam presentes no material enviado.
2. NÃO MODIFIQUE silenciosamente o significado, porcentagens, datas ou condições originais.
3. NÃO ELIMINE obrigações ou condições do documento original sem avisar explicitamente em "pontos_atencao".
4. Preserve integralmente o sentido original ao organizar o texto em tópicos claros para o modelo do MatchTrainer.
5. Identifique informações relevantes quando presentes no documento: identificação das partes, objeto, serviços prestados, modalidade de atendimento, valores e forma de pagamento, periodicidade, prazos, regras de cancelamento, suspensão/congelamento, obrigações do Personal, obrigações do aluno, rescisão e condições adicionais.
6. Sinalize informações ausentes, incompletas, ilegíveis ou ambíguas em "pontos_atencao".
7. Coloque eventuais recomendações de melhoria APENAS em "sugestoes_opcionais", sempre deixando claro que são sugestões e nunca misturando ao "texto_organizado".
8. Responda SEMPRE em português do Brasil, em JSON válido seguindo exatamente o esquema abaixo.

ESQUEMA JSON OBRIGATÓRIO:
{
  "texto_organizado": "Texto fiel organizado por seções numeradas com base apenas no que consta no documento/texto enviado.",
  "resumo_extraido": {
    "partes": "string ou null",
    "objeto_servicos": "string ou null",
    "modalidade": "string ou null",
    "valores_pagamento": "string ou null",
    "periodicidade_prazos": "string ou null",
    "cancelamento_rescisao": "string ou null",
    "congelamento_pausa": "string ou null"
  },
  "pontos_atencao": [
    "Lista de informações ausentes, ambíguas, trechos pouco legíveis ou cláusulas que exigem revisão manual do Personal."
  ],
  "sugestoes_opcionais": [
    "Sugestões opcionais que NÃO foram inseridas no texto_organizado; o Personal decide se deseja incluir."
  ],
  "aviso_legal": "Esta organização foi gerada por IA apenas como assistência. Não substitui revisão jurídica e deve ser conferida e aprovada pelo Personal Trainer antes do envio."
}
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Configuração do servidor incompleta (variáveis de ambiente)." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autenticado." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Sessão inválida ou expirada." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: personalRow } = await supabaseAdmin
      .from("personals")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!personalRow) {
      return new Response(
        JSON.stringify({ error: "Apenas Personal Trainers podem utilizar a análise de contratos." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const modo = body?.modo === "texto" ? "texto" : "documento";
    const parts: any[] = [];

    if (modo === "documento") {
      const storagePath = String(body?.storage_path || "").trim();

      if (!storagePath || storagePath.includes("..") || !storagePath.startsWith(`${user.id}/`)) {
        return new Response(
          JSON.stringify({ error: "Caminho de documento inválido ou não autorizado." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage
        .from(BUCKET_CONTRATOS)
        .download(storagePath);

      if (downloadError || !fileBlob) {
        return new Response(
          JSON.stringify({ error: "Não foi possível localizar o documento no armazenamento seguro." }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const arrayBuffer = await fileBlob.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        return new Response(
          JSON.stringify({ error: "O arquivo enviado está vazio." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (arrayBuffer.byteLength > MAX_FILE_BYTES) {
        return new Response(
          JSON.stringify({ error: "O arquivo excede o limite máximo de 10 MB." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const mimeType = inferMimeType(storagePath, body?.mime_type || fileBlob.type);
      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        return new Response(
          JSON.stringify({ error: "Formato não suportado. Envie PDF, JPG, PNG ou WEBP." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const base64Data = arrayBufferToBase64(arrayBuffer);

      parts.push({
        text: `${SYSTEM_PROMPT}\n\nAnalise todas as páginas do documento anexo com máxima fidelidade. Se o documento estiver ilegível ou não for um contrato/termo de serviço, informe claramente em "pontos_atencao" sem inventar conteúdo.`,
      });
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data,
        },
      });
    } else {
      const textoManual = String(body?.texto || "").trim();
      if (textoManual.length < 15) {
        return new Response(
          JSON.stringify({ error: "Escreva pelo menos algumas condições antes de solicitar a organização por IA." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (textoManual.length > 30000) {
        return new Response(
          JSON.stringify({ error: "O texto excede o limite suportado para análise (30.000 caracteres)." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      parts.push({
        text: `${SYSTEM_PROMPT}\n\nOrganize o texto redigido pelo Personal abaixo sem inventar novas obrigações nem alterar o sentido original:\n\n--- INÍCIO DO TEXTO ORIGINAL ---\n${textoManual}\n--- FIM DO TEXTO ORIGINAL ---`,
      });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiRes.ok) {
      const errDetail = await geminiRes.text();
      console.error("[analisar-contrato-ia] Gemini error:", geminiRes.status, errDetail);
      return new Response(
        JSON.stringify({ error: `Falha ao processar com IA (HTTP ${geminiRes.status}). Tente novamente.` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiJson = await geminiRes.json();
    const rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return new Response(
        JSON.stringify({ error: "A IA não conseguiu extrair conteúdo legível deste documento." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsed: any;
    try {
      const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return new Response(
        JSON.stringify({ error: "Resposta inesperada da IA. Tente novamente com um arquivo mais nítido." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resultado = {
      texto_organizado: String(parsed?.texto_organizado || "").trim(),
      resumo_extraido: parsed?.resumo_extraido || {},
      pontos_atencao: Array.isArray(parsed?.pontos_atencao) ? parsed.pontos_atencao.map(String) : [],
      sugestoes_opcionais: Array.isArray(parsed?.sugestoes_opcionais) ? parsed.sugestoes_opcionais.map(String) : [],
      aviso_legal:
        String(parsed?.aviso_legal || "").trim() ||
        "Esta organização foi gerada por IA apenas como assistência. Não substitui revisão jurídica e deve ser conferida e aprovada pelo Personal Trainer antes do envio.",
    };

    return new Response(JSON.stringify(resultado), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[analisar-contrato-ia] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Erro interno ao analisar contrato." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});