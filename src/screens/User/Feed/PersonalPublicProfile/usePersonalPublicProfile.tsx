import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import * as Linking from "expo-linking";
import { supabase } from "../../../../services/supabase";

export type AbaVitrine = "resultados" | "autoridade" | "depoimentos";
export type CategoriaPublicacao = "todos" | "resultado" | "treino" | "certificado" | "espaco";

export interface PublicacaoVitrine {
  id: string;
  imagem_url: string;
  categoria: "resultado" | "treino" | "certificado" | "espaco";
  titulo?: string | null;
  legenda?: string | null;
  metrica_destaque?: string | null;
  fixado?: boolean;
  criado_em?: string;
  origemLegada?: boolean;
}

export interface DestaqueStory {
  id: string;
  titulo: string;
  icone: string;
  subtitulo: string;
  conteudo: string;
}

export interface FormacaoItem {
  id: string;
  titulo: string;
  instituicao: string;
  ano?: string;
}

export interface VitrineConfig {
  destaques?: DestaqueStory[];
  formacoes?: FormacaoItem[];
  depoimentos_fixados?: string[];
  metodo_titulo?: string;
  metodo_descricao?: string;
  diferenciais_lista?: string[];
}

export const formatarLocalizacaoPremium = (cidade?: string, bairro?: string) => {
  if (!cidade && !bairro) return "Atendimento Online";
  if (bairro && cidade) return `${bairro.trim()}, ${cidade.trim()}`;
  if (bairro) return bairro.trim();
  return cidade?.trim() || "Atendimento Online";
};

export const getEspecialidadeInfo = (tag: string) => {
  const t = tag.toLowerCase();
  if (t.includes("hipertrofia")) return { icon: "dumbbell", title: "Hipertrofia", desc: "Treinos estruturados para ganho de massa e volume muscular." };
  if (t.includes("emagrecimento")) return { icon: "fire-alt", title: "Emagrecimento", desc: "Metodologia focada em perda de gordura e definição." };
  if (t.includes("saude") || t.includes("saúde") || t.includes("qualidade")) return { icon: "heartbeat", title: "Saúde & Qualidade", desc: "Foco em condicionamento, energia e bem-estar diário." };
  if (t.includes("performance") || t.includes("rendimento")) return { icon: "bolt", title: "Performance", desc: "Treinamento direcionado para força, TAF e esportes." };
  if (t.includes("gestante") || t.includes("gravidez")) return { icon: "baby", title: "Gestantes & Pós-parto", desc: "Acompanhamento seguro e adaptado para cada fase." };
  if (t.includes("idoso") || t.includes("longevidade")) return { icon: "walking", title: "Longevidade", desc: "Atenção à mobilidade, autonomia e fortalecimento articular." };
  if (t.includes("lesão") || t.includes("lesao") || t.includes("dor") || t.includes("reabilitação")) return { icon: "band-aid", title: "Lesões & Reabilitação", desc: "Cuidado técnico focado em fortalecimento seguro sem dor." };
  if (t.includes("médica") || t.includes("medica") || t.includes("clínica") || t.includes("clinica")) return { icon: "notes-medical", title: "Acompanhamento Clínico", desc: "Prescrição alinhada a condições clínicas específicas." };
  if (t.includes("cardio") || t.includes("coração")) return { icon: "heart-broken", title: "Cardiopatias", desc: "Exercício monitorado com segurança cardiovascular." };
  if (t.includes("hiperten") || t.includes("pressão")) return { icon: "tachometer-alt", title: "Hipertensão", desc: "Controle de intensidade para estabilidade pressórica." };
  if (t.includes("diabet") || t.includes("glicemia")) return { icon: "tint", title: "Diabetes", desc: "Manejo metabólico e glicêmico através do treino." };
  if (t.includes("postura") || t.includes("coluna") || t.includes("joelho") || t.includes("ombro")) {
    return { icon: "shield-alt", title: tag.charAt(0).toUpperCase() + tag.slice(1), desc: "Fortalecimento específico e alinhamento biomecânico." };
  }
  return { icon: "bullseye", title: tag.charAt(0).toUpperCase() + tag.slice(1), desc: "Acompanhamento especializado com foco nesta necessidade." };
};

const MAPA_DNA: Record<string, string> = {
  motivador: "Motivador e Energético",
  tecnico: "Técnico e Analítico",
  militar: "Direto e Disciplinado",
  empatico: "Acolhedor e Parceiro",
  leve: "Cobrança Leve (Hábito)",
  moderada: "Cobrança Equilibrada",
  rigorosa: "Alta Demanda e Metas",
  pontual: "Acompanhamento Pontual",
  frequente: "Check-ins Semanais",
  proximo: "Contato Quase Diário",
};

export function usePersonalPublicProfile(route: any, navigation: any) {
  const { personalId: pId, id, matchPreCalculado, fromDashboard } = route.params || {};
  const personalId = id || pId;

  const [personal, setPersonal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(Boolean(fromDashboard));
  const [abaAtiva, setAbaAtiva] = useState<AbaVitrine>("resultados");

  const [notaMedia, setNotaMedia] = useState<number>(0);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [publicacoes, setPublicacoes] = useState<PublicacaoVitrine[]>([]);
  const [destaqueAberto, setDestaqueAberto] = useState<DestaqueStory | null>(null);

  const [statusConexao, setStatusConexao] = useState<string | null>(null);
  const [modalPropostaVisivel, setModalPropostaVisivel] = useState(false);
  const [propostaPendente, setPropostaPendente] = useState<any>(null);
  const [modalMatchVisivel, setModalMatchVisivel] = useState(false);

  const [precoExibido, setPrecoExibido] = useState("--");
  const [labelPrecoExibido, setLabelPrecoExibido] = useState("A partir de");

  const carregarPerfilCompleto = useCallback(async () => {
    if (!personalId) {
      Alert.alert("Erro", "ID do profissional não encontrado.");
      navigation.goBack();
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const ehDono = Boolean(fromDashboard || (user && user.id === personalId));
      setIsOwner(ehDono);

      const [reqPersonal, reqNota, reqAvaliacoes, reqPubs] = await Promise.all([
        supabase.from("personals").select("*").eq("id", personalId).single(),
        supabase.rpc("get_media_avaliacoes", { p_id: personalId }),
        supabase
          .from("avaliacoes")
          .select("id, nota, comentario, criado_em, usuarios(nome)")
          .eq("personal_id", personalId)
          .order("criado_em", { ascending: false })
          .limit(20),
        supabase
          .from("personal_publicacoes")
          .select("*")
          .eq("personal_id", personalId)
          .order("fixado", { ascending: false })
          .order("criado_em", { ascending: false }),
      ]);

      if (reqPersonal.error) throw reqPersonal.error;
      const prof = reqPersonal.data;
      setPersonal(prof);
      setNotaMedia(Number(reqNota.data || 0));
      setAvaliacoes(reqAvaliacoes.data || []);

      const pubsTabela: PublicacaoVitrine[] = !reqPubs.error && Array.isArray(reqPubs.data) ? reqPubs.data : [];
      const urlsExistentes = new Set(pubsTabela.map((p) => p.imagem_url));
      const legadas: PublicacaoVitrine[] = Array.isArray(prof.galeria_fotos)
        ? prof.galeria_fotos
          .filter((url: string) => url && !urlsExistentes.has(url))
          .map((url: string, idx: number) => ({
            id: `legacy-${idx}`,
            imagem_url: url,
            categoria: "resultado" as const,
            titulo: "Resultado de Acompanhamento",
            legenda: "Evolução registrada no portfólio do treinador.",
            origemLegada: true,
          }))
        : [];
      setPublicacoes([...pubsTabela, ...legadas]);

      const precoDefault = prof.preco_consultoria || prof.preco_presencial || prof.preco_medio || "--";
      setPrecoExibido(String(precoDefault));
      setLabelPrecoExibido(prof.preco_consultoria ? "Consultoria/mês" : "Por aula");

      if (user && !ehDono) {
        const { data: connData } = await supabase
          .from("conexoes")
          .select("id, status")
          .eq("usuario_id", user.id)
          .eq("personal_id", personalId)
          .order("atualizado_em", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (connData) {
          setStatusConexao(connData.status);
          if (connData.status === "aguardando_aluno") {
            const { data: plano } = await supabase
              .from("planos")
              .select("*")
              .eq("conexao_id", connData.id)
              .eq("status", "aguardando_assinatura")
              .maybeSingle();
            if (plano) setPropostaPendente(plano);
          }
        }

        const { data: uData } = await supabase.from("usuarios").select("preferencias").eq("id", user.id).maybeSingle();
        const alunoPrefs =
          typeof uData?.preferencias === "string" ? JSON.parse(uData.preferencias) : uData?.preferencias || {};

        const modalidadeAluno = alunoPrefs.servicos_buscados || ["Consultoria", "Presencial"];
        if (modalidadeAluno.includes("Consultoria") && !modalidadeAluno.includes("Presencial") && prof.preco_consultoria) {
          setPrecoExibido(String(prof.preco_consultoria));
          setLabelPrecoExibido("Consultoria/mês");
        } else if (modalidadeAluno.includes("Presencial") && !modalidadeAluno.includes("Consultoria") && prof.preco_presencial) {
          setPrecoExibido(String(prof.preco_presencial));
          setLabelPrecoExibido("Por aula");
        }
      }
    } catch (error) {
      console.error("Erro ao carregar perfil público:", error);
      Alert.alert("Erro", "Perfil indisponível no momento.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [personalId, fromDashboard, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      carregarPerfilCompleto();
    });
    return unsubscribe;
  }, [navigation, carregarPerfilCompleto]);

  const assinarContrato = async () => {
    setLoading(true);
    try {
      if (!propostaPendente) throw new Error("Proposta não encontrada.");
      await supabase.from("planos").update({ status: "ativo" }).eq("id", propostaPendente.id);
      await supabase.from("conexoes").update({ status: "aluno_ativo" }).eq("id", propostaPendente.conexao_id);
      setModalPropostaVisivel(false);

      navigation.reset({
        index: 0,
        routes: [{ name: "AlunoDashboard", params: { conexaoId: propostaPendente.conexao_id } }],
      });
    } catch {
      Alert.alert("Erro", "Falha ao aceitar a proposta.");
    } finally {
      setLoading(false);
    }
  };

  const handleContato = async (tipo: "whatsapp" | "chat") => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return Alert.alert("Aviso", "Crie uma conta para falar com o personal.");

      const { data: conexoes, error: errBusca } = await supabase
        .from("conexoes")
        .select("id, status, criado_em, atualizado_em")
        .eq("usuario_id", user.id)
        .eq("personal_id", personal.id);

      if (errBusca) throw errBusca;

      let bloqueado = false;
      let horasRestantes = 0;
      let conexaoExistente = null;

      if (conexoes && conexoes.length > 0) {
        conexoes.sort(
          (a, b) => new Date(b.atualizado_em || b.criado_em).getTime() - new Date(a.atualizado_em || a.criado_em).getTime()
        );
        conexaoExistente = conexoes[0];

        if (conexaoExistente.status === "inativo" || conexaoExistente.status === "recusado") {
          const dataCancelamento = new Date(conexaoExistente.atualizado_em || conexaoExistente.criado_em);
          const diffHoras = Math.abs(Date.now() - dataCancelamento.getTime()) / 36e5;
          if (diffHoras < 24) {
            bloqueado = true;
            horasRestantes = Math.ceil(24 - diffHoras);
          }
        }
      }

      if (bloqueado) {
        Alert.alert(
          "Ação Bloqueada",
          `Você encerrou a parceria com este profissional recentemente.\n\nAguarde ${horasRestantes} hora(s) antes de enviar nova solicitação.`
        );
        return;
      }

      setModalMatchVisivel(false);

      if (tipo === "whatsapp") {
        if (!conexaoExistente) {
          await supabase.from("conexoes").insert([{ usuario_id: user.id, personal_id: personal.id, status: "em_contato" }]);
        } else if (conexaoExistente.status === "inativo" || conexaoExistente.status === "recusado") {
          await supabase.from("conexoes").update({ status: "em_contato" }).eq("id", conexaoExistente.id);
        }
        const numLimpo = personal.telefone?.replace(/\D/g, "");
        const url = `whatsapp://send?phone=55${numLimpo}&text=Olá ${personal.nome}! Encontrei seu perfil no MatchTrainer e gostaria de tirar algumas dúvidas.`;
        Linking.openURL(url).catch(() => Alert.alert("Erro", "WhatsApp não instalado."));
      } else {
        let conexaoIdFinal = conexaoExistente?.id;
        if (!conexaoExistente) {
          const { data: novaConexao, error: erroCriar } = await supabase
            .from("conexoes")
            .insert([{ usuario_id: user.id, personal_id: personal.id, status: "pendente" }])
            .select("id")
            .single();
          if (erroCriar) throw erroCriar;
          conexaoIdFinal = novaConexao.id;
        } else if (conexaoExistente.status === "inativo" || conexaoExistente.status === "recusado") {
          await supabase.from("conexoes").update({ status: "pendente" }).eq("id", conexaoIdFinal);
        }

        navigation.navigate("Chat", {
          conexaoId: conexaoIdFinal,
          nomeOutro: personal.nome,
          fotoOutro: personal.foto_url,
          tipoUsuarioLogado: "aluno",
        });
      }
    } catch (error) {
      console.log("Erro no contato:", error);
      Alert.alert("Erro", "Não foi possível iniciar o contato. Tente novamente.");
    }
  };

  const abrirRedeSocial = (tipo: "instagram" | "tiktok", handle: string) => {
    const clean = String(handle || "").replace(/^@/, "").trim();
    if (!clean) return;
    const url = tipo === "instagram" ? `https://instagram.com/${clean}` : `https://tiktok.com/@${clean}`;
    Linking.openURL(url).catch(() => Alert.alert("Erro", "Não foi possível abrir o link."));
  };

  let especialidades: any = {};
  let vitrineConfig: VitrineConfig = {};
  if (personal) {
    try {
      especialidades =
        typeof personal.especialidades === "string" ? JSON.parse(personal.especialidades) : personal.especialidades || {};
    } catch { }
    try {
      vitrineConfig =
        typeof personal.vitrine_config === "string" ? JSON.parse(personal.vitrine_config) : personal.vitrine_config || {};
    } catch { }
  }

  const todasAsTags = personal
    ? [...(especialidades?.objetivos || []), ...(especialidades?.limitacoes || []), ...(especialidades?.subs || [])].filter(
      (tag) => tag && tag !== "nenhuma" && tag !== "outro" && tag !== "outra"
    )
    : [];

  const locaisAtendimento: string[] = Array.isArray(especialidades?.locais) ? especialidades.locais : [];

  const dnaAtendimento = [
    especialidades?.estiloComunicacao && {
      label: "Comunicação",
      valor: MAPA_DNA[especialidades.estiloComunicacao] || especialidades.estiloComunicacao,
      icon: "chatbubbles-outline",
    },
    especialidades?.cobranca && {
      label: "Cobrança",
      valor: MAPA_DNA[especialidades.cobranca] || especialidades.cobranca,
      icon: "flame-outline",
    },
    especialidades?.acompanhamento && {
      label: "Contato",
      valor: MAPA_DNA[especialidades.acompanhamento] || especialidades.acompanhamento,
      icon: "calendar-outline",
    },
  ].filter(Boolean) as { label: string; valor: string; icon: string }[];

  const fotoPerfil =
    personal?.foto_url || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600";
  const capaUrl = personal?.capa_url || null;
  const modalidadesAtendidas: string[] =
    Array.isArray(personal?.servicos_oferecidos) && personal.servicos_oferecidos.length > 0
      ? personal.servicos_oferecidos
      : ["Consultoria"];
  const isPoucasVagas = personal?.status_agenda === "Poucas Vagas" || personal?.status_agenda === "Quase Lotada";

  const destaquesPersonalizados = Array.isArray(vitrineConfig.destaques) ? vitrineConfig.destaques : [];
  const destaquesExibidos: DestaqueStory[] =
    destaquesPersonalizados.length > 0
      ? destaquesPersonalizados
      : [
        {
          id: "auto-metodo",
          titulo: "Meu Método",
          icone: "flame",
          subtitulo: "Como eu trabalho",
          conteudo:
            vitrineConfig.metodo_descricao ||
            personal?.descricao ||
            "Treinamento individualizado focado na sua rotina, segurança articular e evolução progressiva.",
        },
        {
          id: "auto-modalidades",
          titulo: "Planos",
          icone: "wallet",
          subtitulo: "Formatos de Atendimento",
          conteudo: `Atendimento via ${modalidadesAtendidas.join(" e ")}.\n\n${personal?.preco_consultoria ? `• Consultoria Online: a partir de R$ ${personal.preco_consultoria}/mês\n` : ""
            }${personal?.preco_presencial ? `• Presencial: a partir de R$ ${personal.preco_presencial}/aula` : ""}`,
        },
        ...(locaisAtendimento.length > 0
          ? [
            {
              id: "auto-locais",
              titulo: "Locais",
              icone: "location",
              subtitulo: formatarLocalizacaoPremium(personal?.cidade, personal?.bairro),
              conteudo: `Atendimento presencial em: ${locaisAtendimento.join(", ")}.`,
            },
          ]
          : []),
        {
          id: "auto-exp",
          titulo: "Carreira",
          icone: "ribbon",
          subtitulo: personal?.cref ? `CREF ${personal.cref}` : "Profissional Registrado",
          conteudo: `${personal?.tempo_experiencia || "Experiência comprovada"} ajudando alunos a alcançarem resultados reais com consistência.`,
        },
      ];

  const formacoes: FormacaoItem[] = Array.isArray(vitrineConfig.formacoes) ? vitrineConfig.formacoes : [];
  const depoimentosFixadosIds: string[] = Array.isArray(vitrineConfig.depoimentos_fixados)
    ? vitrineConfig.depoimentos_fixados
    : [];

  return {
    state: {
      isOwner,
      fromDashboard: Boolean(fromDashboard),
      loading,
      personal,
      abaAtiva,
      notaMedia,
      avaliacoes,
      publicacoes,
      destaquesExibidos,
      destaqueAberto,
      formacoes,
      depoimentosFixadosIds,
      vitrineConfig,
      dnaAtendimento,
      modalMatchVisivel,
      statusConexao,
      propostaPendente,
      modalPropostaVisivel,
      precoExibido,
      labelPrecoExibido,
      matchPreCalculado,
      especialidades,
      todasAsTags,
      fotoPerfil,
      capaUrl,
      modalidadesAtendidas,
      isPoucasVagas,
      locaisAtendimento,
    },
    actions: {
      setAbaAtiva,
      setDestaqueAberto,
      setModalMatchVisivel,
      setModalPropostaVisivel,
      handleContato,
      abrirRedeSocial,
      assinarContrato,
      recarregar: carregarPerfilCompleto,
    },
  };
}