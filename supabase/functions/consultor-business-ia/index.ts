// @ts-nocheck
/* eslint-disable */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PlanoEstrategico {
  diagnostico: {
    titulo: string;
    resumo: string;
    foco_semana: string;
  };
  missoes: Array<{
    titulo: string;
    descricao: string;
    impacto: string;
  }>;
  scripts: Array<{
    titulo: string;
    canal: string;
    mensagem: string;
  }>;
}

function gerarFallbackInteligente(kpis: any): PlanoEstrategico {
  const mrr = Number(kpis?.mrr || 0);
  const atraso = Number(kpis?.receita_atraso || 0);
  const propostas = Number(kpis?.funil?.propostas_aguardando || 0);
  const expirados = Number(kpis?.funil_convites?.expirados || 0);
  const nome = kpis?.marca?.perfil?.nome?.split(" ")[0] || "Personal";

  return {
    diagnostico: {
      titulo: atraso > 0 ? "Prioridade: Blindar seu Caixa" : "Hora de Acelerar Fechamentos",
      resumo:
        atraso > 0
          ? `Você tem R$ ${atraso.toFixed(2)} em atraso neste mês. Recuperar esse caixa agora protege sua receita fixa de R$ ${mrr.toFixed(2)}.`
          : `Sua operação está com R$ ${mrr.toFixed(2)} de receita fixa mensal e ${kpis?.alunos_ativos || 0} aluno(s) ativo(s). O foco da semana é transformar conversas em contratos assinados.`,
      foco_semana:
        propostas > 0
          ? `Destravar ${propostas} proposta(s) aguardando assinatura`
          : expirados > 0
            ? `Reativar ${expirados} convite(s) expirado(s)`
            : "Gerar 3 novas conversas qualificadas via indicação e Stories",
    },
    missoes: [
      {
        titulo: "Follow-up cirúrgico nos leads quentes",
        descricao: "Envie um áudio curto de 20 segundos para quem demonstrou interesse ou recebeu proposta nos últimos 7 dias.",
        impacto: "Caixa rápido",
      },
      {
        titulo: "Ativar prova social no Instagram",
        descricao: "Use o Estúdio de Cards do MatchBusiness para postar 1 card de autoridade ou depoimento nos Stories com chamada para vaga.",
        impacto: "Atração orgânica",
      },
      {
        titulo: "Check-in de retenção na base ativa",
        descricao: "Mande um feedback personalizado para 3 alunos ativos elogiando a consistência e reforçando o próximo objetivo.",
        impacto: "Retenção e indicação",
      },
    ],
    scripts: [
      {
        titulo: "Destravar Proposta Parada",
        canal: "WhatsApp / Chat",
        mensagem: `Fala! Tudo certo? Vi que você recebeu minha proposta de acompanhamento no MatchTrainer. Ficou alguma dúvida sobre o formato dos treinos ou sobre o início? Quero te ajudar a começar ainda esta semana! Abraço, ${nome}.`,
      },
      {
        titulo: "Reativar Convite Expirado",
        canal: "WhatsApp",
        mensagem: `Oi! Passando para avisar que o código do seu convite no MatchTrainer expirou, mas já deixei sua vaga reservada. Se quiser começar essa semana, me dá um ok aqui que eu gero um novo código em 10 segundos!`,
      },
      {
        titulo: "Pedir Indicação para Aluno Fiel",
        canal: "WhatsApp",
        mensagem: `Tô muito feliz com a sua evolução nos treinos! Abri 2 vagas novas na minha consultoria este mês. Se tiver algum amigo ou familiar querendo treinar sério, me indica o contato dele que eu garanto uma condição especial por vir de você.`,
      },
    ],
  };
}

async function chamarGemini(apiKey: string, prompt: string): Promise<{ plano: PlanoEstrategico | null; erro?: string }> {
  const modelos = ["gemini-2.5-flash", "gemini-2.0-flash"];
  let ultimoErro = "";

  for (const modelo of modelos) {
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.65,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (!resp.ok) {
        const bodyErr = await resp.text();
        ultimoErro = `${modelo} HTTP ${resp.status}: ${bodyErr.slice(0, 180)}`;
        console.error("[consultor-business-ia]", ultimoErro);
        continue;
      }

      const json = await resp.json();
      const textoBruto = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textoBruto) {
        ultimoErro = `${modelo} retornou texto vazio`;
        continue;
      }

      const parsed = JSON.parse(textoBruto.replace(/```json|```/g, "").trim());
      if (parsed?.diagnostico && Array.isArray(parsed?.missoes)) {
        return { plano: parsed };
      }
      ultimoErro = `${modelo} retornou JSON fora do esquema esperado`;
    } catch (e: any) {
      ultimoErro = `${modelo} exceção: ${e?.message || String(e)}`;
      console.error("[consultor-business-ia]", ultimoErro);
    }
  }

  return { plano: null, erro: ultimoErro };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autenticado." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Sessão inválida." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: kpis, error: kpiError } = await supabase.rpc("get_business_kpis");
    if (kpiError || !kpis) {
      throw new Error("Não foi possível carregar os dados do seu negócio.");
    }

    if (!geminiApiKey) {
      console.error("[consultor-business-ia] GEMINI_API_KEY não configurada nas Secrets.");
      return new Response(
        JSON.stringify({ plano: gerarFallbackInteligente(kpis), origem: "fallback", motivo: "missing_key" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resumoDados = {
      nome: kpis?.marca?.perfil?.nome || "Personal",
      receita_fixa_mensal: kpis?.mrr || 0,
      mes_anterior: kpis?.mrr_anterior || 0,
      ticket_medio: kpis?.ticket_medio || 0,
      alunos_ativos: kpis?.alunos_ativos || 0,
      receita_prevista: kpis?.receita_total || 0,
      receita_recebida: kpis?.receita_recebida || 0,
      receita_atraso: kpis?.receita_atraso || 0,
      score_operacional: kpis?.score || 0,
      score_marca: kpis?.marca?.score_marca || 0,
      nota_media: kpis?.marca?.nota_media || 0,
      total_avaliacoes: kpis?.marca?.total_avaliacoes || 0,
      funil_match: kpis?.funil || {},
      funil_convites: kpis?.funil_convites || {},
      alunos_em_risco: (kpis?.alunos_risco || []).length,
    };

    const prompt = `
Você é o Estrategista de Negócios do MatchTrainer, especialista em ajudar Personal Trainers brasileiros a faturar mais, fechar alunos e fortalecer sua marca.

Analise os dados REAIS deste Personal Trainer:
${JSON.stringify(resumoDados)}

Regras:
- Fale em linguagem simples, direta e prática (sem jargões confusos).
- Cite números reais do personal no diagnóstico.
- Crie 3 missões concretas para os próximos 7 dias.
- Crie 2 a 3 scripts naturais de WhatsApp/Instagram adaptados ao maior gargalo real dele hoje.

Retorne APENAS um JSON válido exatamente neste formato:
{
  "diagnostico": {
    "titulo": "Título curto (máx 45 caracteres)",
    "resumo": "2 frases objetivas citando os números reais.",
    "foco_semana": "1 objetivo principal para os próximos 7 dias"
  },
  "missoes": [
    { "titulo": "Ação 1", "descricao": "Como executar em 1 frase concreta.", "impacto": "Ex: Caixa rápido" },
    { "titulo": "Ação 2", "descricao": "Como executar em 1 frase concreta.", "impacto": "Ex: Autoridade" },
    { "titulo": "Ação 3", "descricao": "Como executar em 1 frase concreta.", "impacto": "Ex: Retenção" }
  ],
  "scripts": [
    { "titulo": "Nome do roteiro 1", "canal": "WhatsApp / Chat", "mensagem": "Mensagem pronta e natural." },
    { "titulo": "Nome do roteiro 2", "canal": "WhatsApp / Stories", "mensagem": "Mensagem pronta e natural." }
  ]
}
`;

    const { plano, erro } = await chamarGemini(geminiApiKey, prompt);
    if (!plano) {
      return new Response(
        JSON.stringify({ plano: gerarFallbackInteligente(kpis), origem: "fallback", motivo: erro }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ plano, origem: "gemini" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Erro interno ao gerar estratégia." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});