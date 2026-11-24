import { supabase } from "../supabase";

export type TipoConsentimento = "termos_uso" | "dados_saude_match";

export const VERSAO_LGPD_ATUAL = "2.0";

export const RESUMO_FINALIDADE_SAUDE =
  "Autorizo o tratamento opcional dos meus dados de saúde (lesões, dores, gestação ou condições clínicas) exclusivamente para filtrar personal trainers aptos no MatchTrainer e exibir essas informações apenas aos profissionais com quem eu iniciar conexão.";

export interface RegistroConsentimento {
  id: string;
  tipo_consentimento: string;
  versao_termos: string;
  concedido: boolean;
  aceito_em: string;
  revogado_em: string | null;
  origem: string | null;
  resumo_finalidade: string | null;
}

export interface CompartilhamentoPersonal {
  conexaoId: string;
  status: string;
  atualizadoEm: string | null;
  personalId: string;
  personalNome: string;
  personalCidade: string | null;
}

const SUBS_CLINICOS_SAUDE = ["Hipertensão", "Diabetes", "Obesidade"];

export async function registrarConsentimentoLGPD(params: {
  tipo: TipoConsentimento;
  concedido: boolean;
  origem: string;
  resumoFinalidade?: string;
}): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado.");

  const { error } = await supabase.from("termos_aceitos").insert([
    {
      usuario_id: user.id,
      versao_termos: VERSAO_LGPD_ATUAL,
      tipo_consentimento: params.tipo,
      concedido: params.concedido,
      revogado_em: params.concedido ? null : new Date().toISOString(),
      origem: params.origem,
      resumo_finalidade: params.resumoFinalidade || null,
    },
  ]);

  if (error) throw error;
}

export async function buscarMeusConsentimentosLGPD(): Promise<RegistroConsentimento[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("termos_aceitos")
    .select("id, tipo_consentimento, versao_termos, concedido, aceito_em, revogado_em, origem, resumo_finalidade")
    .eq("usuario_id", user.id)
    .order("aceito_em", { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data || []) as RegistroConsentimento[];
}

export async function buscarPersonalsComAcesso(): Promise<CompartilhamentoPersonal[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("conexoes")
    .select("id, status, atualizado_em, personal_id, personals(nome, cidade)")
    .eq("usuario_id", user.id)
    .in("status", ["pendente", "em_contato", "aguardando_personal", "aguardando_assinatura", "aguardando_aluno", "aluno_ativo"])
    .order("atualizado_em", { ascending: false });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    conexaoId: row.id,
    status: row.status,
    atualizadoEm: row.atualizado_em || null,
    personalId: row.personal_id,
    personalNome: row.personals?.nome || "Profissional",
    personalCidade: row.personals?.cidade || null,
  }));
}

export async function revogarConsentimentoSaudeLGPD(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado.");

  const agoraIso = new Date().toISOString();

  await supabase
    .from("termos_aceitos")
    .update({ concedido: false, revogado_em: agoraIso })
    .eq("usuario_id", user.id)
    .eq("tipo_consentimento", "dados_saude_match")
    .eq("concedido", true);

  await registrarConsentimentoLGPD({
    tipo: "dados_saude_match",
    concedido: false,
    origem: "perfil_aluno_revogacao",
    resumoFinalidade: "Titular revogou o consentimento de tratamento de dados sensíveis de saúde no Match.",
  });

  const { data: usuarioAtual, error: errBusca } = await supabase
    .from("usuarios")
    .select("preferencias")
    .eq("id", user.id)
    .single();

  if (errBusca) throw errBusca;

  const prefsAtuais =
    typeof usuarioAtual?.preferencias === "string"
      ? JSON.parse(usuarioAtual.preferencias)
      : usuarioAtual?.preferencias || {};

  const subsObjLimpos = Array.isArray(prefsAtuais.subs_objetivos)
    ? prefsAtuais.subs_objetivos.filter((item: string) => !SUBS_CLINICOS_SAUDE.includes(item))
    : [];

  const novasPreferencias = {
    ...prefsAtuais,
    limitacoes: ["nao_informar"],
    subs_limitacoes: [],
    outra_limitacao: null,
    subs_objetivos: subsObjLimpos,
    consentimento_saude: false,
    consentimento_saude_revogado_em: agoraIso,
  };

  const { error: errUpdate } = await supabase
    .from("usuarios")
    .update({ preferencias: novasPreferencias })
    .eq("id", user.id);

  if (errUpdate) throw errUpdate;
}