/* eslint-disable import/no-unresolved */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as encodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUCKET_BIO = "bioimpedancia-documentos";
const TIMEOUT_MODELO_MS = 22000;

const MODELOS_GEMINI: Array<{ id: string; thinkingLevel?: "minimal" | "low" }> = [
  { id: "gemini-3.8-flash", thinkingLevel: "minimal" },
  { id: "gemini-3.5-flash-lite" },
  { id: "gemini-3.1-flash-lite" },
];

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function sanitizarNumero(valor: unknown, min: number, max: number): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const limpo = typeof valor === "number" ? valor : Number(String(valor).replace(",", ".").replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(limpo)) return null;
  if (limpo < min || limpo > max) return null;
  return Number(limpo.toFixed(2));
}

function sanitizarData(valor: unknown): string | null {
  if (!valor || typeof valor !== "string") return null;
  const str = valor.trim();
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const ano = Number(iso[1]);
    const mes = Number(iso[2]);
    const dia = Number(iso[3]);
    if (ano >= 2015 && ano <= 2035 && mes >= 1 && mes <= 12 && dia >= 1 && dia <= 31) {
      return `${iso[1]}-${iso[2]}-${iso[3]}`;
    }
  }
  const br = str.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (br) {
    const dia = Number(br[1]);
    const mes = Number(br[2]);
    const ano = Number(br[3]);
    if (ano >= 2015 && ano <= 2035 && mes >= 1 && mes <= 12 && dia >= 1 && dia <= 31) {
      return `${br[3]}-${br[2]}-${br[1]}`;
    }
  }
  return null;
}

const PROMPT_EXTRACAO = `Extraia os indicadores visíveis deste exame de bioimpedância (InBody, Tanita, Omron, Avanutri ou similar).

REGRAS:
1. NUNCA invente ou estime valores. Se não estiver explícito e legível, retorne null.
2. Se NÃO for um exame de bioimpedância/composição corporal, retorne "eh_bioimpedancia": false e explique em "motivo_invalido".
3. Diferencie "massa_muscular_esqueletica" (MME/SMM) de "massa_magra" (Massa Livre de Gordura/FFM). Nunca copie uma na outra.
4. Números puros com ponto decimal (sem kg, %, L, kcal). Converta lb para kg se necessário.
5. Atenção aos rótulos Braço Direito/Esquerdo e Perna Direita/Esquerda na análise segmentar.
6. Não retorne nome, CPF ou dados pessoais do paciente.

Retorne APENAS JSON neste formato exato:
{
  "eh_bioimpedancia": true,
  "motivo_invalido": null,
  "fabricante": null,
  "data_exame": "YYYY-MM-DD ou null",
  "confianca_geral": 0,
  "indicadores": {
    "peso": null,
    "percentual_gordura": null,
    "massa_muscular_esqueletica": null,
    "massa_magra": null,
    "massa_de_gordura": null,
    "agua_corporal": null,
    "gordura_visceral": null,
    "taxa_metabolica_basal": null,
    "imc": null,
    "rcq": null,
    "proteina_kg": null,
    "minerais_kg": null,
    "pontuacao_equipamento": null
  },
  "segmentar": {
    "gord_braco_esq": null,
    "gord_braco_dir": null,
    "gord_tronco": null,
    "gord_perna_esq": null,
    "gord_perna_dir": null,
    "massa_braco_esq": null,
    "massa_braco_dir": null,
    "massa_tronco": null,
    "massa_perna_esq": null,
    "massa_perna_dir": null
  },
  "confianca_campos": {
    "peso": "alta",
    "percentual_gordura": "alta",
    "massa_muscular_esqueletica": "alta",
    "massa_magra": "ausente",
    "massa_de_gordura": "alta",
    "agua_corporal": "alta",
    "gordura_visceral": "alta",
    "taxa_metabolica_basal": "alta",
    "segmentar_gordura": "alta",
    "segmentar_massa": "alta"
  },
  "avisos": []
}`;

async function chamarGeminiMultimodal(apiKey: string, mimeType: string, base64Data: string) {
  let ultimoErro = "Falha desconhecida ao consultar o modelo de IA.";

  for (const cfg of MODELOS_GEMINI) {
    const inicioModelo = Date.now();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${cfg.id}:generateContent`;

    const generationConfig: Record<string, unknown> = {
      responseMimeType: "application/json",
      maxOutputTokens: 1400,
    };

    if (cfg.thinkingLevel) {
      generationConfig.thinkingConfig = { thinkingLevel: cfg.thinkingLevel };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MODELO_MS);

    try {
      console.log(`[ler-bioimpedancia] Tentando ${cfg.id} (${mimeType})...`);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: PROMPT_EXTRACAO },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig,
        }),
        signal: controller.signal,
      });

      const duracao = Date.now() - inicioModelo;

      if (response.ok) {
        const json = await response.json();
        const parts = json?.candidates?.[0]?.content?.parts || [];
        const textoPart =
          parts.find((p: any) => typeof p?.text === "string" && !p?.thought) ||
          parts.find((p: any) => typeof p?.text === "string");
        const texto = textoPart?.text;

        if (!texto) {
          ultimoErro = `O modelo ${cfg.id} retornou resposta vazia (${duracao}ms).`;
          console.warn("[ler-bioimpedancia]", ultimoErro);
          continue;
        }

        console.log(`[ler-bioimpedancia] Sucesso com ${cfg.id} em ${duracao}ms`);
        return { texto, modelo: cfg.id, duracaoMs: duracao };
      }

      const erroTexto = await response.text();
      ultimoErro = `Erro ${response.status} (${cfg.id} em ${duracao}ms): ${erroTexto.slice(0, 220)}`;
      console.warn("[ler-bioimpedancia] Falha:", ultimoErro);

      if (response.status === 401 || response.status === 403) {
        break;
      }
    } catch (err: any) {
      const duracao = Date.now() - inicioModelo;
      if (err?.name === "AbortError") {
        ultimoErro = `Modelo ${cfg.id} excedeu ${TIMEOUT_MODELO_MS / 1000}s sem responder.`;
      } else {
        ultimoErro = `Falha de rede no modelo ${cfg.id} (${duracao}ms): ${err?.message || "erro"}`;
      }
      console.warn("[ler-bioimpedancia]", ultimoErro);
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error(ultimoErro);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let step = "INICIO";
  const inicioTotal = Date.now();

  try {
    step = "AUTENTICACAO";
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ success: false, passo: step, error: "Usuário não autenticado." }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const geminiKey = Deno.env.get("GEMINI_API_KEY")?.trim() || "";

    if (!supabaseUrl || !anonKey || !serviceKey) {
      throw new Error("Variáveis do Supabase ausentes no servidor.");
    }
    if (!geminiKey) {
      throw new Error("Chave GEMINI_API_KEY ausente nos secrets do servidor.");
    }

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authErr,
    } = await supabaseUser.auth.getUser();

    if (authErr || !user) {
      return jsonResponse({ success: false, passo: step, error: "Sessão inválida ou expirada." }, 401);
    }

    step = "VALIDANDO_PAYLOAD";
    const body = await req.json();
    const conexaoId = String(body?.conexao_id || "").trim();
    const storagePath = String(body?.storage_path || "").trim();
    const mimeType = String(body?.mime_type || "application/pdf").trim().toLowerCase();

    if (!conexaoId || !storagePath) {
      return jsonResponse({ success: false, passo: step, error: "Informe conexao_id e storage_path." }, 400);
    }

    if (storagePath.includes("..") || !storagePath.startsWith(`${conexaoId}/`)) {
      return jsonResponse({ success: false, passo: step, error: "Caminho de arquivo não autorizado." }, 403);
    }

    const mimesPermitidos = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!mimesPermitidos.includes(mimeType)) {
      return jsonResponse({ success: false, passo: step, error: "Formato de arquivo não suportado." }, 400);
    }

    step = "VALIDANDO_VINCULO";
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const { data: conexao, error: connErr } = await supabaseAdmin
      .from("conexoes")
      .select("id, personal_id, usuario_id")
      .eq("id", conexaoId)
      .maybeSingle();

    if (connErr || !conexao) {
      return jsonResponse({ success: false, passo: step, error: "Vínculo não encontrado." }, 404);
    }

    if (conexao.personal_id !== user.id && conexao.usuario_id !== user.id) {
      return jsonResponse({ success: false, passo: step, error: "Sem permissão para analisar este vínculo." }, 403);
    }

    step = "BAIXANDO_STORAGE";
    const { data: blob, error: downErr } = await supabaseAdmin.storage.from(BUCKET_BIO).download(storagePath);
    if (downErr || !blob) {
      throw new Error(`Não foi possível baixar o arquivo enviado: ${downErr?.message || "arquivo ausente"}`);
    }

    const bytes = new Uint8Array(await blob.arrayBuffer());
    console.log(`[ler-bioimpedancia] Arquivo baixado: ${bytes.byteLength} bytes (${Date.now() - inicioTotal}ms)`);

    if (bytes.byteLength === 0) {
      throw new Error("O arquivo enviado está vazio.");
    }
    if (bytes.byteLength > 8 * 1024 * 1024) {
      throw new Error("O arquivo excede o limite máximo de 8 MB.");
    }

    step = "CONVERTENDO_BASE64";
    const base64Data = encodeBase64(bytes);

    step = "CHAMANDO_GEMINI";
    const { texto, modelo, duracaoMs } = await chamarGeminiMultimodal(geminiKey, mimeType, base64Data);

    step = "PARSEANDO_JSON";
    const jsonMatch = texto.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("A IA não retornou uma estrutura JSON válida.");
    }
    const raw = JSON.parse(jsonMatch[0]);

    const ehBio = Boolean(raw?.eh_bioimpedancia);
    if (!ehBio) {
      return jsonResponse({
        success: true,
        data: {
          eh_bioimpedancia: false,
          motivo_invalido:
            raw?.motivo_invalido ||
            "O documento enviado não parece ser um exame de bioimpedância legível.",
          fabricante: null,
          data_exame: null,
          confianca_geral: 0,
          indicadores: {},
          segmentar: {},
          confianca_campos: {},
          valores_originais: {},
          avisos: Array.isArray(raw?.avisos) ? raw.avisos.slice(0, 8) : [],
          campos_nao_reconhecidos: [],
          modelo_ia: modelo,
          tempo_ms: duracaoMs,
        },
        storage_path: storagePath,
        mime_type: mimeType,
        origem_leitura: mimeType === "application/pdf" ? "ia_pdf" : "ia_imagem",
      });
    }

    step = "SANITIZANDO_INDICADORES";
    const indRaw = raw?.indicadores || {};
    const segRaw = raw?.segmentar || {};

    const indicadores = {
      peso: sanitizarNumero(indRaw.peso, 20, 350),
      percentual_gordura: sanitizarNumero(indRaw.percentual_gordura, 2, 75),
      massa_muscular_esqueletica: sanitizarNumero(indRaw.massa_muscular_esqueletica, 5, 120),
      massa_magra: sanitizarNumero(indRaw.massa_magra, 15, 200),
      massa_de_gordura: sanitizarNumero(indRaw.massa_de_gordura, 1, 200),
      agua_corporal: sanitizarNumero(indRaw.agua_corporal, 10, 120),
      gordura_visceral: sanitizarNumero(indRaw.gordura_visceral, 1, 60),
      taxa_metabolica_basal: sanitizarNumero(indRaw.taxa_metabolica_basal, 500, 6000),
      imc: sanitizarNumero(indRaw.imc, 10, 80),
      rcq: sanitizarNumero(indRaw.rcq, 0.4, 1.6),
      proteina_kg: sanitizarNumero(indRaw.proteina_kg, 2, 40),
      minerais_kg: sanitizarNumero(indRaw.minerais_kg, 0.5, 15),
      pontuacao_equipamento: sanitizarNumero(indRaw.pontuacao_equipamento, 1, 150),
    };

    const segmentar = {
      gord_braco_esq: sanitizarNumero(segRaw.gord_braco_esq, 0, 30),
      gord_braco_dir: sanitizarNumero(segRaw.gord_braco_dir, 0, 30),
      gord_tronco: sanitizarNumero(segRaw.gord_tronco, 0, 100),
      gord_perna_esq: sanitizarNumero(segRaw.gord_perna_esq, 0, 50),
      gord_perna_dir: sanitizarNumero(segRaw.gord_perna_dir, 0, 50),
      massa_braco_esq: sanitizarNumero(segRaw.massa_braco_esq, 0, 30),
      massa_braco_dir: sanitizarNumero(segRaw.massa_braco_dir, 0, 30),
      massa_tronco: sanitizarNumero(segRaw.massa_tronco, 0, 100),
      massa_perna_esq: sanitizarNumero(segRaw.massa_perna_esq, 0, 50),
      massa_perna_dir: sanitizarNumero(segRaw.massa_perna_dir, 0, 50),
    };

    const confiancaGeral = Math.min(100, Math.max(0, Math.round(Number(raw?.confianca_geral) || 0)));

    step = "SUCESSO_FINAL";
    console.log(`[ler-bioimpedancia] Concluído em ${Date.now() - inicioTotal}ms (${modelo})`);
    return jsonResponse({
      success: true,
      data: {
        eh_bioimpedancia: true,
        motivo_invalido: null,
        fabricante: typeof raw?.fabricante === "string" && raw.fabricante.trim() ? raw.fabricante.trim() : null,
        data_exame: sanitizarData(raw?.data_exame),
        confianca_geral: confiancaGeral,
        indicadores,
        segmentar,
        confianca_campos: raw?.confianca_campos && typeof raw.confianca_campos === "object" ? raw.confianca_campos : {},
        valores_originais: {},
        avisos: Array.isArray(raw?.avisos) ? raw.avisos.filter((a: unknown) => typeof a === "string").slice(0, 10) : [],
        campos_nao_reconhecidos: [],
        modelo_ia: modelo,
        tempo_ms: duracaoMs,
      },
      storage_path: storagePath,
      mime_type: mimeType,
      origem_leitura: mimeType === "application/pdf" ? "ia_pdf" : "ia_imagem",
    });
  } catch (error: any) {
    console.error(`[ler-bioimpedancia] Erro em ${step} (${Date.now() - inicioTotal}ms):`, error?.message || error);
    return jsonResponse({
      success: false,
      passo: step,
      error: error?.message || "Não foi possível analisar o documento agora.",
    });
  }
});